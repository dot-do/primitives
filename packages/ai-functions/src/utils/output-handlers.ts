import { model } from 'ai-providers'
import { z } from 'zod'
import { createZodSchemaFromObject } from './ai-execution'

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

export async function handleStringOutput(systemPrompt: string, modelName?: string): Promise<string> {
  try {
    const aiModel = getAIProvider(modelName)
    
    const hasCompleteMethod = aiModel && typeof aiModel.complete === 'function'
    
    if (!hasCompleteMethod) {
      return 'This is a default response when environment variables are missing'
    }

    const result = await aiModel.complete({
      prompt: systemPrompt,
    })

    return result.text || 'Error occurred while generating content.'
  } catch (error) {
    console.error('Error in handleStringOutput:', error)
    return 'Error occurred while generating content.'
  }
}

export async function handleArrayOutput(systemPrompt: string, modelName?: string): Promise<string[]> {
  const listSystemPrompt = `${systemPrompt}\n\nRespond with a numbered markdown ordered list.`

  try {
    const aiModel = getAIProvider(modelName)
    
    const hasCompleteMethod = aiModel && typeof aiModel.complete === 'function'
    
    if (!hasCompleteMethod) {
      return ['Default item 1', 'Default item 2', 'Default item 3']
    }

    const result = await aiModel.complete({
      prompt: listSystemPrompt,
    })

    const completeText = result.text || ''

    let items = completeText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => /^\d+\./.test(line))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())

    if (items.length === 0) {
      items = completeText
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && !line.startsWith('#'))
        .map((line: string) => line.replace(/^[-*•]\s*/, '').trim())
    }

    if (items.length === 0) {
      items = completeText
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
    }

    return items
  } catch (error) {
    console.error('Error in handleArrayOutput:', error)
    return []
  }
}

export async function handleObjectOutput(systemPrompt: string, outputSchema: Record<string, any>, modelName?: string): Promise<any> {
  try {
    const zodSchema = createZodSchemaFromObject(outputSchema)
    const aiModel = getAIProvider(modelName)
    
    const hasCompleteMethod = aiModel && typeof aiModel.complete === 'function'
    
    if (!hasCompleteMethod) {
      const fallbackObject: Record<string, any> = {}
      for (const [key, value] of Object.entries(outputSchema)) {
        if (typeof value === 'string') {
          if (value.includes('|')) {
            fallbackObject[key] = value.split('|')[0].trim()
          } else {
            fallbackObject[key] = `Fallback ${key}`
          }
        } else if (Array.isArray(value)) {
          fallbackObject[key] = [`Fallback ${key} item`]
        } else if (typeof value === 'object') {
          fallbackObject[key] = {}
        }
      }
      return fallbackObject
    }

    const enhancedSystemPrompt = `${systemPrompt}\nRespond with valid JSON that matches the requested structure.`
    
    const result = await aiModel.complete({
      prompt: `${systemPrompt}\n\nRespond with a valid JSON object.`,
      system: enhancedSystemPrompt,
    })

    try {
      let jsonText = result.text.trim()
      
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonText = codeBlockMatch[1].trim()
      }
      
      if (!jsonText.startsWith('{') && !jsonText.startsWith('[')) {
        const possibleJson = jsonText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
        if (possibleJson && possibleJson[1]) {
          jsonText = possibleJson[1]
        }
      }
      
      const jsonResponse = JSON.parse(jsonText)
      
      if (zodSchema.parse) {
        try {
          return zodSchema.parse(jsonResponse)
        } catch (parseError) {
          return jsonResponse
        }
      }

      return jsonResponse
    } catch (parseError) {
      const fallbackObject: Record<string, any> = {}

      for (const [key, value] of Object.entries(outputSchema)) {
        if (typeof value === 'string') {
          if (value.includes('|')) {
            fallbackObject[key] = value.split('|')[0].trim()
          } else {
            fallbackObject[key] = `Fallback ${key}`
          }
        } else if (Array.isArray(value)) {
          fallbackObject[key] = [`Fallback ${key} item`]
        } else if (typeof value === 'object') {
          fallbackObject[key] = {}
        }
      }

      return fallbackObject
    }
  } catch (error) {
    console.error('Error in handleObjectOutput:', error)

    const fallbackObject: Record<string, any> = {}

    for (const [key, value] of Object.entries(outputSchema)) {
      if (typeof value === 'string') {
        if (value.includes('|')) {
          fallbackObject[key] = value.split('|')[0].trim()
        } else {
          fallbackObject[key] = `Fallback ${key}`
        }
      } else if (Array.isArray(value)) {
        fallbackObject[key] = [`Fallback ${key} item`]
      } else if (typeof value === 'object') {
        fallbackObject[key] = {}
      }
    }

    return fallbackObject
  }
}  

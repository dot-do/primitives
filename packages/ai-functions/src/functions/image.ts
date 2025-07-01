import { model } from 'ai-providers'
import { generateText } from '../ai'
import { parseTemplate, createUnifiedFunction } from '../utils/template'

export type ImageTemplateFn = (template: TemplateStringsArray, ...values: any[]) => Promise<string>

interface ImageOptions {
  model?: string
  style?: string
  size?: string
  quality?: string
  temperature?: number
  maxTokens?: number
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function imageCore(prompt: string, options: ImageOptions = {}): Promise<string> {
  const aiModel = getAIProvider(options.model)

  const systemPrompt = `Generate a detailed image description for: ${prompt}. Include visual elements, composition, lighting, and style details.`

  const result = await generateText({
    model: aiModel,
    prompt,
    system: systemPrompt,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })
  
  return result.text
}

export const image = createUnifiedFunction<Promise<string>>(
  (prompt: string, options: Record<string, any>) => {
    return imageCore(prompt, options as ImageOptions);
  }
);

import { model } from 'ai-providers'
import { generateText } from '../ai'
import { parseTemplate, createUnifiedFunction } from '../utils/template'

interface UiOptions {
  model?: string
  framework?: 'react' | 'vue' | 'svelte' | 'angular'
  styling?: 'css' | 'tailwind' | 'styled-components' | 'emotion'
  componentType?: 'functional' | 'class'
  temperature?: number
  maxTokens?: number
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function uiCore(description: string, options: UiOptions = {}): Promise<string> {
  const aiModel = getAIProvider(options.model)

  const {
    framework = 'react',
    styling = 'tailwind',
    componentType = 'functional'
  } = options

  const systemPrompt = `You are an expert ${framework} developer. Generate ${componentType} components using ${styling} for styling. Follow best practices and modern patterns.`

  const result = await generateText({
    model: aiModel,
    system: systemPrompt,
    prompt: `Create a ${framework} component for: ${description}`,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })
  
  return result.text
}

export const ui = createUnifiedFunction<Promise<string>>(
  (description: string, options: Record<string, any>) => {
    return uiCore(description, options as UiOptions);
  }
);

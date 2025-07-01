import { model } from 'ai-providers'
import { generateText } from '../ai'
import { parseTemplate, createUnifiedFunction } from '../utils/template'

export type SayTemplateFn = (template: TemplateStringsArray, ...values: any[]) => Promise<string>

interface SayOptions {
  model?: string
  voice?: string
  speed?: number
  temperature?: number
  maxTokens?: number
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function sayCore(text: string, options: SayOptions = {}): Promise<string> {
  const aiModel = getAIProvider(options.model)

  const result = await generateText({
    model: aiModel,
    prompt: text,
    system: 'Convert the following text to speech-friendly format. Make it natural and conversational.',
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })
  
  return result.text
}

export const say = createUnifiedFunction<Promise<string>>(
  (text: string, options: Record<string, any>) => {
    return sayCore(text, options as SayOptions);
  }
);

import { model } from 'ai-providers'
import { generateText } from '../ai'
import { parseTemplate, createUnifiedFunction } from '../utils/template'

interface CodeOptions {
  model?: string
  language?: string
  framework?: string
  style?: 'functional' | 'object-oriented' | 'procedural'
  temperature?: number
  maxTokens?: number
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function codeCore(prompt: string, options: CodeOptions = {}): Promise<string> {
  const aiModel = getAIProvider(options.model)

  const {
    language = 'typescript',
    framework,
    style = 'functional'
  } = options

  let systemPrompt = `You are an expert ${language} developer. Generate clean, well-structured ${style} code.`
  
  if (framework) {
    systemPrompt += ` Use ${framework} framework conventions and best practices.`
  }

  const result = await generateText({
    model: aiModel,
    prompt: `Generate ${language} code for: ${prompt}`,
    system: systemPrompt,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })
  
  return result.text
}

export const code = createUnifiedFunction<Promise<string>>(
  (prompt: string, options: Record<string, any>) => {
    return codeCore(prompt, options as CodeOptions);
  }
);

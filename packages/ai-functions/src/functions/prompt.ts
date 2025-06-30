import { model } from 'ai-providers'
import { generateText } from '../ai'
import { createUnifiedFunction } from '../utils/template'

export interface PromptOptions {
  model?: string
  type?: 'system' | 'user' | 'template'
  role?: string
  task?: string
  context?: string
  examples?: Array<{ input: string; output: string }>
  constraints?: string[]
  format?: 'simple' | 'structured' | 'template'
  temperature?: number
  maxTokens?: number
}

export interface PromptResult {
  text: string
  type: 'system' | 'user' | 'template'
  metadata: {
    model: string
    role?: string
    task?: string
    format: string
  }
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function promptCore(query: string, options: PromptOptions = {}): Promise<PromptResult> {
  const aiModel = getAIProvider(options.model)

  const {
    type = 'user',
    role,
    task,
    context,
    examples = [],
    constraints = [],
    format = 'simple'
  } = options

  let systemPrompt = ''
  
  switch (type) {
    case 'system':
      systemPrompt = `You are an expert prompt engineer specializing in creating effective system prompts for AI assistants. 
Your task is to generate a comprehensive system prompt that clearly defines the AI's role, capabilities, and behavior guidelines.

Key principles:
- Be specific and clear about the AI's role and expertise
- Include behavioral guidelines and constraints
- Define the expected output format and style
- Consider edge cases and safety considerations`
      break
      
    case 'template':
      systemPrompt = `You are an expert prompt engineer specializing in creating reusable prompt templates.
Your task is to generate flexible prompt templates with clear placeholders and variables that can be customized for different use cases.

Key principles:
- Use clear placeholder syntax (e.g., {{variable_name}})
- Include instructions for customization
- Make templates modular and adaptable
- Provide usage examples and guidelines`
      break
      
    case 'user':
    default:
      systemPrompt = `You are an expert prompt engineer specializing in creating effective user prompts for AI interactions.
Your task is to generate clear, specific, and well-structured user prompts that will elicit the best possible responses from AI systems.

Key principles:
- Be specific and detailed in requests
- Use clear, unambiguous language
- Structure requests logically
- Include relevant context and examples when helpful`
      break
  }

  if (role) {
    systemPrompt += `\n\nThe prompt should be designed for an AI acting as: ${role}`
  }

  if (task) {
    systemPrompt += `\n\nThe specific task focus should be: ${task}`
  }

  if (context) {
    systemPrompt += `\n\nAdditional context: ${context}`
  }

  if (examples.length > 0) {
    systemPrompt += `\n\nConsider these examples:\n${examples.map((ex, i) => `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`).join('\n\n')}`
  }

  if (constraints.length > 0) {
    systemPrompt += `\n\nImportant constraints:\n${constraints.map(c => `- ${c}`).join('\n')}`
  }

  let userPrompt = `Generate a ${type} prompt for: ${query}`
  
  if (format === 'structured') {
    userPrompt += `\n\nProvide the prompt in a structured format with clear sections.`
  } else if (format === 'template') {
    userPrompt += `\n\nProvide the prompt as a reusable template with placeholders.`
  }

  const result = await generateText({
    model: aiModel,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })
  
  return {
    text: result.text,
    type,
    metadata: {
      model: options.model || 'gpt-4.1',
      role,
      task,
      format
    }
  }
}

export type PromptTemplateFn = (template: TemplateStringsArray, ...values: any[]) => Promise<PromptResult>

export const prompt = createUnifiedFunction<Promise<PromptResult>>(
  (query: string, options: Record<string, any>) => {
    return promptCore(query, options as PromptOptions);
  }
);

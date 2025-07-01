import { model } from 'ai-providers'
import { generateText } from '../ai'
import { parseTemplate, createUnifiedFunction } from '../utils/template'

export type MarkdownResult = {
  markdown: string
  frontmatter?: Record<string, any>
}

export type MarkdownTemplateFn = (template: TemplateStringsArray, ...values: any[]) => Promise<MarkdownResult>

interface MarkdownOptions {
  model?: string
  includeFrontmatter?: boolean
  temperature?: number
  maxTokens?: number
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function markdownCore(content: string, options: MarkdownOptions = {}): Promise<MarkdownResult> {
  const aiModel = getAIProvider(options.model)

  const systemPrompt = options.includeFrontmatter 
    ? 'Generate well-structured markdown content with YAML frontmatter. Include appropriate headings, formatting, and metadata.'
    : 'Generate well-structured markdown content. Use appropriate headings, formatting, lists, and other markdown features.'

  const result = await generateText({
    model: aiModel,
    system: systemPrompt,
    prompt: content,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })
  
  return {
    markdown: result.text,
    frontmatter: options.includeFrontmatter ? {} : undefined
  }
}

export const markdown = createUnifiedFunction<Promise<MarkdownResult>>(
  (content: string, options: Record<string, any>) => {
    return markdownCore(content, options as MarkdownOptions);
  }
);

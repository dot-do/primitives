import { model } from 'ai-providers'
import { generateText } from '../ai'
import { parseTemplate, createUnifiedFunction } from '../utils/template'

interface MdxOptions {
  model?: string
  includeComponents?: boolean
  frontmatter?: Record<string, any>
  temperature?: number
  maxTokens?: number
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function mdxCore(prompt: string, options: MdxOptions = {}): Promise<string> {
  const aiModel = getAIProvider(options.model)

  const {
    includeComponents = true,
    frontmatter = {}
  } = options

  let systemPrompt = 'Generate MDX content with proper markdown syntax and JSX components.'
  
  if (includeComponents) {
    systemPrompt += ' Include interactive React components where appropriate.'
  }

  if (Object.keys(frontmatter).length > 0) {
    systemPrompt += ' Include YAML frontmatter with the provided metadata.'
  }

  const result = await generateText({
    model: aiModel,
    system: systemPrompt,
    prompt: `Generate MDX content for: ${prompt}`,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })

  let mdxContent = result.text

  if (Object.keys(frontmatter).length > 0) {
    const frontmatterYaml = Object.entries(frontmatter)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n')
    
    mdxContent = `---\n${frontmatterYaml}\n---\n\n${mdxContent}`
  }

  return mdxContent
}

export const mdx = createUnifiedFunction<Promise<string>>(
  (prompt: string, options: Record<string, any>) => {
    return mdxCore(prompt, options as MdxOptions);
  }
);

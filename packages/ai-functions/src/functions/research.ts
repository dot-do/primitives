import { model } from 'ai-providers'
import { generateText } from '../ai'
import { parseTemplate, createUnifiedFunction } from '../utils/template'

export type ResearchResult = {
  text: string
  markdown: string
  citations: string[]
  reasoning: string
}

export type ResearchTemplateFn = (template: TemplateStringsArray, ...values: any[]) => Promise<ResearchResult>

interface ResearchOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function researchCore(query: string, options: ResearchOptions = {}): Promise<ResearchResult> {
  const aiModel = getAIProvider(options.model)

  const result = await generateText({
    model: aiModel,
    prompt: `Research ${query}`,
    system: 'Respond with thorough research including citations and references. Be comprehensive and include multiple perspectives when appropriate.',
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })

  const text = result.text || ''
  const citations: string[] = []
  const reasoning = ''

  const toSuperscript = (num: number): string => {
    const superscriptMap: Record<string, string> = {
      '1': '¹',
      '2': '²',
      '3': '³',
      '4': '⁴',
      '5': '⁵',
      '6': '⁶',
      '7': '⁷',
      '8': '⁸',
      '9': '⁹',
      '0': '⁰',
    }

    return num
      .toString()
      .split('')
      .map((digit) => superscriptMap[digit] || digit)
      .join('')
  }

  let processedText = text
  for (let i = 0; i < citations.length; i++) {
    const citationNumber = i + 1
    const citationRegex = new RegExp(`\\[${citationNumber}\\]`, 'g')
    processedText = processedText.replace(citationRegex, `[ ${toSuperscript(citationNumber)} ](#${citationNumber})`)
  }

  let markdown = processedText + '\n\n'

  if (reasoning) {
    markdown += `
<details>
  <summary>Reasoning</summary>
  ${reasoning}
</details>
`
  }

  return {
    text: processedText,
    markdown,
    citations,
    reasoning,
  }
}

export const research = createUnifiedFunction<Promise<ResearchResult>>(
  (query: string, options: Record<string, any>) => {
    return researchCore(query, options as ResearchOptions);
  }
);

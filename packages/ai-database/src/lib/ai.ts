import { embed, embedMany, generateObject, generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export const model = createOpenAI({
  compatibility: 'compatible',
  apiKey: process.env.AI_GATEWAY_TOKEN!,
  baseURL: process.env.AI_GATEWAY_URL!,
  headers: {
    'HTTP-Referer': 'https://workflows.do', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': 'Workflows.do Business-as-Code', // Optional. Site title for rankings on openrouter.ai.
  },
})

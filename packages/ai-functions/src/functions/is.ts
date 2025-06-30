import { model } from 'ai-providers'
import { z } from 'zod'
import { generateObject } from '../ai'
import { parseTemplate, createUnifiedFunction } from '../utils/template'

const isSchema = z.object({
  answer: z.boolean(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
})

interface IsOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function isCore(question: string, options: IsOptions = {}): Promise<{ answer: boolean; confidence: number; reasoning: string }> {
  const aiModel = getAIProvider(options.model)

  const result = await generateObject({
    model: aiModel,
    prompt: question,
    schema: isSchema,
    system: 'You are an expert evaluator. Answer the given question with a boolean response, confidence score (0-1), and reasoning.',
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })

  return result.object
}

export const is = createUnifiedFunction<Promise<{ answer: boolean; confidence: number; reasoning: string }>>(
  (question: string, options: Record<string, any>) => {
    return isCore(question, options as IsOptions);
  }
);

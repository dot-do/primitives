import { model } from 'ai-providers'
import { z } from 'zod'
import { generateObject } from '../ai'
import { parseTemplate, TemplateFunction, createUnifiedFunction } from '../utils/template'

const schema = z.object({
  entities: z.array(z.object({
    name: z.string(),
    type: z.string(),
    observations: z.array(z.string()),
  })),
  relationships: z.array(z.object({
    from: z.string(),
    type: z.string(),
    to: z.string(),
  })),
})

interface ExtractOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function extractCore(content: string, options: ExtractOptions = {}): Promise<z.infer<typeof schema>> {
  const aiModel = getAIProvider(options.model)

  const result = await generateObject({
    model: aiModel,
    prompt: `Extract entities and relationships from: ${content}`,
    schema,
    system: 'You are an expert in extracting entities and relationships from unstructured content.',
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })

  return result.object
}

export const extract = createUnifiedFunction<Promise<z.infer<typeof schema>>>(
  (content: string, options: Record<string, any>) => {
    return extractCore(content, options as ExtractOptions);
  }
);

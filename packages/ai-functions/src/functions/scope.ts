import { model } from 'ai-providers'
import { z } from 'zod'
import { generateObject } from '../ai'
import { parseTemplate, createUnifiedFunction } from '../utils/template'

const scopeSchema = z.object({
  inScope: z.array(z.string()),
  outOfScope: z.array(z.string()),
  assumptions: z.array(z.string()),
  constraints: z.array(z.string()),
  deliverables: z.array(z.string()),
  successCriteria: z.array(z.string()),
})

interface ScopeOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function scopeCore(projectDescription: string, options: ScopeOptions = {}): Promise<z.infer<typeof scopeSchema>> {
  const aiModel = getAIProvider(options.model)

  const result = await generateObject({
    model: aiModel,
    system: `You are an expert project manager. Define clear project scope including what's in scope, out of scope, assumptions, constraints, deliverables, and success criteria.`,
    prompt: `Define the scope for this project: ${projectDescription}`,
    schema: scopeSchema,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })
  
  return result.object
}

export const scope = createUnifiedFunction<Promise<z.infer<typeof scopeSchema>>>(
  (projectDescription: string, options: Record<string, any>) => {
    return scopeCore(projectDescription, options as ScopeOptions);
  }
);

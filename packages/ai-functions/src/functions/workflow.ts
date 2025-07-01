import { model } from 'ai-providers'
import { z } from 'zod'
import { generateObject } from '../ai'
import { parseTemplate, createUnifiedFunction } from '../utils/template'

const workflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['manual', 'automated', 'approval', 'condition']),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
  conditions: z.array(z.string()).optional(),
  estimatedDuration: z.string().optional(),
  assignee: z.string().optional(),
})

const workflowSchema = z.object({
  name: z.string(),
  description: z.string(),
  steps: z.array(workflowStepSchema),
  triggers: z.array(z.string()),
  outcomes: z.array(z.string()),
})

interface WorkflowOptions {
  model?: string
  includeAutomation?: boolean
  temperature?: number
  maxTokens?: number
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function workflowCore(processDescription: string, options: WorkflowOptions = {}): Promise<z.infer<typeof workflowSchema>> {
  const aiModel = getAIProvider(options.model)

  const {
    includeAutomation = true
  } = options

  let systemPrompt = 'You are an expert process designer. Create a detailed workflow with clear steps, inputs, outputs, and conditions.'
  
  if (includeAutomation) {
    systemPrompt += ' Include automation opportunities where appropriate.'
  }

  const result = await generateObject({
    model: aiModel,
    system: systemPrompt,
    prompt: `Design a workflow for: ${processDescription}`,
    schema: workflowSchema,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })
  
  return result.object
}

export const workflow = createUnifiedFunction<Promise<z.infer<typeof workflowSchema>>>(
  (processDescription: string, options: Record<string, any>) => {
    return workflowCore(processDescription, options as WorkflowOptions);
  }
);

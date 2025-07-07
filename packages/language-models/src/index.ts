export * from './types.js'
export * from './parser.js'
export * from './aliases.js'
export * from './providers.js'
export { models } from './collections/models.js'

import { languageModel } from 'ai-providers'
import { getModel } from './parser.js'

export interface CreateModelOptions {
  provider: string
  modelName: string
  apiKey?: string
}

export function createModel(options: CreateModelOptions) {
  const { provider, modelName, apiKey } = options
  const modelId = `${provider}/${modelName}`
  
  const model = getModel(modelId)
  if (!model) {
    throw new Error(`Model ${modelId} not found`)
  }
  
  return languageModel(modelId)
}

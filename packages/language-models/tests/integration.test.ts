import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parse, getModel, getModels, createModel } from '../src/index.js'
import { models } from '../src/collections/models.js'
import { aliases } from '../src/aliases.js'

function setupTestEnvironment() {
  if (!process.env.AI_GATEWAY_URL) {
    process.env.AI_GATEWAY_URL = 'https://api.llm.do'
  }
  if (!process.env.AI_GATEWAY_TOKEN) {
    process.env.AI_GATEWAY_TOKEN = process.env.OPENAI_API_KEY || 'test-token'
  }
}

describe('integration tests', () => {
  beforeEach(() => {
    setupTestEnvironment()
  })
  it('should parse model references and find matching models', () => {
    const testCases = ['test/model-1', 'test/model-2', 'openai/gpt-4o']

    for (const testCase of testCases) {
      const parsed = parse(testCase)
      expect(parsed).toBeDefined()

      const matchingModel = models.find((model) => {
        if (parsed.author && parsed.model) {
          return model.slug === `${parsed.author}/${parsed.model}`
        }
        return model.slug.endsWith(parsed.model || '')
      })

      expect(matchingModel).toBeDefined()
    }
  })

  it('should handle parsing models with capabilities', () => {
    const parsed = parse('test/model-1(reasoning,tools)')
    expect(parsed).toBeDefined()
    expect(parsed.model).toBe('model-1')
    expect(parsed.author).toBe('test')
    expect(parsed.capabilities).toHaveProperty('reasoning')
    expect(parsed.capabilities).toHaveProperty('tools')
  })

  it('should get models by alias', () => {
    aliases['test-model'] = 'test/model-1'

    const model = getModel('test-model')
    expect(model).toBeDefined()
    expect(model?.slug).toBe('test/model-1')
  })

  it('should get multiple models with getModels', () => {
    aliases['test-model-1'] = 'test/model-1'
    aliases['test-model-2'] = 'test/model-2'

    const models = getModels('test-model-1,test-model-2')
    expect(models.length).toBe(2)
    expect(models[0].slug).toBe('test/model-1')
    expect(models[1].slug).toBe('test/model-2')
  })

  it('should parse model references with provider constraints', () => {
    const parsed = parse('test/model-1(cost<1)')
    expect(parsed).toBeDefined()
    expect(parsed.model).toBe('model-1')
    expect(parsed.author).toBe('test')
    expect(parsed.providerConstraints).toBeDefined()
    expect(parsed.providerConstraints?.length).toBeGreaterThan(0)
    expect(parsed.providerConstraints?.[0].field).toBe('cost')
    expect(parsed.providerConstraints?.[0].type).toBe('lt')
    expect(parsed.providerConstraints?.[0].value).toBe('1')
  })

  describe('createModel integration', () => {
    it('should handle model validation through createModel', () => {
      expect(() => createModel({
        provider: 'nonexistent',
        modelName: 'fake-model'
      })).toThrow('Model nonexistent/fake-model not found')
    })

    it('should parse model references correctly', () => {
      const parsed = parse('test/model-1')
      expect(parsed.author).toBe('test')
      expect(parsed.model).toBe('model-1')
    })

    it('should parse openai model references correctly', () => {
      const parsed = parse('openai/gpt-4o')
      expect(parsed.author).toBe('openai')
      expect(parsed.model).toBe('gpt-4o')
    })
  })
})

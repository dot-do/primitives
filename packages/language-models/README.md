# language-models

`language-models` provides a unified interface for working with various language models across different providers. It simplifies model selection and usage, providing a consistent API regardless of the underlying model provider.

The package abstracts away the differences between model providers, allowing you to switch between models without changing your application code. It supports a wide range of models from providers like OpenAI, Anthropic, Google, and more.

## Installation

```bash
pnpm add language-models
```

## Usage

### Basic Usage

```typescript
import { createModel } from 'language-models'

// Create a model interface
const model = createModel({
  provider: 'openai',
  modelName: 'gpt-4o',
  apiKey: process.env.OPENAI_API_KEY,
})

// Generate text
const response = await model.complete({
  prompt: 'Explain quantum computing in simple terms',
  maxTokens: 250,
  temperature: 0.7,
})

console.log(response.text)
```

### Using Different Providers

```typescript
// Use Anthropic Claude
const claudeModel = createModel({
  provider: 'anthropic',
  modelName: 'claude-3.5-sonnet',
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Use Google Gemini
const geminiModel = createModel({
  provider: 'google',
  modelName: 'gemini-2.0-flash-001',
  apiKey: process.env.GOOGLE_API_KEY,
})
```

### Streaming Responses

```typescript
// Use streaming for real-time responses
const stream = await model.streamComplete({
  prompt: 'Write a step-by-step guide for making bread',
  maxTokens: 1000,
})

for await (const chunk of stream) {
  console.log(chunk)
}
```

### Model Discovery and Parsing

```typescript
import { getModel, parse, getModels } from 'language-models'

// Find a specific model
const model = getModel('openai/gpt-4o')
console.log(model?.name) // "GPT-4o"

// Parse model references
const parsed = parse('anthropic/claude-3.5-sonnet(reasoning,tools)')
console.log(parsed.author) // "anthropic"
console.log(parsed.model) // "claude-3.5-sonnet"
console.log(parsed.capabilities) // { reasoning: true, tools: true }

// Get multiple models
const models = getModels('openai/gpt-4o,anthropic/claude-3.5-sonnet')
console.log(models.length) // 2
```

### Using Aliases

```typescript
import { aliases } from 'language-models'

// Check available aliases
console.log(aliases['gemini']) // "google/gemini-2.0-flash-001"
console.log(aliases['r1']) // "deepseek/deepseek-r1"

// Use alias in createModel
const model = createModel({
  provider: 'google',
  modelName: 'gemini-2.0-flash-001' // or use the alias directly
})
```

## API Reference

### `createModel(options)`

Creates a model interface for the specified provider and model.

**Parameters:**
- `options.provider` (string): The provider name (e.g., 'openai', 'anthropic', 'google')
- `options.modelName` (string): The model name (e.g., 'gpt-4o', 'claude-3.5-sonnet')
- `options.apiKey` (string, optional): API key for the provider

**Returns:** Model interface with `complete`, `streamComplete`, `generate`, and `stream` methods.

### `getModel(modelReference)`

Finds a model by its reference string.

**Parameters:**
- `modelReference` (string): Model reference like 'openai/gpt-4o'

**Returns:** Model object or undefined if not found.

### `parse(modelReference)`

Parses a model reference string into its components.

**Parameters:**
- `modelReference` (string): Model reference with optional capabilities like 'openai/gpt-4o(reasoning)'

**Returns:** ParsedModel object with author, model, capabilities, and constraints.

### `getModels(modelReferences)`

Gets multiple models from a comma-separated string.

**Parameters:**
- `modelReferences` (string): Comma-separated model references

**Returns:** Array of Model objects.

## Supported Providers

- OpenAI (gpt-4o, gpt-4-turbo, gpt-3.5-turbo)
- Anthropic (claude-3.7-sonnet, claude-3.5-sonnet, claude-3-opus)
- Google (gemini-2.0-flash-001, gemini-1.5-pro, gemini-1.5-flash)
- Meta (llama-3-70b, llama-3-8b)
- DeepSeek (deepseek-r1)
- And many more...

## Model Capabilities

Models support various input and output modalities:

- **Text**: All models support text input/output
- **Image**: Many models support image input (multimodal)
- **Audio**: Some models support audio input
- **Video**: Advanced models support video input

Check the model's `inputModalities` and `outputModalities` properties for specific capabilities.

## Error Handling

```typescript
try {
  const model = createModel({
    provider: 'invalid',
    modelName: 'nonexistent'
  })
} catch (error) {
  console.error(error.message) // "Model invalid/nonexistent not found"
}
```

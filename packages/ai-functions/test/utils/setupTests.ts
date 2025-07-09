export function setupTestEnvironment() {
  if (!process.env.AI_GATEWAY_URL) {
    process.env.AI_GATEWAY_URL = 'https://api.llm.do'
  }
  if (!process.env.AI_GATEWAY_TOKEN) {
    process.env.AI_GATEWAY_TOKEN = process.env.OPENAI_API_KEY || 'test-token'
  }
}

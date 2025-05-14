import { embed, embedMany, generateObject, generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'
import { z } from 'zod'
import { StringValueNode } from 'graphql'
import { Thing } from '@/payload.types'
import { ai } from 'ai-functions'

export const model = createOpenAI({
  compatibility: 'compatible',
  apiKey: process.env.AI_GATEWAY_TOKEN!,
  baseURL: process.env.AI_GATEWAY_URL!,
  headers: {
    'HTTP-Referer': 'https://workflows.do', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': 'Workflows.do Business-as-Code', // Optional. Site title for rankings on openrouter.ai.
  },
})

export const getSettings = cache(async () => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'settings' })
})

export { ai }


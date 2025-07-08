import { embed, embedMany, generateObject, generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'
import { z } from 'zod'
import { StringValueNode } from 'graphql'
import { Function as FunctionType, Event, Generation, Workflow } from '@/payload.types'
import { db } from '../databases/sqlite'

import { ai as aiFunction } from 'ai-functions'
import type { AI } from 'ai-functions'

interface DbOperations {
  findOne: (args: { collection: string, where: Record<string, any> }) => Promise<any>;
  create: (args: { collection: string, data: Record<string, any> }) => Promise<any>;
  update: (args: { collection: string, id: string, data: Record<string, any> }) => Promise<any>;
  getOrCreate: (args: { collection: string, data: Record<string, any>, where: Record<string, any> }) => Promise<any>;
}


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

interface AIOptions {
  function?: string;
  output?: 'object' | 'array' | 'enum' | 'no-schema';
  model?: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  schema?: any;
  iterator?: boolean;
  [key: string]: any;
}

export const ai = async (promptOrTemplate: string | TemplateStringsArray, ...args: any[]) => {
  let prompt: string;
  let options: AIOptions = {};
  
  if (typeof promptOrTemplate === 'string') {
    prompt = promptOrTemplate;
    if (args.length > 0 && typeof args[0] === 'object') {
      options = args[0];
    }
  } else {
    prompt = String.raw(promptOrTemplate, ...args);
  }
  
  const functionName = options.function || 'default';
  let functionRecord = await (db as unknown as DbOperations).findOne({
    collection: 'functions',
    where: { name: { equals: functionName } }
  }) as FunctionType;

  if (!functionRecord) {
    functionRecord = await (db as unknown as DbOperations).create({
      collection: 'functions',
      data: { 
        name: functionName,
        output: options.output || 'Text',
        model: options.model || 'gpt-4o',
        prompt: prompt,
        system: options.system || '',
        settings: JSON.stringify({
          temperature: options.temperature || 1.0,
          maxTokens: options.maxTokens || undefined
        })
      }
    }) as FunctionType;
  }
  
  const result = typeof promptOrTemplate === 'string' 
    ? await aiFunction`${prompt}`(options as any)
    : await aiFunction(promptOrTemplate as any, ...args);
  
  const event = await (db as unknown as DbOperations).create({
    collection: 'events',
    data: {
      status: 'Success',
      execution: functionRecord.id,
      input: prompt,
      data: result
    }
  }) as Event;
  
  const generation = await (db as unknown as DbOperations).create({
    collection: 'generations',
    data: {
      provider: options.model || 'openai',
      type: 'Realtime',
      request: { prompt, ...options },
      response: { result },
      metadata: {
        model: options.model || 'gpt-4o',
        temperature: options.temperature || 1.0,
        tokens: options.maxTokens || null
      }
    }
  }) as Generation;
  
  await (db as unknown as DbOperations).update({
    collection: 'events',
    id: event.id,
    data: {
      generation: generation.id
    }
  });
  
  return result;
}

export function AI(functions: Record<string, any>) {
  Object.entries(functions).forEach(([name, definition]) => {
    if (typeof definition === 'function') {
      const functionString = definition.toString();
      
(db as unknown as DbOperations).getOrCreate({
        collection: 'workflows',
        data: { 
          name,
          code: functionString
        },
        where: { name: { equals: name } }
      })
    }
  })
  
  const mockAI = (funcs: Record<string, any>) => funcs;
  return mockAI(functions);
}


import { z } from 'zod'
import { handleStringOutput, handleArrayOutput, handleObjectOutput } from './output-handlers'

export function createZodSchemaFromObject(obj: Record<string, any>): z.ZodSchema {
  const schemaObj: Record<string, z.ZodTypeAny> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      if (value.includes('|')) {
        const options = value.split('|').map((o) => o.trim())
        schemaObj[key] = z.enum(options as [string, ...string[]])
      } else {
        schemaObj[key] = z.string().describe(value)
      }
    } else if (Array.isArray(value)) {
      schemaObj[key] = z.array(z.string())
    } else if (typeof value === 'object') {
      schemaObj[key] = createZodSchemaFromObject(value)
    } else {
      schemaObj[key] = z.string().describe(String(value))
    }
  }

  return z.object(schemaObj)
}

export function inferAndValidateOutput(outputSchema: any, result: any): any {
  if (!outputSchema) {
    return result
  }

  try {
    if (typeof outputSchema === 'object' && !Array.isArray(outputSchema)) {
      const zodSchema = createZodSchemaFromObject(outputSchema)
      return zodSchema.parse(result)
    }
    return result
  } catch (error) {
    console.warn('Type validation failed:', error)
    return result
  }
}

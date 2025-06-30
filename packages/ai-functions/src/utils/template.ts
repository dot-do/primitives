import yaml from 'yaml'

export function stringifyValue(value: any): string {
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    const yamlString = yaml.stringify(value)
    if (typeof yamlString === 'string') {
      return yamlString.trim()
    } else if (yamlString === undefined || yamlString === null) {
      return String(value)
    } else {
      return String(yamlString)
    }
  }
  return String(value)
}

export function parseTemplate(template: TemplateStringsArray, values: any[]): string {
  let result = ''
  
  template.forEach((str, i) => {
    result += str
    if (i < values.length) {
      result += stringifyValue(values[i])
    }
  })
  
  return result
}

export type TemplateFunction<T = any> = (template: TemplateStringsArray, ...values: any[]) => T  

export function createUnifiedFunction<T>(
  callback: (parsedTemplate: string, options: Record<string, any>) => T
): any {
  function unifiedFunction(...args: any[]): any {
    if (args.length === 0 || args[0] === undefined) {
      throw new Error('Function must be called as a template literal or with string and options')
    }
    
    if (typeof args[0] === 'string') {
      const [template, options = {}] = args
      return callback(template, options)
    }
    
    if (Array.isArray(args[0]) && 'raw' in args[0]) {
      const [template, ...values] = args
      const parsedTemplate = parseTemplate(template as TemplateStringsArray, values)
      return callback(parsedTemplate, {})
    }
    
    throw new Error('Function must be called as a template literal or with string and options')
  }

  return new Proxy(unifiedFunction, {
    apply(target, thisArg, args) {
      if (args.length === 0 || args[0] === undefined) {
        throw new Error('Function must be called as a template literal or with string and options')
      }
      
      try {
        return target.apply(thisArg, args)
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Function must be called as a template literal or with string and options')
      }
    },
    
    get(target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return undefined
      }
      
      return function(...templateArgs: any[]) {
        if (Array.isArray(templateArgs[0]) && 'raw' in templateArgs[0]) {
          const [template, ...values] = templateArgs
          const parsedTemplate = parseTemplate(template as TemplateStringsArray, values)
          
          const optionsHandler: any = function(options: Record<string, any> = {}) {
            return callback(parsedTemplate, options)
          }
          
          optionsHandler[Symbol.asyncIterator] = function() {
            const options = this === optionsHandler ? {} : this
            
            const result = callback(parsedTemplate, options)
            
            if (result && typeof result === 'object' && Symbol.asyncIterator in result) {
              return (result as AsyncIterable<any>)[Symbol.asyncIterator]()
            }
            
            throw new Error('Result is not async iterable')
          }
          
          return optionsHandler
        }
        
        throw new Error('Function must be called as a template literal or with string and options')
      }
    }
  })
}        

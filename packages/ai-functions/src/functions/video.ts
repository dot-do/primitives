import { model } from 'ai-providers'
import { generateText } from '../ai'
import { parseTemplate, createUnifiedFunction } from '../utils/template'

export interface VideoConfig {
  duration?: number
  style?: 'documentary' | 'tutorial' | 'promotional' | 'narrative'
  resolution?: '720p' | '1080p' | '4k'
  format?: 'mp4' | 'webm' | 'avi'
}

export interface VideoResult {
  script: string
  scenes: Array<{
    duration: number
    description: string
    voiceover: string
    visuals: string[]
  }>
  metadata: {
    totalDuration: number
    sceneCount: number
    estimatedSize: string
  }
}

interface VideoOptions extends VideoConfig {
  model?: string
  temperature?: number
  maxTokens?: number
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function videoCore(prompt: string, options: VideoOptions = {}): Promise<VideoResult> {
  const aiModel = getAIProvider(options.model)

  const {
    duration = 60,
    style = 'tutorial',
    resolution = '1080p',
    format = 'mp4'
  } = options

  const systemPrompt = `You are a video production expert. Create a detailed video script and scene breakdown for a ${duration}-second ${style} video in ${resolution} ${format} format.`

  const result = await generateText({
    model: aiModel,
    system: systemPrompt,
    prompt: `Create a video about: ${prompt}`,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })

  const scenes = [
    {
      duration: duration / 3,
      description: 'Opening scene',
      voiceover: 'Introduction to the topic',
      visuals: ['Title card', 'Background imagery']
    },
    {
      duration: duration / 3,
      description: 'Main content',
      voiceover: 'Core information delivery',
      visuals: ['Supporting graphics', 'Demonstrations']
    },
    {
      duration: duration / 3,
      description: 'Closing scene',
      voiceover: 'Summary and call to action',
      visuals: ['Conclusion graphics', 'Contact information']
    }
  ]

  return {
    script: result.text,
    scenes,
    metadata: {
      totalDuration: duration,
      sceneCount: scenes.length,
      estimatedSize: `${Math.round(duration * 2)}MB`
    }
  }
}

export const video = createUnifiedFunction<Promise<VideoResult>>(
  (prompt: string, options: Record<string, any>) => {
    return videoCore(prompt, options as VideoOptions);
  }
);

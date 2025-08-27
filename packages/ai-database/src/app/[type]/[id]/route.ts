import config from '@payload-config'
import { waitUntil } from '@vercel/functions'
import { getPayload } from 'payload'

export const maxDuration = 800

export async function GET(request: Request) {
  const start = Date.now()
  const { headers } = request
  const { origin, searchParams, pathname } = new URL(request.url)
  
  const paths = pathname.split('/')
  const id = paths.pop() || ''
  const type = paths.pop() || ''
  
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })
  
  try {
    const thing = await payload.find({
      collection: 'things',
      where: {
        type: { equals: type },
        id: { equals: id }
      }
    })
    
    if (thing.docs.length > 0) {
      return Response.json({
        ...thing.docs[0],
        $context: origin,
        links: {
          home: origin,
          admin: origin + '/admin',
        }
      })
    } else {
      const job = await payload.jobs.queue({ 
        workflow: 'generateThing', 
        input: {
          id,
          type
        }
      })
      
      return Response.json({
        id,
        type,
        status: 'generating',
        jobId: job.id,
        message: 'Resource is being generated. Please check back soon.',
        $context: origin,
        links: {
          home: origin,
          admin: origin + '/admin',
          job: `${origin}/admin/collections/payload-jobs/${job.id}`,
        }
      }, { status: 202 }) // 202 Accepted indicates the request has been accepted for processing
    }
  } catch (error) {
    return Response.json({
      error: 'Failed to process request',
      message: error.message,
    }, { status: 500 })
  }
}

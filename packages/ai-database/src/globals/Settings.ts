import type { GlobalConfig } from 'payload'
import { editorOptions } from '@/lib/collections'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    group: 'Admin'
  },
  fields: [
    { type: 'row', fields: [
      { name: 'name', type: 'text' },
      { name: 'domain', type: 'text' },
      { name: 'path', type: 'text' },
      { name: 'defaultModel', type: 'relationship', defaultValue: 'gemini-2.5-pro-preview', relationTo: 'models' },
    ]},
    { name: 'context', type: 'code', admin: { language: 'mdx', editorOptions } },
  ],
}

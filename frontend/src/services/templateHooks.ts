import { useQuery } from '@tanstack/react-query'
import { api } from './api'

export interface Template {
  id: string
  type: string
  name: string
  subject?: string
  body: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface RenderedTemplate {
  subject?: string
  name: string
  body: string
}

export function useTemplates(type?: string) {
  return useQuery<Template[]>({
    queryKey: ['templates', type],
    queryFn: async () => {
      const params = type ? `?type=${type}` : ''
      return await api.get(`/templates${params}`)
    },
  })
}

export function useRenderedTemplate(templateId: string, leadId: string) {
  return useQuery<RenderedTemplate>({
    queryKey: ['templates', templateId, 'render', leadId],
    queryFn: async () => {
      return await api.get(`/templates/${templateId}/render/${leadId}`)
    },
    enabled: !!templateId && !!leadId,
  })
}

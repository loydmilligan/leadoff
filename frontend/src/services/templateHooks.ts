import { useQuery } from '@tanstack/react-query'
import { api } from './api'

export function useTemplates(type?: string) {
  return useQuery({
    queryKey: ['templates', type],
    queryFn: async () => {
      const params = type ? `?type=${type}` : ''
      return await api.get(`/templates${params}`)
    },
  })
}

export function useRenderedTemplate(templateId: string, leadId: string) {
  return useQuery({
    queryKey: ['templates', templateId, 'render', leadId],
    queryFn: async () => {
      return await api.get(`/templates/${templateId}/render/${leadId}`)
    },
    enabled: !!templateId && !!leadId,
  })
}

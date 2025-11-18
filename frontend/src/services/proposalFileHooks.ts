import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export function useUploadProposalFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ proposalId, file }: { proposalId: string; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/proposals/${proposalId}/upload-proposal`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useUploadPriceSheet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ proposalId, file }: { proposalId: string; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/proposals/${proposalId}/upload-price-sheet`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useDeleteProposalFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ proposalId, type }: { proposalId: string; type: 'proposal' | 'price-sheet' }) => {
      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/proposals/${proposalId}/files/${type}`
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

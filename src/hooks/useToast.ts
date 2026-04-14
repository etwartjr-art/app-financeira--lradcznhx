import { useToast as useOriginalToast } from '@/hooks/use-toast'

export function useToast() {
  const { toast } = useOriginalToast()

  return {
    toast: (options: {
      title?: string
      description?: string
      variant?: 'default' | 'destructive'
    }) => {
      toast(options)
    },
  }
}

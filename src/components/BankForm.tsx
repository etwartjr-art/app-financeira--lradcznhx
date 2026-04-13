import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { createBank, updateBank, type Bank } from '@/services/bank-service'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const bankSchema = z.object({
  bank_name: z.string().min(1, 'Nome do banco é obrigatório').max(100, 'Máximo de 100 caracteres'),
  agency: z
    .string()
    .min(1, 'Agência é obrigatória')
    .max(10, 'Máximo de 10 caracteres')
    .regex(/^\d+$/, 'Apenas números permitidos'),
  account_number: z
    .string()
    .min(1, 'Número da conta é obrigatório')
    .max(20, 'Máximo de 20 caracteres')
    .regex(/^\d+$/, 'Apenas números permitidos'),
})

type BankFormValues = z.infer<typeof bankSchema>

interface BankFormProps {
  initialData?: Bank
  onSuccess: () => void
  onCancel: () => void
}

export function BankForm({ initialData, onSuccess, onCancel }: BankFormProps) {
  const { currentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    mode: 'onBlur',
    defaultValues: {
      bank_name: initialData?.bank_name || '',
      agency: initialData?.agency || '',
      account_number: initialData?.account_number || '',
    },
  })

  const onSubmit = async (data: BankFormValues) => {
    if (!currentUser) return
    setIsLoading(true)
    try {
      if (initialData) {
        await updateBank(initialData.id, data)
      } else {
        await createBank({ ...data, user_id: currentUser.id })
      }
      toast.success('Banco salvo com sucesso!')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar banco.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="bank_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Nome do Banco</FormLabel>
              <FormControl>
                <Input
                  className="h-11 focus-visible:ring-primary"
                  placeholder="Ex: Banco do Brasil"
                  aria-label="Nome do Banco"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="agency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Agência</FormLabel>
              <FormControl>
                <Input
                  className="h-11 focus-visible:ring-primary"
                  placeholder="Apenas números"
                  aria-label="Agência"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="account_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Número da Conta</FormLabel>
              <FormControl>
                <Input
                  className="h-11 focus-visible:ring-primary"
                  placeholder="Apenas números"
                  aria-label="Número da Conta"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white transition-colors"
            disabled={isLoading || !form.formState.isValid}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  )
}

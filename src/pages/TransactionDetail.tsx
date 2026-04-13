import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { TransactionForm } from '@/components/TransactionForm'
import { getById, update, type TransactionExt } from '@/services/transactions'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [transaction, setTransaction] = useState<TransactionExt | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [cards, setCards] = useState<any[]>([])

  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setIsLoadingData(true)
        const [tx, cats, cds] = await Promise.all([
          getById(id),
          pb.collection('categories').getFullList({ sort: 'name' }),
          pb.collection('cards').getFullList({ sort: 'name' }),
        ])

        if (tx.userId !== currentUser?.id && currentUser?.role !== 'Admin') {
          setErrorMsg('403 - Acesso negado')
          return
        }

        setTransaction(tx)
        setCategories(cats)
        setCards(cds)
      } catch (err: any) {
        if (err.status === 404 || err.message?.includes('404')) {
          setErrorMsg('404 - Transação não encontrada')
        } else {
          setErrorMsg('Ocorreu um erro ao carregar os dados.')
        }
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [id, currentUser])

  const handleSubmit = async (data: Partial<TransactionExt>) => {
    if (!id) return
    try {
      setIsSaving(true)
      await update(id, data)
      toast.success('Transação atualizada!')
      navigate('/transactions')
    } catch (err: any) {
      toast.error('Erro ao atualizar a transação.')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/transactions')
  }

  if (isLoadingData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-200">{errorMsg}</h2>
        <button
          onClick={() => navigate('/transactions')}
          className="text-teal-500 hover:text-teal-400 underline"
        >
          Voltar para Transações
        </button>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-100">Editar Transação</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm
            transaction={transaction!}
            categories={categories}
            cards={cards}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  )
}

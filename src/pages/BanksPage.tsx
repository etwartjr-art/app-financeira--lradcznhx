import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getBanks, deleteBank, type Bank } from '@/services/bank-service'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BankForm } from '@/components/BankForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Landmark, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function BanksPage() {
  const { currentUser } = useAuth()
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<Bank | undefined>(undefined)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [bankToDelete, setBankToDelete] = useState<string | null>(null)

  const loadBanks = useCallback(async () => {
    if (!currentUser) return
    try {
      setLoading(true)
      setError(null)
      const data = await getBanks(currentUser.id)
      setBanks(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar bancos.')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    loadBanks()
  }, [loadBanks])

  useRealtime('banks', () => {
    loadBanks()
  })

  const handleOpenForm = (bank?: Bank) => {
    setEditingBank(bank)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingBank(undefined)
  }

  const handleDeleteConfirm = async () => {
    if (!bankToDelete) return
    try {
      await deleteBank(bankToDelete)
      toast.success('Banco deletado com sucesso!')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao deletar banco.')
    } finally {
      setIsDeleteOpen(false)
      setBankToDelete(null)
    }
  }

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setBankToDelete(id)
    setIsDeleteOpen(true)
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bancos</h1>
          <p className="text-muted-foreground text-sm">Gerencie suas contas bancárias</p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar Banco
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-slate-800 bg-[#0b0e14]">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/2 mb-4 bg-slate-800" />
                <Skeleton className="h-4 w-3/4 mb-2 bg-slate-800" />
                <Skeleton className="h-4 w-1/2 bg-slate-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed border-slate-800">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <p className="text-slate-400 mb-4">{error}</p>
          <Button variant="outline" onClick={loadBanks}>
            Tentar novamente
          </Button>
        </div>
      ) : banks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed border-slate-800">
          <Landmark className="h-12 w-12 text-slate-500 mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-slate-200">Nenhum banco cadastrado</h3>
          <p className="text-slate-400 mb-4">
            Adicione seu primeiro banco para começar a gerenciar suas contas.
          </p>
          <Button variant="outline" onClick={() => handleOpenForm()}>
            Adicionar Banco
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banks.map((bank) => (
            <Card
              key={bank.id}
              className="group cursor-pointer border-slate-800 bg-[#121822] hover:border-emerald-500/50 transition-colors relative"
              onClick={() => handleOpenForm(bank)}
            >
              <CardContent className="p-6">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-400 hover:text-slate-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={(e) => confirmDelete(e, bank.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-200 truncate pr-16">
                    {bank.bank_name}
                  </h3>
                </div>

                <div className="space-y-1 text-sm text-slate-400">
                  <div className="flex justify-between">
                    <span>Agência:</span>
                    <span className="font-medium text-slate-200">{bank.agency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conta:</span>
                    <span className="font-medium text-slate-200">{bank.account_number}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="sm:max-w-md bg-[#0b0e14] border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle className="text-slate-50">
              {editingBank ? 'Editar Banco' : 'Adicionar Banco'}
            </DialogTitle>
          </DialogHeader>
          <BankForm
            initialData={editingBank}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-[#0b0e14] border-slate-800 text-slate-50">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Banco</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja deletar este banco? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-800 text-slate-300 hover:bg-slate-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

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
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="relative mb-8 min-h-[3rem]">
        <div className="pr-40">
          <h1 className="text-2xl font-bold tracking-tight">Bancos</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas contas bancárias</p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="absolute right-0 top-0 h-11 px-4 bg-green-600 hover:bg-green-700 text-white transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar Banco
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse bg-card border-border">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={loadBanks}>
            Tentar novamente
          </Button>
        </div>
      ) : banks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed border-border bg-card/50">
          <Landmark className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">Nenhum banco cadastrado</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Adicione seu primeiro banco para gerenciar suas contas.
          </p>
          <Button
            onClick={() => handleOpenForm()}
            className="bg-green-600 hover:bg-green-700 text-white h-11 px-4"
          >
            Adicionar Banco
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
          {banks.map((bank) => (
            <Card
              key={bank.id}
              className="group relative bg-card hover:bg-card/80 transition-colors cursor-pointer border-border rounded-xl"
              onClick={() => handleOpenForm(bank)}
            >
              <CardContent className="p-6">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenForm(bank)
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={(e) => confirmDelete(e, bank.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-card-foreground truncate pr-20">
                    {bank.bank_name}
                  </h3>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">Agência: {bank.agency}</p>
                  <p className="text-sm text-muted-foreground">Conta: {bank.account_number}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="sm:max-w-md p-4 sm:p-6 bg-card border-border">
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-200">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold">
                {editingBank ? 'Editar Banco' : 'Adicionar Banco'}
              </DialogTitle>
            </DialogHeader>
            <BankForm
              initialData={editingBank}
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Banco</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja deletar este banco? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border hover:bg-secondary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

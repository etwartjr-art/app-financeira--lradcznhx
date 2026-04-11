import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Edit, UserPlus, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useFinance, type User } from '@/stores/FinanceContext'
import { format, differenceInMonths, differenceInYears } from 'date-fns'
import { UserDialog } from '@/components/UserDialog'

import { TableSkeleton, ErrorState, EmptyState } from '@/components/StateFeedback'

export default function Users() {
  const { users, addUser, updateUser, deleteUser, isLoading, error, retry } = useFinance()
  const [isMounted, setIsMounted] = useState(false)

  const [modal, setModal] = useState<{ open: boolean; mode: 'add' | 'edit'; user: Partial<User> }>({
    open: false,
    mode: 'add',
    user: { role: 'User', situation: 'Ativo' },
  })

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const getUsageTime = (dateStr?: string) => {
    if (!dateStr) return 'Desconhecido'
    const start = new Date(dateStr)
    if (isNaN(start.getTime())) return 'Desconhecido'
    const now = new Date()
    const years = differenceInYears(now, start)
    const months = differenceInMonths(now, start) % 12
    if (years === 0 && months === 0) return 'Menos de 1 mês'
    const parts = []
    if (years > 0) parts.push(`${years} ano${years > 1 ? 's' : ''}`)
    if (months > 0) parts.push(`${months} mês${months > 1 ? 'es' : ''}`)
    return parts.join(' e ')
  }

  const getFormattedDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? '-' : format(d, 'dd/MM/yyyy')
  }

  const handleSaveUser = async () => {
    if (!modal.user.name || !modal.user.email || !modal.user.situation) {
      return toast({ title: 'Preencha os campos obrigatórios!', variant: 'destructive' })
    }
    try {
      if (modal.mode === 'add') {
        if (!modal.user.password)
          return toast({
            title: 'A senha é obrigatória para novos usuários!',
            variant: 'destructive',
          })
        await addUser({ ...modal.user } as Omit<User, 'id' | 'createdAt'>)
        toast({ title: 'Criado com sucesso' })
      } else {
        await updateUser(modal.user.id!, modal.user)
        toast({ title: 'Atualizado com sucesso' })
      }
      setModal({ open: false, mode: 'add', user: { role: 'User', situation: 'Ativo' } })
    } catch (err) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.userId) return

    const userId = deleteConfirm.userId
    setDeleteConfirm({ open: false, userId: null })

    try {
      await deleteUser(userId)
      toast({ title: 'Removido com sucesso' })
    } catch (err) {
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível completar a operação. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  // Prevent rendering until mounted to ensure safe DOM node insertions and avoid router crashes
  if (!isMounted) return null

  if (isLoading && !users.length) return <TableSkeleton />
  if (error) return <ErrorState message={error} onRetry={retry} />

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Usuários do Sistema</h1>
          <p className="text-slate-400">Gerencie acessos e o controle financeiro dos mentorados.</p>
        </div>
        <Button
          className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-lg"
          onClick={() =>
            setModal({ open: true, mode: 'add', user: { role: 'User', situation: 'Ativo' } })
          }
        >
          <UserPlus className="mr-2 h-4 w-4" /> <span>Adicionar Usuário</span>
        </Button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#161925] overflow-hidden shadow-sm overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-[#0b0e14]">
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-400 font-semibold text-xs tracking-wider">
                NOME
              </TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs tracking-wider">
                E-MAIL
              </TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs tracking-wider">
                DATA DE CADASTRO
              </TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs tracking-wider">
                TEMPO DE USO
              </TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs tracking-wider">
                PERFIL
              </TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs tracking-wider">
                SITUAÇÃO
              </TableHead>
              <TableHead className="text-right text-slate-400 font-semibold text-xs tracking-wider">
                AÇÕES
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-slate-800/50 hover:bg-slate-800/30 group">
                <TableCell className="font-medium text-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-400 text-sm">{user.email}</TableCell>
                <TableCell className="text-slate-400 text-sm">
                  {getFormattedDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-slate-400 text-sm font-medium">
                  {getUsageTime(user.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0.5 border-transparent ${user.role === 'Admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}
                  >
                    <span>{user.role}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'px-2 py-0.5 text-xs font-medium border-transparent flex items-center gap-1.5 w-fit',
                      user.situation === 'Ativo'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-red-500/10 text-red-500',
                    )}
                  >
                    {user.situation === 'Ativo' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    <span>{user.situation}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white"
                      onClick={() => setModal({ open: true, mode: 'edit', user })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {user.role !== 'Admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-400"
                        onClick={() => setDeleteConfirm({ open: true, userId: user.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserDialog
        open={modal.open}
        mode={modal.mode}
        user={modal.user}
        onClose={() => setModal({ ...modal, open: false })}
        onChange={(u) => setModal({ ...modal, user: u })}
        onSave={handleSaveUser}
      />

      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => !open && setDeleteConfirm({ open: false, userId: null })}
      >
        <AlertDialogContent className="bg-[#161925] border-slate-800 text-slate-100 sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Tem certeza que deseja remover este usuário?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação não pode ser desfeita. Todos os dados financeiros, cartões e categorias
              vinculadas serão permanentemente apagados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-white hover:bg-slate-800 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirmar e Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

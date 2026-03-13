import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Edit, UserPlus, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type User = {
  id: string
  name: string
  email: string
  role: 'Admin' | 'User'
  situation: 'Ativo' | 'Devedor'
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@financasetw.com.br',
      role: 'Admin',
      situation: 'Ativo',
    },
    {
      id: '2',
      name: 'Maria Souza',
      email: 'maria@financasetw.com.br',
      role: 'User',
      situation: 'Devedor',
    },
    {
      id: '3',
      name: 'Carlos Santos',
      email: 'carlos@financasetw.com.br',
      role: 'User',
      situation: 'Ativo',
    },
  ])

  const [modal, setModal] = useState<{ open: boolean; mode: 'add' | 'edit'; user: Partial<User> }>({
    open: false,
    mode: 'add',
    user: { role: 'User', situation: 'Ativo' },
  })

  const handleSaveUser = () => {
    if (!modal.user.name || !modal.user.email || !modal.user.situation) {
      return toast({ title: 'Preencha os campos obrigatórios!', variant: 'destructive' })
    }

    if (modal.mode === 'add') {
      const newUser = {
        ...modal.user,
        id: Math.random().toString(),
      } as User
      setUsers([...users, newUser])
      toast({ title: 'Usuário adicionado com sucesso!' })
    } else {
      setUsers(users.map((u) => (u.id === modal.user.id ? (modal.user as User) : u)))
      toast({ title: 'Usuário atualizado com sucesso!' })
    }
    setModal({ open: false, mode: 'add', user: { role: 'User', situation: 'Ativo' } })
  }

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
          <UserPlus className="mr-2 h-4 w-4" /> Adicionar Usuário
        </Button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#161925] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[#0b0e14]">
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-400 font-semibold text-xs tracking-wider">
                NOME
              </TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs tracking-wider">
                E-MAIL
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
              <TableRow key={user.id} className="border-slate-800/50 hover:bg-slate-800/30">
                <TableCell className="font-medium text-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300">
                      {user.name.charAt(0)}
                    </div>
                    {user.name}
                  </div>
                </TableCell>
                <TableCell className="text-slate-400 text-sm">{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0.5 border-transparent ${user.role === 'Admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'px-2 py-0.5 text-xs font-medium border-transparent flex items-center gap-1.5 w-fit',
                      user.situation === 'Ativo'
                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
                    )}
                  >
                    {user.situation === 'Ativo' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {user.situation}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white"
                    onClick={() => setModal({ open: true, mode: 'edit', user })}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modal.open} onOpenChange={(o) => !o && setModal({ ...modal, open: false })}>
        <DialogContent className="bg-[#161925] border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {modal.mode === 'add' ? 'Adicionar Novo Usuário' : 'Editar Perfil do Usuário'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                className="bg-[#0b0e14] border-slate-700 focus-visible:ring-[#0f766e]"
                value={modal.user.name || ''}
                onChange={(e) =>
                  setModal({ ...modal, user: { ...modal.user, name: e.target.value } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                className="bg-[#0b0e14] border-slate-700 focus-visible:ring-[#0f766e]"
                value={modal.user.email || ''}
                onChange={(e) =>
                  setModal({ ...modal, user: { ...modal.user, email: e.target.value } })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-slate-400" /> Permissão
                </Label>
                <Select
                  value={modal.user.role}
                  onValueChange={(v: 'Admin' | 'User') =>
                    setModal({ ...modal, user: { ...modal.user, role: v } })
                  }
                >
                  <SelectTrigger className="bg-[#0b0e14] border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161925] border-slate-700 text-slate-100">
                    <SelectItem value="User">Usuário</SelectItem>
                    <SelectItem value="Admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Situação Financeira</Label>
                <Select
                  value={modal.user.situation}
                  onValueChange={(v: 'Ativo' | 'Devedor') =>
                    setModal({ ...modal, user: { ...modal.user, situation: v } })
                  }
                >
                  <SelectTrigger className="bg-[#0b0e14] border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161925] border-slate-700 text-slate-100">
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Devedor">Devedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-transparent border-slate-700 text-white"
              onClick={() => setModal({ ...modal, open: false })}
            >
              Cancelar
            </Button>
            <Button className="bg-[#0f766e] text-white" onClick={handleSaveUser}>
              Salvar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

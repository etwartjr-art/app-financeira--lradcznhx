import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
import { Edit, UserPlus, ShieldAlert } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type User = { id: string; name: string; email: string; role: 'Admin' | 'User'; active: boolean }

export default function Users() {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'João Silva', email: 'joao@financasetw.com.br', role: 'Admin', active: true },
    {
      id: '2',
      name: 'Maria Souza',
      email: 'maria@financasetw.com.br',
      role: 'User',
      active: false,
    },
    {
      id: '3',
      name: 'Carlos Santos',
      email: 'carlos@financasetw.com.br',
      role: 'User',
      active: true,
    },
  ])

  const [editingUser, setEditingUser] = useState<User | null>(null)

  const toggleUserStatus = (id: string, active: boolean) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, active } : u)))
    toast({ title: `Status alterado para ${active ? 'Ativo' : 'Inativo'}` })
  }

  const handleUpdateUser = () => {
    if (!editingUser) return
    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)))
    setEditingUser(null)
    toast({ title: 'Usuário atualizado com sucesso!' })
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Usuários do Sistema</h1>
          <p className="text-slate-400">Gerencie acessos e permissões da equipe.</p>
        </div>
        <Button className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-lg">
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
                STATUS
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
                  <Switch
                    checked={user.active}
                    onCheckedChange={(val) => toggleUserStatus(user.id, val)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white"
                    onClick={() => setEditingUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent className="bg-[#161925] border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Perfil do Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  className="bg-[#0b0e14] border-slate-700"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  className="bg-[#0b0e14] border-slate-700"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Nível de Permissão
                </Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(v: 'Admin' | 'User') =>
                    setEditingUser({ ...editingUser, role: v })
                  }
                >
                  <SelectTrigger className="bg-[#0b0e14] border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161925] border-slate-700 text-slate-100">
                    <SelectItem value="User">Usuário Padrão</SelectItem>
                    <SelectItem value="Admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-transparent border-slate-700 text-white"
              onClick={() => setEditingUser(null)}
            >
              Cancelar
            </Button>
            <Button className="bg-[#0f766e] text-white" onClick={handleUpdateUser}>
              Salvar Perfil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

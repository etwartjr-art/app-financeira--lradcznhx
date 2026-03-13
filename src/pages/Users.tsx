import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Edit, UserPlus, Mail, ShieldAlert } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type User = {
  id: string
  name: string
  email: string
  role: 'Admin' | 'User'
  active: boolean
}

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
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Usuários do Sistema</h1>
          <p className="text-slate-400">Gerencie acessos e permissões da equipe.</p>
        </div>
        <Button className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-lg w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" /> Adicionar Usuário
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-800 bg-[#161925] p-5 gap-4 transition-colors hover:border-slate-700"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-semibold text-slate-300">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-white text-base">{user.name}</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0.5 border-transparent ${user.role === 'Admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}
                  >
                    {user.role}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0.5 border-transparent ${user.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}
                  >
                    {user.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-slate-400 gap-4">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {user.email}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-slate-800 sm:border-0 pt-4 sm:pt-0">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor={`status-${user.id}`}
                  className="text-xs text-slate-400 cursor-pointer"
                >
                  Acesso
                </Label>
                <Switch
                  id={`status-${user.id}`}
                  checked={user.active}
                  onCheckedChange={(val) => toggleUserStatus(user.id, val)}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => setEditingUser(user)}
              >
                <Edit className="h-4 w-4 mr-2" /> Editar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent className="bg-[#161925] border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Perfil do Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nome Completo</Label>
                <Input
                  className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">E-mail</Label>
                <Input
                  type="email"
                  className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Nível de Permissão
                </Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(v: 'Admin' | 'User') =>
                    setEditingUser({ ...editingUser, role: v })
                  }
                >
                  <SelectTrigger className="bg-[#0f111a] border-slate-700 focus:ring-[#0f766e]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161925] border-slate-700 text-slate-100">
                    <SelectItem value="User">Usuário Padrão</SelectItem>
                    <SelectItem value="Admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-[#0f111a]">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Status da Conta</Label>
                  <p className="text-xs text-slate-400">Permitir que o usuário acesse o sistema</p>
                </div>
                <Switch
                  checked={editingUser.active}
                  onCheckedChange={(val) => setEditingUser({ ...editingUser, active: val })}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
              onClick={() => setEditingUser(null)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white"
              onClick={handleUpdateUser}
            >
              Salvar Perfil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

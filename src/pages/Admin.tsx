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
import { Edit } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type User = {
  id: string
  name: string
  email: string
  role: string
  active: boolean
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'João Silva', email: 'joao@financasetw.com.br', role: 'Admin', active: true },
    {
      id: '2',
      name: 'Maria Souza',
      email: 'maria@financasetw.com.br',
      role: 'User',
      active: false,
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
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel Admin</h1>
        <p className="text-muted-foreground">Configurações do sistema APP FINANÇAS PESSOAL ETW.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Gerencie as preferências globais do aplicativo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Aplicativo</Label>
              <Input defaultValue="APP FINANÇAS PESSOAL ETW" disabled />
            </div>
            <div className="space-y-2">
              <Label>E-mail de Suporte</Label>
              <Input defaultValue="suporte@financasetw.com.br" />
            </div>
            <Button className="w-full sm:w-auto">Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>Controle de acessos e permissões da equipe.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-md border p-4 bg-card"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{user.name}</p>
                      <Badge
                        variant={user.active ? 'default' : 'secondary'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {user.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={user.active}
                      onCheckedChange={(val) => toggleUserStatus(user.id, val)}
                      title="Alternar Status"
                    />
                    <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button className="w-full" variant="secondary">
                Adicionar Novo Usuário
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Status do Usuário</Label>
                  <p className="text-sm text-muted-foreground">Permitir acesso ao sistema</p>
                </div>
                <Switch
                  checked={editingUser.active}
                  onCheckedChange={(val) => setEditingUser({ ...editingUser, active: val })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateUser}>Salvar Perfil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

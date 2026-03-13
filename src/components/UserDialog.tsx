import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { ShieldAlert } from 'lucide-react'
import type { User } from '@/stores/FinanceContext'

type UserDialogProps = {
  open: boolean
  mode: 'add' | 'edit'
  user: Partial<User>
  onClose: () => void
  onChange: (user: Partial<User>) => void
  onSave: () => void
}

export function UserDialog({ open, mode, user, onClose, onChange, onSave }: UserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#161925] border-slate-800 text-slate-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === 'add' ? 'Adicionar Novo Usuário' : 'Editar Perfil do Usuário'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input
              className="bg-[#0b0e14] border-slate-700 focus-visible:ring-[#0f766e]"
              value={user.name || ''}
              onChange={(e) => onChange({ ...user, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              className="bg-[#0b0e14] border-slate-700 focus-visible:ring-[#0f766e]"
              value={user.email || ''}
              onChange={(e) => onChange({ ...user, email: e.target.value })}
            />
          </div>
          {mode === 'add' && (
            <div className="space-y-2">
              <Label>Senha Temporária</Label>
              <Input
                type="text"
                className="bg-[#0b0e14] border-slate-700 focus-visible:ring-[#0f766e] font-mono"
                value={user.password || ''}
                onChange={(e) => onChange({ ...user, password: e.target.value })}
                placeholder="Defina uma senha de acesso"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-400" /> Permissão
              </Label>
              <Select
                value={user.role}
                onValueChange={(v: 'Admin' | 'User') => onChange({ ...user, role: v })}
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
                value={user.situation}
                onValueChange={(v: 'Ativo' | 'Devedor') => onChange({ ...user, situation: v })}
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
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button className="bg-[#0f766e] text-white" onClick={onSave}>
            Salvar Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

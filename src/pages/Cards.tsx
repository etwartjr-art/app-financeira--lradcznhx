import { useState } from 'react'
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, CreditCard as CardIcon, Edit2, Trash2, CalendarDays } from 'lucide-react'
import { useFinance, type Card as CardType } from '@/stores/FinanceContext'
import { format } from 'date-fns'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const CARD_COLORS = ['#8a05be', '#1d4ed8', '#3f3f46', '#059669', '#ea580c', '#d97706']

export default function Cards() {
  const { cards, addCard, updateCard, deleteCard, transactions, currentMonth } = useFinance()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)

  const [newCard, setNewCard] = useState({
    name: '',
    last4: '',
    status: 'Aberta' as 'Aberta' | 'Fechada' | 'Atrasada',
    limit: '',
    used: '',
    closingDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    color: CARD_COLORS[0],
  })

  const handleSaveCard = () => {
    const limitNum = parseFloat(newCard.limit)
    const usedNum = parseFloat(newCard.used) || 0
    if (!newCard.name || isNaN(limitNum)) {
      return toast({
        title: 'Preencha os campos obrigatórios corretamente.',
        variant: 'destructive',
      })
    }
    addCard({
      name: newCard.name,
      type: 'Crédito',
      last4: newCard.last4 || '0000',
      limit: limitNum,
      used: usedNum,
      color: newCard.color,
      closingDate: newCard.closingDate,
      dueDate: newCard.dueDate,
      status: newCard.status,
    })
    setIsAddOpen(false)
    setNewCard({
      name: '',
      last4: '',
      status: 'Aberta',
      limit: '',
      used: '',
      closingDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      color: CARD_COLORS[0],
    })
    toast({ title: 'Cartão adicionado com sucesso!' })
  }

  const handleUpdateCard = () => {
    if (!editingCard) return
    const limitNum = parseFloat(editingCard.limit.toString())
    if (!editingCard.name || isNaN(limitNum)) {
      return toast({
        title: 'Preencha os campos obrigatórios corretamente.',
        variant: 'destructive',
      })
    }
    updateCard(editingCard.id, editingCard)
    setEditingCard(null)
    toast({ title: 'Cartão atualizado com sucesso!' })
  }

  const handleDeleteCard = (id: string) => {
    deleteCard(id)
    toast({ title: 'Cartão removido.' })
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Cartões de Crédito</h1>
          <p className="text-slate-400">Gerencie seus cartões e faturas</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-lg">
              <Plus className="mr-2 h-4 w-4" /> Novo Cartão
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#161925] border-slate-800 text-slate-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Novo Cartão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nome do Cartão</Label>
                <Input
                  className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                  value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                  placeholder="Ex: Nubank Platinum"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Últimos 4 dígitos</Label>
                  <Input
                    className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                    value={newCard.last4}
                    onChange={(e) => setNewCard({ ...newCard, last4: e.target.value })}
                    placeholder="0000"
                    maxLength={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Status</Label>
                  <Select
                    value={newCard.status}
                    onValueChange={(v: any) => setNewCard({ ...newCard, status: v })}
                  >
                    <SelectTrigger className="bg-[#0f111a] border-slate-700 focus:ring-[#0f766e]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161925] border-slate-700 text-slate-100">
                      <SelectItem value="Aberta">Aberta</SelectItem>
                      <SelectItem value="Fechada">Fechada</SelectItem>
                      <SelectItem value="Atrasada">Atrasada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Limite (R$)</Label>
                  <Input
                    type="number"
                    className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                    value={newCard.limit}
                    onChange={(e) => setNewCard({ ...newCard, limit: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Gasto Atual (R$)</Label>
                  <Input
                    type="number"
                    className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                    value={newCard.used}
                    onChange={(e) => setNewCard({ ...newCard, used: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Data Fechamento</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                      value={newCard.closingDate}
                      onChange={(e) => setNewCard({ ...newCard, closingDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Data Vencimento</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                      value={newCard.dueDate}
                      onChange={(e) => setNewCard({ ...newCard, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Cor do Cartão</Label>
                <div className="flex gap-3">
                  {CARD_COLORS.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                        newCard.color === color ? 'border-white' : 'border-transparent',
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCard({ ...newCard, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
                onClick={() => setIsAddOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white"
                onClick={handleSaveCard}
              >
                Criar Cartão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => {
          // Dynamic calculation based on transactions linked to this card for current month
          const cardTransactions = transactions.filter(
            (t) =>
              t.origin === card.name &&
              t.type === 'expense' &&
              new Date(t.date).getMonth() === currentMonth.getMonth() &&
              new Date(t.date).getFullYear() === currentMonth.getFullYear(),
          )

          const usedThisMonth = cardTransactions.reduce((acc, t) => acc + t.amount, 0)
          // Fallback to manual 'used' if no transactions found, or always use dynamic? Real-time totals requested.
          const activeUsed = usedThisMonth > 0 ? usedThisMonth : card.used
          const perc = Math.min((activeUsed / card.limit) * 100, 100)
          const available = Math.max(0, card.limit - activeUsed)

          return (
            <div
              key={card.id}
              className="flex flex-col gap-0 rounded-2xl border border-slate-800 bg-[#161925] text-slate-100 shadow-md overflow-hidden animate-fade-in-up hover:border-slate-700 transition-colors"
            >
              <div
                className="relative p-5 h-48 flex flex-col justify-between"
                style={{ backgroundColor: card.color }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/50 pointer-events-none" />
                <div className="relative z-10 flex justify-between items-start">
                  <CardIcon className="h-8 w-8 text-white/80" />
                  <div className="flex items-center gap-1 bg-black/20 rounded-md px-2 py-1 backdrop-blur-sm">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        card.status === 'Aberta'
                          ? 'bg-emerald-400'
                          : card.status === 'Fechada'
                            ? 'bg-orange-400'
                            : 'bg-red-400',
                      )}
                    />
                    <span className="text-[10px] font-medium text-white/90">{card.status}</span>
                  </div>
                </div>

                <div className="relative z-10 space-y-1 mt-auto">
                  <div className="flex items-center tracking-widest text-lg font-mono text-white/90 gap-3 opacity-80">
                    <span>••••</span>
                    <span>••••</span>
                    <span>••••</span>
                    <span>{card.last4}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                    {card.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 space-y-4 bg-[#161925]">
                <div className="flex justify-between items-end">
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>Utilizado</span>
                      <span>{perc.toFixed(0)}% usado</span>
                    </div>
                    <Progress value={perc} className="h-1.5 bg-slate-800 [&>div]:bg-[#0f766e]" />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Fecha:{' '}
                    {format(new Date(card.closingDate), 'dd/MM/yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Vence:{' '}
                    {format(new Date(card.dueDate), 'dd/MM/yyyy')}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Disponível
                    </p>
                    <p className="text-lg font-bold text-[#10b981]">
                      R$ {available.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                      onClick={() => setEditingCard(card)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
        <DialogContent className="bg-[#161925] border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Cartão</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nome do Cartão</Label>
                <Input
                  className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                  value={editingCard.name}
                  onChange={(e) => setEditingCard({ ...editingCard, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Últimos 4 dígitos</Label>
                  <Input
                    className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                    value={editingCard.last4}
                    onChange={(e) => setEditingCard({ ...editingCard, last4: e.target.value })}
                    maxLength={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Status</Label>
                  <Select
                    value={editingCard.status}
                    onValueChange={(v: any) => setEditingCard({ ...editingCard, status: v })}
                  >
                    <SelectTrigger className="bg-[#0f111a] border-slate-700 focus:ring-[#0f766e]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161925] border-slate-700 text-slate-100">
                      <SelectItem value="Aberta">Aberta</SelectItem>
                      <SelectItem value="Fechada">Fechada</SelectItem>
                      <SelectItem value="Atrasada">Atrasada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Limite Total (R$)</Label>
                  <Input
                    type="number"
                    className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                    value={editingCard.limit}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, limit: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Gasto Atual (R$)</Label>
                  <Input
                    type="number"
                    className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                    value={editingCard.used}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, used: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Data Fechamento</Label>
                  <Input
                    type="date"
                    className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                    value={editingCard.closingDate}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, closingDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Data Vencimento</Label>
                  <Input
                    type="date"
                    className="bg-[#0f111a] border-slate-700 focus-visible:ring-[#0f766e]"
                    value={editingCard.dueDate}
                    onChange={(e) => setEditingCard({ ...editingCard, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Cor do Cartão</Label>
                <div className="flex gap-3">
                  {CARD_COLORS.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                        editingCard.color === color ? 'border-white' : 'border-transparent',
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingCard({ ...editingCard, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
              onClick={() => setEditingCard(null)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white"
              onClick={handleUpdateCard}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

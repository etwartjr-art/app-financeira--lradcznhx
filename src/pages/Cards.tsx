import { useState } from 'react'
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
import { MonthSelector } from '@/components/MonthSelector'

export default function Cards() {
  const { cards, addCard, updateCard, deleteCard, transactions, currentMonth, addTransaction } =
    useFinance()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)
  const [expenseCard, setExpenseCard] = useState<CardType | null>(null)

  const [newExp, setNewExp] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
  })
  const [newCard, setNewCard] = useState({
    name: '',
    last4: '',
    status: 'Aberta' as const,
    limit: '',
    closingDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
  })

  const handleSaveCard = () => {
    const limitNum = parseFloat(newCard.limit)
    if (!newCard.name || isNaN(limitNum))
      return toast({ title: 'Preencha corretamente.', variant: 'destructive' })
    addCard({
      name: newCard.name,
      type: 'Crédito',
      last4: newCard.last4 || '0000',
      limit: limitNum,
      used: 0,
      color: '#ff7800',
      closingDate: newCard.closingDate,
      dueDate: newCard.dueDate,
      status: newCard.status,
    })
    setIsAddOpen(false)
    toast({ title: 'Cartão adicionado!' })
  }

  const handleUpdateCard = () => {
    if (!editingCard) return
    updateCard(editingCard.id, editingCard)
    setEditingCard(null)
    toast({ title: 'Cartão atualizado!' })
  }

  const handleAddExpense = () => {
    if (!expenseCard || !newExp.description || !newExp.amount)
      return toast({ title: 'Preencha os campos obrigatórios.', variant: 'destructive' })
    addTransaction({
      description: newExp.description,
      amount: Number(newExp.amount),
      type: 'expense',
      category: 'Outros',
      origin: expenseCard.name,
      date: new Date(newExp.date).toISOString(),
      tags: newExp.tags,
    })
    setExpenseCard(null)
    setNewExp({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      tags: '',
    })
    toast({ title: 'Despesa vinculada ao cartão com sucesso!' })
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Cartões de Crédito</h1>
          <p className="text-slate-400">Gerencie seus cartões e faturas</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector />
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
                  <Label>Instituição</Label>
                  <Input
                    className="bg-[#0b0e14] border-slate-700"
                    value={newCard.name}
                    onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                    placeholder="Ex: Itau"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Últimos 4 dígitos</Label>
                    <Input
                      className="bg-[#0b0e14] border-slate-700"
                      value={newCard.last4}
                      onChange={(e) => setNewCard({ ...newCard, last4: e.target.value })}
                      maxLength={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Limite (R$)</Label>
                    <Input
                      type="number"
                      className="bg-[#0b0e14] border-slate-700"
                      value={newCard.limit}
                      onChange={(e) => setNewCard({ ...newCard, limit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Fechamento</Label>
                    <Input
                      type="date"
                      className="bg-[#0b0e14] border-slate-700"
                      value={newCard.closingDate}
                      onChange={(e) => setNewCard({ ...newCard, closingDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Vencimento</Label>
                    <Input
                      type="date"
                      className="bg-[#0b0e14] border-slate-700"
                      value={newCard.dueDate}
                      onChange={(e) => setNewCard({ ...newCard, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button className="bg-[#0f766e] text-white" onClick={handleSaveCard}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => {
          const usedThisMonth = transactions
            .filter(
              (t) =>
                t.origin === card.name &&
                t.type === 'expense' &&
                new Date(t.date).getMonth() === currentMonth.getMonth() &&
                new Date(t.date).getFullYear() === currentMonth.getFullYear(),
            )
            .reduce((acc, t) => acc + t.amount, 0)

          const activeUsed = usedThisMonth
          const perc = Math.min((activeUsed / card.limit) * 100, 100)
          const available = Math.max(0, card.limit - activeUsed)

          return (
            <div
              key={card.id}
              className="flex flex-col rounded-2xl bg-[#161925] border border-slate-800 text-slate-100 shadow-lg relative overflow-hidden transition-transform hover:-translate-y-1"
            >
              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <CardIcon className="w-8 h-8 text-slate-400" />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingCard(card)}
                      className="hover:bg-slate-800 p-1 rounded"
                    >
                      <Edit2 className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="hover:bg-red-500/20 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                    </button>
                    <Badge className="bg-amber-500/10 text-amber-500 border-none font-medium px-2 py-0.5">
                      {card.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1 mt-2">
                  <p className="text-lg tracking-widest font-mono text-slate-300 opacity-80">
                    •••• •••• •••• {card.last4}
                  </p>
                  <p className="text-sm font-semibold uppercase text-slate-400">{card.name}</p>
                </div>

                <div className="space-y-2 mt-4 border-t border-slate-800 pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Fatura do Mês</span>
                    <span className="font-bold text-white">
                      R$ {activeUsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    <span>{perc.toFixed(0)}% usado</span>
                    <span>Limite: R$ {card.limit.toLocaleString('pt-BR')}</span>
                  </div>
                  <Progress value={perc} className="h-1.5 bg-slate-800 [&>div]:bg-amber-500" />
                </div>

                <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                  <span className="flex items-center">
                    <CalendarDays className="w-3 h-3 mr-1" /> Fecha: {card.closingDate}
                  </span>
                  <span className="flex items-center">
                    <CalendarDays className="w-3 h-3 mr-1" /> Vence: {card.dueDate}
                  </span>
                </div>

                <div className="bg-[#0b0e14] rounded-xl p-3 flex flex-col mt-2 border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Disponível no Cartão
                  </span>
                  <span className="text-xl font-bold text-emerald-500">
                    R$ {available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-2 bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
                  onClick={() => setExpenseCard(card)}
                >
                  Adicionar Despesa
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={!!editingCard} onOpenChange={(o) => !o && setEditingCard(null)}>
        <DialogContent className="bg-[#161925] border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Cartão</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Instituição</Label>
                <Input
                  className="bg-[#0b0e14] border-slate-700"
                  value={editingCard.name}
                  onChange={(e) => setEditingCard({ ...editingCard, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Limite (R$)</Label>
                  <Input
                    type="number"
                    className="bg-[#0b0e14] border-slate-700"
                    value={editingCard.limit}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, limit: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editingCard.status}
                    onValueChange={(v: any) => setEditingCard({ ...editingCard, status: v })}
                  >
                    <SelectTrigger className="bg-[#0b0e14] border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161925] border-slate-700 text-slate-100">
                      <SelectItem value="Aberta">Aberta</SelectItem>
                      <SelectItem value="Fechada">Fechada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingCard(null)}
              className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button className="bg-[#0f766e] text-white" onClick={handleUpdateCard}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!expenseCard} onOpenChange={(o) => !o && setExpenseCard(null)}>
        <DialogContent className="bg-[#161925] border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Despesa: {expenseCard?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                className="bg-[#0b0e14] border-slate-700"
                value={newExp.description}
                onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  className="bg-[#0b0e14] border-slate-700"
                  value={newExp.amount}
                  onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  className="bg-[#0b0e14] border-slate-700"
                  value={newExp.date}
                  onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExpenseCard(null)}
              className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleAddExpense}>
              Salvar Despesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useState } from 'react'
import {
  Card as UICard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  CreditCard as CardIcon,
  Edit2,
  ChevronDown,
  ReceiptText,
} from 'lucide-react'
import { useFinance, type Card as CardType, type Transaction } from '@/stores/FinanceContext'
import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from '@/hooks/use-toast'

export default function Cards() {
  const {
    cards,
    addCard,
    updateCard,
    transactions,
    currentMonth,
    setCurrentMonth,
    updateTransaction,
  } = useFinance()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  const [newCard, setNewCard] = useState({
    name: '',
    type: 'Credit',
    limit: '',
    color: '#18181b',
  })

  const handleSaveCard = () => {
    const limitNum = parseFloat(newCard.limit)
    if (!newCard.name || isNaN(limitNum)) {
      return toast({ title: 'Preencha os campos numéricos corretamente.', variant: 'destructive' })
    }
    addCard({
      name: newCard.name,
      type: newCard.type,
      limit: limitNum,
      used: 0,
      color: newCard.color,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Aberta',
    })
    setIsAddOpen(false)
    setNewCard({ name: '', type: 'Credit', limit: '', color: '#18181b' })
    toast({ title: 'Cartão adicionado com sucesso!' })
  }

  const handleUpdateCard = () => {
    if (!editingCard) return
    const limitNum = parseFloat(editingCard.limit.toString())
    if (!editingCard.name || isNaN(limitNum)) {
      return toast({ title: 'Preencha os campos numéricos corretamente.', variant: 'destructive' })
    }
    updateCard(editingCard.id, {
      name: editingCard.name,
      type: editingCard.type,
      limit: limitNum,
    })
    setEditingCard(null)
    toast({ title: 'Cartão atualizado com sucesso!' })
  }

  const handleUpdateTx = () => {
    if (!editingTx) return
    updateTransaction(editingTx.id, {
      description: editingTx.description,
      amount: Number(editingTx.amount),
      date: editingTx.date,
      category: editingTx.category,
    })
    setEditingTx(null)
    toast({ title: 'Transação atualizada com sucesso!' })
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cartões de Crédito</h1>
          <p className="text-muted-foreground">Gerencie seus limites e faturas.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-between bg-background rounded-md border p-1 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold min-w-[120px] text-center capitalize text-sm">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Cartão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do Banco / Cartão</Label>
                  <Input
                    value={newCard.name}
                    onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                    placeholder="Ex: Nubank"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bandeira / Tipo</Label>
                    <Input
                      value={newCard.type}
                      onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                      placeholder="Ex: Mastercard"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor do Cartão</Label>
                    <Input
                      type="color"
                      className="p-1 h-10"
                      value={newCard.color}
                      onChange={(e) => setNewCard({ ...newCard, color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Limite Total</Label>
                  <Input
                    type="number"
                    value={newCard.limit}
                    onChange={(e) => setNewCard({ ...newCard, limit: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveCard}>Salvar Cartão</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const cardTransactions = transactions.filter(
            (t) =>
              t.origin === card.name &&
              t.type === 'expense' &&
              new Date(t.date).getMonth() === currentMonth.getMonth() &&
              new Date(t.date).getFullYear() === currentMonth.getFullYear(),
          )

          const usedThisMonth = cardTransactions.reduce((acc, t) => acc + t.amount, 0)
          const perc = Math.min((usedThisMonth / card.limit) * 100, 100)
          const available = Math.max(0, card.limit - usedThisMonth)

          return (
            <div
              key={card.id}
              className="flex flex-col gap-0 rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden animate-fade-in-up"
            >
              <div
                className="relative p-6 text-white transition-colors"
                style={{ backgroundColor: card.color }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/60 pointer-events-none" />
                <div className="relative z-10 flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold">{card.name}</h3>
                    <p className="text-white/80 text-sm">{card.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/20"
                      onClick={() => setEditingCard(card)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <CardIcon className="h-8 w-8 opacity-70" />
                  </div>
                </div>

                <div className="relative z-10 space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Usado: R$ {usedThisMonth.toFixed(2)}</span>
                    <span>Total: R$ {card.limit.toFixed(2)}</span>
                  </div>
                  <Progress value={perc} className="h-2 bg-white/20 [&>div]:bg-white" />
                  <p className="text-right text-xs font-semibold text-white/90">
                    Disponível: R$ {available.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-card">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full flex justify-between group">
                      <span className="flex items-center gap-2">
                        <ReceiptText className="w-4 h-4" />
                        Despesas do Mês
                      </span>
                      <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 data-[state=open]:animate-fade-in">
                    {cardTransactions.length === 0 ? (
                      <p className="text-sm text-center text-muted-foreground py-6 border rounded-md border-dashed">
                        Nenhuma despesa lançada para este cartão neste mês.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                        {cardTransactions.map((tx) => (
                          <div
                            key={tx.id}
                            onClick={() => setEditingTx(tx)}
                            className="flex justify-between items-center p-3 rounded-lg border bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                          >
                            <div className="flex flex-col overflow-hidden mr-2">
                              <span className="text-sm font-medium truncate">{tx.description}</span>
                              <span className="text-xs text-muted-foreground truncate">
                                {tx.category} • {format(new Date(tx.date), 'dd/MM/yyyy')}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-rose-500 whitespace-nowrap shrink-0">
                              - R$ {tx.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cartão</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Banco / Cartão</Label>
                <Input
                  value={editingCard.name}
                  onChange={(e) => setEditingCard({ ...editingCard, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bandeira / Tipo</Label>
                <Input
                  value={editingCard.type}
                  onChange={(e) => setEditingCard({ ...editingCard, type: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Limite Total</Label>
                <Input
                  type="number"
                  value={editingCard.limit}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, limit: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateCard}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTx} onOpenChange={(open) => !open && setEditingTx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Despesa</DialogTitle>
          </DialogHeader>
          {editingTx && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={editingTx.description}
                  onChange={(e) => setEditingTx({ ...editingTx, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={editingTx.category}
                  onChange={(e) => setEditingTx({ ...editingTx, category: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    value={editingTx.amount}
                    onChange={(e) => setEditingTx({ ...editingTx, amount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={editingTx.date.substring(0, 10)}
                    onChange={(e) => {
                      const newDate = e.target.value
                      if (newDate) {
                        const d = new Date(`${newDate}T12:00:00Z`)
                        setEditingTx({ ...editingTx, date: d.toISOString() })
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateTx}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

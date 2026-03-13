import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, ChevronLeft, ChevronRight, CreditCard as CardIcon } from 'lucide-react'
import { useFinance } from '@/stores/FinanceContext'
import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from '@/hooks/use-toast'

export default function Cards() {
  const { cards, addCard, transactions, currentMonth, setCurrentMonth } = useFinance()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newCard, setNewCard] = useState({
    name: '',
    type: 'Credit',
    limit: '',
    used: '',
    color: '#18181b',
  })

  const cardTransactions = transactions.filter(
    (t) =>
      cards.some((c) => c.name === t.origin) &&
      new Date(t.date).getMonth() === currentMonth.getMonth() &&
      new Date(t.date).getFullYear() === currentMonth.getFullYear(),
  )

  const handleSaveCard = () => {
    const limitNum = parseFloat(newCard.limit)
    const usedNum = parseFloat(newCard.used)
    if (!newCard.name || isNaN(limitNum) || isNaN(usedNum)) {
      return toast({ title: 'Preencha os campos numéricos corretamente.', variant: 'destructive' })
    }
    addCard({
      name: newCard.name,
      type: newCard.type,
      limit: limitNum,
      used: usedNum,
      color: newCard.color,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Aberta',
    })
    setIsAddOpen(false)
    setNewCard({ name: '', type: 'Credit', limit: '', used: '', color: '#18181b' })
    toast({ title: 'Cartão adicionado com sucesso!' })
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
                <div className="space-y-2">
                  <Label>Bandeira / Tipo</Label>
                  <Input
                    value={newCard.type}
                    onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                    placeholder="Ex: Mastercard"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Limite Total</Label>
                    <Input
                      type="number"
                      value={newCard.limit}
                      onChange={(e) => setNewCard({ ...newCard, limit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Limite Usado</Label>
                    <Input
                      type="number"
                      value={newCard.used}
                      onChange={(e) => setNewCard({ ...newCard, used: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveCard}>Salvar Cartão</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const perc = Math.min((card.used / card.limit) * 100, 100)
          return (
            <Card
              key={card.id}
              className="relative overflow-hidden shadow-md border-0 text-white"
              style={{ backgroundColor: card.color }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/60 pointer-events-none" />
              <CardHeader className="relative z-10 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold">{card.name}</CardTitle>
                    <CardDescription className="text-white/80">{card.type}</CardDescription>
                  </div>
                  <CardIcon className="h-8 w-8 opacity-70" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Usado: R$ {card.used.toFixed(2)}</span>
                    <span>Total: R$ {card.limit.toFixed(2)}</span>
                  </div>
                  <Progress value={perc} className="h-2 bg-white/20" />
                  <p className="text-right text-xs font-semibold text-white/90">
                    Disponível: R$ {(card.limit - card.used).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>
            Despesas no Cartão - {format(currentMonth, 'MMMM', { locale: ptBR })}
          </CardTitle>
          <CardDescription>Gastos lançados em cartões neste mês.</CardDescription>
        </CardHeader>
        <CardContent>
          {cardTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma transação de cartão neste mês.</p>
          ) : (
            <div className="space-y-4">
              {cardTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-sm">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.origin} • {format(new Date(t.date), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <span className="font-semibold text-rose-600">- R$ {t.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

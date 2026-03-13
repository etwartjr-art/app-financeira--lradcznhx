import { useState, useEffect } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useFinance } from '@/stores/FinanceContext'
import {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Coffee,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

const CATEGORIES = [
  { id: 'Alimentação', icon: Utensils },
  { id: 'Transporte', icon: Car },
  { id: 'Casa', icon: Home },
  { id: 'Compras', icon: ShoppingBag },
  { id: 'Café', icon: Coffee },
]

export function MagicEntryDrawer() {
  const { isMagicDrawerOpen, setMagicDrawerOpen, addTransaction, cards } = useFinance()
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [origin, setOrigin] = useState('PIX')
  const [category, setCategory] = useState(CATEGORIES[0].id)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])

  const ORIGINS = ['PIX', 'Dinheiro', ...cards.map((c) => c.name)]

  useEffect(() => {
    if (isMagicDrawerOpen) {
      if (!ORIGINS.includes(origin)) setOrigin(ORIGINS[0])
    }
  }, [isMagicDrawerOpen, ORIGINS, origin])

  const handleSave = () => {
    const val = parseFloat(amount.replace(',', '.'))
    if (isNaN(val) || val <= 0) {
      toast({ title: 'Valor inválido', variant: 'destructive' })
      return
    }

    const [y, m, d] = date.split('-')
    const localDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 12, 0, 0)

    addTransaction({
      amount: val,
      description: `Nova ${type === 'expense' ? 'Despesa' : 'Receita'}`,
      type,
      origin,
      category,
      date: localDate.toISOString(),
    })

    toast({
      title: 'Transação salva com sucesso!',
      style: { backgroundColor: 'hsl(var(--success, 142.1 76.2% 36.3%))', color: 'white' },
    })
    setMagicDrawerOpen(false)
    setAmount('')
  }

  return (
    <Drawer open={isMagicDrawerOpen} onOpenChange={setMagicDrawerOpen}>
      <DrawerContent className="h-[85vh] flex flex-col bg-background px-4">
        <DrawerHeader className="px-0">
          <DrawerTitle className="text-center text-muted-foreground font-medium">
            Nova Transação
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto pb-6 space-y-6">
          <div className="flex justify-center items-center">
            <span className="text-2xl font-semibold mr-1">R$</span>
            <Input
              type="number"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-5xl font-bold border-none shadow-none text-center h-16 w-48 focus-visible:ring-0 p-0"
              autoFocus
            />
          </div>

          <ToggleGroup
            type="single"
            value={type}
            onValueChange={(v) => v && setType(v as 'expense' | 'income')}
            className="justify-center"
          >
            <ToggleGroupItem
              value="expense"
              className={cn(
                'px-6 rounded-full',
                type === 'expense' && 'bg-destructive/10 text-destructive',
              )}
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" /> Despesa
            </ToggleGroupItem>
            <ToggleGroupItem
              value="income"
              className={cn(
                'px-6 rounded-full',
                type === 'income' && 'bg-[hsl(142.1,76.2%,36.3%)]/10 text-[hsl(142.1,76.2%,36.3%)]',
              )}
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" /> Receita
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-muted-foreground">Data da Transação</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-muted-foreground">Origem / Cartão</label>
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
              {ORIGINS.map((o) => (
                <button
                  key={o}
                  onClick={() => setOrigin(o)}
                  className={cn(
                    'whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors',
                    origin === o
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:bg-muted',
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-muted-foreground">Categoria</label>
            <div className="grid grid-cols-4 gap-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border transition-all',
                    category === c.id
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted',
                  )}
                >
                  <c.icon className="w-6 h-6 mb-1" />
                  <span className="text-xs truncate w-full text-center">{c.id}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DrawerFooter className="px-0 pt-2 pb-8">
          <Button size="lg" className="w-full text-lg h-14 rounded-xl" onClick={handleSave}>
            Salvar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

import { useState } from 'react'
import { useFinance } from '@/stores/FinanceContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Upload, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from '@/hooks/use-toast'

export default function Conciliation() {
  const { transactions, resolvePending } = useFinance()
  const pendingTransactions = transactions.filter((t) => t.isPending)

  const [animatingId, setAnimatingId] = useState<string | null>(null)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)

  const handleAction = (id: string, action: 'match' | 'edit') => {
    setAnimatingId(id)
    setDirection(action === 'match' ? 'right' : 'left')

    setTimeout(() => {
      resolvePending(id, action === 'edit' ? 'Outros' : undefined) // Na vida real abriria modal de edição
      setAnimatingId(null)
      setDirection(null)
      toast({
        title: action === 'match' ? 'Categorizado com sucesso!' : 'Categoria alterada.',
        variant: 'default',
      })
    }, 300)
  }

  const simulateImport = () => {
    toast({ title: 'Simulando importação...', description: 'Lendo arquivo OFX.' })
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 p-6 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Conciliação</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={simulateImport}
          className="gap-2 rounded-full text-xs"
        >
          <Upload className="w-3 h-3" /> OFX
        </Button>
      </div>

      <p className="text-muted-foreground text-sm mb-6">
        Você tem <strong className="text-foreground">{pendingTransactions.length}</strong>{' '}
        transações pendentes de revisão.
      </p>

      <div className="relative flex-1">
        {pendingTransactions.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground animate-fade-in">
            <Sparkles className="w-12 h-12 mb-4 opacity-20" />
            <p>Tudo conciliado!</p>
            <p className="text-xs">Seu financeiro está em dia.</p>
          </div>
        ) : (
          <div className="space-y-4 relative">
            {pendingTransactions.slice(0, 3).map((tx, index) => {
              const isTop = index === 0
              const isAnimating = animatingId === tx.id

              return (
                <div
                  key={tx.id}
                  className={`transition-all duration-300 ease-in-out ${isTop ? 'relative z-30' : 'absolute top-0 left-0 w-full'} ${
                    isAnimating
                      ? direction === 'right'
                        ? 'translate-x-full opacity-0 rotate-12'
                        : '-translate-x-full opacity-0 -rotate-12'
                      : ''
                  }`}
                  style={{
                    transform:
                      !isAnimating && !isTop
                        ? `translateY(${index * 12}px) scale(${1 - index * 0.05})`
                        : undefined,
                    zIndex: 30 - index,
                    opacity: !isAnimating ? 1 - index * 0.2 : undefined,
                  }}
                >
                  <Card className="shadow-elevation border-border">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="flex justify-center">
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary hover:bg-primary/20 gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Sugestão de IA
                        </Badge>
                      </div>

                      <div>
                        <h2 className="text-3xl font-bold my-2">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(tx.amount)}
                        </h2>
                        <p className="text-lg font-medium text-foreground">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.origin} • {format(new Date(tx.date), 'dd/MM/yyyy')}
                        </p>
                      </div>

                      <div className="bg-muted rounded-xl p-3 my-4 border border-border/50 text-sm">
                        Isso é da categoria{' '}
                        <strong className="text-foreground">{tx.category}</strong>?
                      </div>

                      <div className="flex justify-between gap-4 pt-2">
                        <Button
                          variant="outline"
                          className="w-16 h-16 rounded-full border-destructive text-destructive hover:bg-destructive hover:text-white"
                          onClick={() => handleAction(tx.id, 'edit')}
                        >
                          <X className="w-8 h-8" />
                        </Button>
                        <Button
                          variant="outline"
                          className="w-16 h-16 rounded-full border-success text-success hover:bg-success hover:text-white"
                          onClick={() => handleAction(tx.id, 'match')}
                        >
                          <Check className="w-8 h-8" />
                        </Button>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground px-2">
                        <span>Alterar</span>
                        <span>Confirmar</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

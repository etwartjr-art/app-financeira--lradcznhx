import { useFinance } from '@/stores/FinanceContext'
import { Card as UICard, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default function Cards() {
  const { cards, transactions } = useFinance()
  const cardTransactions = transactions.filter(
    (t) => t.category === 'Cartão' || t.origin.includes('Cartão'),
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 pt-8 p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Meus Cartões</h1>

      <Carousel className="w-full max-w-sm mx-auto" opts={{ align: 'center' }}>
        <CarouselContent>
          {cards.map((card) => {
            const usagePercent = (card.used / card.limit) * 100
            const isDanger = usagePercent > 90
            const isWarning = usagePercent > 80 && !isDanger

            return (
              <CarouselItem key={card.id} className="basis-[90%]">
                <UICard
                  className="border-none shadow-elevation overflow-hidden text-white h-48 relative flex flex-col justify-between p-5"
                  style={{ backgroundColor: card.color }}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <svg className="w-32 h-32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                  </div>
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="font-bold text-lg tracking-wider">{card.name}</span>
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-none hover:bg-white/30"
                    >
                      {card.status}
                    </Badge>
                  </div>
                  <div className="relative z-10 space-y-1">
                    <p className="text-sm opacity-80">Fatura Atual</p>
                    <p className="text-3xl font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(card.used)}
                    </p>
                    <p className="text-xs opacity-80 pt-1">
                      Limite Disponível:{' '}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(card.limit - card.used)}
                    </p>
                  </div>
                </UICard>

                <div className="mt-4 px-1 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Limite Usado</span>
                    <span>{usagePercent.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={usagePercent}
                    className="h-2 bg-secondary"
                    style={
                      {
                        '--primary': isDanger
                          ? 'var(--destructive)'
                          : isWarning
                            ? 'var(--warning)'
                            : 'var(--success)',
                      } as React.CSSProperties
                    }
                  />
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>

      <div className="mt-8">
        <h3 className="font-semibold text-foreground mb-4 px-1">Timeline da Fatura (Mês Atual)</h3>
        <div className="relative pl-4 border-l-2 border-border space-y-6">
          {cardTransactions.map((tx, i) => (
            <div key={tx.id} className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-background bg-primary"></div>
              <div className="bg-card p-3 rounded-xl border border-border/50 shadow-sm ml-2">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{tx.description}</span>
                  <span className="font-semibold text-sm">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      tx.amount,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{format(new Date(tx.date), 'dd/MM - HH:mm')}</span>
                  <span>{tx.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

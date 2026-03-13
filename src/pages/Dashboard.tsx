import { useFinance } from '@/stores/FinanceContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { balance, transactions } = useFinance()

  const chartData = [
    { name: 'Receitas', value: 5000, color: 'hsl(var(--success))' },
    { name: 'Despesas', value: 3200, color: 'hsl(var(--destructive))' },
  ]

  const chartConfig = {
    Receitas: { label: 'Receitas', color: 'hsl(var(--success))' },
    Despesas: { label: 'Despesas', color: 'hsl(var(--destructive))' },
  }

  const settledTransactions = transactions.filter((t) => !t.isPending)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-primary px-6 pt-12 pb-6 rounded-b-3xl text-primary-foreground shadow-sm">
        <h2 className="text-primary-foreground/80 font-medium">Olá, Mentorando!</h2>

        <div className="flex items-center justify-between mt-6 mb-2">
          <button className="p-1 hover:bg-primary-foreground/10 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold capitalize">
            {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button className="p-1 hover:bg-primary-foreground/10 rounded-full">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-primary-foreground/80 mb-1">
            Saldo em Contas (Caixa)
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
          </h1>
        </div>
      </div>

      <div className="p-6 space-y-6 -mt-4 relative z-10">
        {/* Atenção Card */}
        <Card className="bg-warning/10 border-warning/20 shadow-none">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="text-warning w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning-foreground text-sm">
                Fatura Nubank Próxima
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Vence em 2 dias. Valor estimado: R$ 4.200,00
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="shadow-subtle border-border/50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Visão do Mês</h3>
            <div className="h-[200px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>Receitas
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>Despesas
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 px-1">Últimas Movimentações</h3>
          <div className="space-y-3">
            {settledTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-card p-4 rounded-xl border border-border/50 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      tx.type === 'income'
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive',
                    )}
                  >
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.origin} • {format(new Date(tx.date), 'dd/MM')}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'font-semibold',
                    tx.type === 'income' ? 'text-success' : 'text-foreground',
                  )}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    tx.amount,
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSign,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useFinance } from '@/stores/FinanceContext'
import { Button } from '@/components/ui/button'
import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const chartData = [
  { name: 'Jan', total: 1200 },
  { name: 'Fev', total: 2100 },
  { name: 'Mar', total: 1800 },
  { name: 'Abr', total: 2400 },
  { name: 'Mai', total: 2800 },
  { name: 'Jun', total: 3200 },
]

export default function Dashboard() {
  const { balance, transactions, currentMonth, setCurrentMonth } = useFinance()

  const filteredTx = transactions.filter((t) => {
    const d = new Date(t.date)
    return (
      d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()
    )
  })

  const receitas = filteredTx
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)
  const despesas = filteredTx
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral e fluxo de caixa.</p>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto bg-background rounded-md border p-1 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-semibold min-w-[140px] text-center capitalize text-sm">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Geral (Caixa)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {balance.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">Base em Dinheiro/PIX</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas (Mês)</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {receitas.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas (Mês)</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              R$ {despesas.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balanço do Mês</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                receitas - despesas >= 0 ? 'text-emerald-600' : 'text-rose-600',
              )}
            >
              R$ {(receitas - despesas).toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 hidden md:block">
          <CardHeader>
            <CardTitle>Histórico Recente</CardTitle>
            <CardDescription>Visualização dos últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer
              config={{ total: { label: 'Total (R$)', color: 'hsl(var(--primary))' } }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Transações de {format(currentMonth, 'MMMM', { locale: ptBR })}</CardTitle>
            <CardDescription>Lançamentos no mês selecionado.</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTx.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma transação neste mês.
              </p>
            ) : (
              <div className="space-y-6">
                {filteredTx.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      {t.type === 'income' ? (
                        <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-rose-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{t.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(t.date), 'dd/MM/yyyy')}</span> •{' '}
                        <span>{t.origin}</span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'font-medium',
                        t.type === 'income' ? 'text-emerald-600' : 'text-rose-600',
                      )}
                    >
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

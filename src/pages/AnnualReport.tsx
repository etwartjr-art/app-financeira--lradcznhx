import { useState, useMemo } from 'react'
import { useFinance } from '@/stores/FinanceContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function AnnualReport() {
  const { transactions } = useFinance()
  const [year, setYear] = useState(new Date().getFullYear())

  const reportData = useMemo(() => {
    return MONTHS.map((monthName, index) => {
      const monthTxs = transactions.filter((t) => {
        if (!t.date) return false
        const d = new Date(t.date)
        if (isNaN(d.getTime())) return false
        return d.getMonth() === index && d.getFullYear() === year
      })
      const income = monthTxs
        .filter((t) => t.type === 'income')
        .reduce((a, b) => a + (Number(b.amount) || 0), 0)
      const expense = monthTxs
        .filter((t) => t.type === 'expense')
        .reduce((a, b) => a + (Number(b.amount) || 0), 0)
      return { month: monthName, Receitas: income, Despesas: expense, Saldo: income - expense }
    })
  }, [transactions, year])

  const totals = reportData.reduce(
    (acc, curr) => ({
      income: acc.income + curr.Receitas,
      expense: acc.expense + curr.Despesas,
      net: acc.net + curr.Saldo,
    }),
    { income: 0, expense: 0, net: 0 },
  )

  const availableYears = Array.from(
    new Set(
      transactions
        .filter((t) => t.date && !isNaN(new Date(t.date).getTime()))
        .map((t) => new Date(t.date).getFullYear()),
    ),
  )
  if (!availableYears.includes(year)) availableYears.push(year)
  availableYears.sort((a, b) => b - a)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Relatório Anual</h1>
          <p className="text-slate-400">Visão consolidada do seu ano financeiro</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-400">Selecione o Ano:</span>
          <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-[120px] bg-[#161925] border-slate-800 text-white font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#161925] border-slate-800 text-slate-100">
              {availableYears.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Total Receitas',
            val: totals.income,
            icon: TrendingUp,
            c: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            title: 'Total Despesas',
            val: totals.expense,
            icon: TrendingDown,
            c: 'text-red-500',
            bg: 'bg-red-500/10',
          },
          {
            title: 'Saldo Líquido',
            val: totals.net,
            icon: Wallet,
            c: totals.net >= 0 ? 'text-emerald-500' : 'text-red-500',
            bg: totals.net >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
          },
        ].map((item, i) => (
          <Card key={i} className="bg-[#161925] border-slate-800 shadow-sm">
            <CardContent className="p-6 flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-400">{item.title}</p>
                <p className="text-2xl font-bold text-white">
                  R$ {(Number(item.val) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <item.icon className={`w-5 h-5 ${item.c}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#161925] border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-white font-semibold">Balanço Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              Receitas: { label: 'Receitas', color: '#10b981' },
              Despesas: { label: 'Despesas', color: '#ef4444' },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis
                  dataKey="month"
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `R$${val}`}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="Receitas"
                  fill="var(--color-Receitas)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="Despesas"
                  fill="var(--color-Despesas)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-[#161925] border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#0b0e14]">
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-400 font-semibold tracking-wider text-xs">
                MÊS
              </TableHead>
              <TableHead className="text-right text-slate-400 font-semibold tracking-wider text-xs">
                RECEITAS
              </TableHead>
              <TableHead className="text-right text-slate-400 font-semibold tracking-wider text-xs">
                DESPESAS
              </TableHead>
              <TableHead className="text-right text-slate-400 font-semibold tracking-wider text-xs">
                SALDO
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((d) => (
              <TableRow key={d.month} className="border-slate-800/50 hover:bg-slate-800/30">
                <TableCell className="font-medium text-slate-200">{d.month}</TableCell>
                <TableCell className="text-right text-emerald-500 font-medium">
                  R${' '}
                  {(Number(d.Receitas) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right text-red-500 font-medium">
                  - R${' '}
                  {(Number(d.Despesas) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-bold',
                    d.Saldo >= 0 ? 'text-emerald-500' : 'text-red-500',
                  )}
                >
                  R$ {(Number(d.Saldo) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

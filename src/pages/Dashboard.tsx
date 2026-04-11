import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  BarChart3,
  Receipt,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFinance } from '@/stores/FinanceContext'
import { CashFlowChart, CategoryExpensesChart } from '@/components/dashboard/Charts'
import { MonthSelector } from '@/components/MonthSelector'

import { DashboardSkeleton, ErrorState } from '@/components/StateFeedback'

export default function Dashboard() {
  const { balance, transactions, cards, categories, currentMonth, isLoading, error, retry } =
    useFinance()

  if (isLoading && !transactions.length) return <DashboardSkeleton />
  if (error) return <ErrorState message={error} onRetry={retry} />

  const currentMonthTx = useMemo(
    () =>
      (transactions || []).filter((t) => {
        if (!t.date) return false
        const d = new Date(t.date)
        if (isNaN(d.getTime())) return false
        return (
          d.getMonth() === currentMonth?.getMonth() &&
          d.getFullYear() === currentMonth?.getFullYear()
        )
      }),
    [transactions, currentMonth],
  )

  const receitas = currentMonthTx
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
  const despesas = currentMonthTx
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
  const economia = receitas - despesas

  const gerais = currentMonthTx
    .filter((t) => t.type === 'expense' && !(cards || []).some((c) => c.name === t.origin))
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
  const despesasCartoes = currentMonthTx
    .filter((t) => t.type === 'expense' && (cards || []).some((c) => c.name === t.origin))
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
  const totalConsolidado = gerais + despesasCartoes
  const percGerais = totalConsolidado ? (gerais / totalConsolidado) * 100 : 0
  const percCartoes = totalConsolidado ? (despesasCartoes / totalConsolidado) * 100 : 0

  const cashFlowData = useMemo(() => {
    if (!currentMonth) return []
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const datePrefix = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const txForDay = currentMonthTx.filter((t) => t.date && t.date.startsWith(datePrefix))
      return {
        name: String(day),
        Receitas: txForDay
          .filter((t) => t.type === 'income')
          .reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
        Despesas: txForDay
          .filter((t) => t.type === 'expense')
          .reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
      }
    })
  }, [currentMonthTx, currentMonth])

  const catData = useMemo(
    () =>
      (categories || [])
        .map((c) => ({
          name: c.name,
          color: c.color,
          value: currentMonthTx
            .filter((t) => t.type === 'expense' && t.category === c.name)
            .reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
        }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value),
    [categories, currentMonthTx],
  )

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm">Visão geral das suas finanças</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <MonthSelector />
          <Button
            asChild
            variant="outline"
            className="bg-[#161925] border-slate-800 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 hidden sm:flex"
          >
            <Link to="/annual-report">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span>Relatório Anual</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            title: 'Saldo Atual',
            val: balance,
            icon: Wallet,
            c: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            title: 'Receitas',
            val: receitas,
            icon: TrendingUp,
            c: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            title: 'Despesas',
            val: despesas,
            icon: TrendingDown,
            c: 'text-red-500',
            bg: 'bg-red-500/10',
          },
          {
            title: 'Economia',
            val: Math.max(economia, 0),
            icon: PiggyBank,
            c: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-[#161925] border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-white font-semibold">Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={cashFlowData} />
          </CardContent>
        </Card>
        <Card className="bg-[#161925] border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-white font-semibold">
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryExpensesChart data={catData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-[#161925] border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-white font-semibold">
              Relatório Geral de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="bg-[#0b0e14] p-4 rounded-xl flex-1 border border-slate-800">
                <p className="text-xs text-slate-400 mb-1 font-medium">Despesas Gerais</p>
                <p className="text-xl font-bold text-red-500">
                  R$ {(Number(gerais) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-[#0b0e14] p-4 rounded-xl flex-1 border border-slate-800">
                <p className="text-xs text-slate-400 mb-1 font-medium flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> <span>Cartões</span>
                </p>
                <p className="text-xl font-bold text-amber-500">
                  R${' '}
                  {(Number(despesasCartoes) || 0).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm items-end">
                <span className="text-slate-400 font-medium">Total Consolidado</span>
                <span className="font-bold text-white text-lg">
                  R${' '}
                  {(Number(totalConsolidado) || 0).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="h-3 flex rounded-full overflow-hidden bg-slate-800">
                <div style={{ width: `${percGerais}%` }} className="bg-red-500 transition-all" />
                <div style={{ width: `${percCartoes}%` }} className="bg-amber-500 transition-all" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161925] border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-white font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" /> <span>Despesas por Cartão</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col min-h-[200px] gap-4">
            {!(cards || []).length ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Nenhum cartão</p>
                  <p className="text-xs text-slate-500">Adicione um cartão para ver as despesas.</p>
                </div>
                <Button
                  asChild
                  variant="link"
                  className="text-[#0f766e] hover:text-[#0f766e]/80 h-auto p-0"
                >
                  <Link to="/cards">Cadastrar cartão</Link>
                </Button>
              </div>
            ) : (
              (cards || []).map((c) => {
                const used = currentMonthTx
                  .filter((t) => t.type === 'expense' && t.origin === c.name)
                  .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
                const limitNum = Number(c.limit) || 1
                return (
                  <div key={c.id} className="space-y-2">
                    <div className="flex justify-between text-sm items-end">
                      <span className="text-slate-300 font-medium uppercase">{c.name}</span>
                      <span className="text-white font-bold tracking-tight">
                        R$ {(Number(used) || 0).toLocaleString('pt-BR')}
                        <span className="text-xs font-normal text-slate-500 ml-1">
                          / R$ {(Number(c.limit) || 0).toLocaleString('pt-BR')}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${Math.min((used / limitNum) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#161925] border-slate-800 shadow-sm mt-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base text-white font-semibold">Transações do Mês</CardTitle>
          {currentMonthTx.length > 0 && (
            <Link
              to="/transactions"
              className="text-sm font-medium text-emerald-500 hover:text-emerald-400"
            >
              Ver todas
            </Link>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentMonthTx.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Sem transações no mês</p>
                  <p className="text-xs text-slate-500">Registre suas receitas e despesas.</p>
                </div>
                <Button
                  asChild
                  variant="link"
                  className="text-[#0f766e] hover:text-[#0f766e]/80 h-auto p-0"
                >
                  <Link to="/transactions">Nova transação</Link>
                </Button>
              </div>
            ) : (
              currentMonthTx.slice(0, 5).map((t) => {
                const dateObj = new Date(t.date)
                const safeDateStr = isNaN(dateObj.getTime()) ? '-' : format(dateObj, 'dd/MM/yyyy')
                return (
                  <div
                    key={t.id}
                    className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">{t.description}</p>
                      <p className="text-xs text-slate-500">
                        {safeDateStr} • {t.origin}
                      </p>
                    </div>
                    <div
                      className={`font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-300'}`}
                    >
                      <span>{t.type === 'income' ? '+ ' : '- '}</span>
                      <span>
                        R${' '}
                        {(Number(t.amount) || 0).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

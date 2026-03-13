import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Wallet, TrendingUp, TrendingDown, PiggyBank, CreditCard } from 'lucide-react'
import { useFinance } from '@/stores/FinanceContext'
import { format } from 'date-fns'

const InfoCard = ({
  title,
  amount,
  icon: Icon,
  colorClass,
  iconBg,
}: {
  title: string
  amount: number
  icon: any
  colorClass: string
  iconBg: string
}) => (
  <Card className="bg-[#161925] border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
    <CardContent className="p-6 flex justify-between items-start">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-white">
          R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
    </CardContent>
  </Card>
)

export default function Dashboard() {
  const { balance, transactions, cards, currentMonth } = useFinance()

  const currentMonthTx = transactions.filter((t) => {
    const d = new Date(t.date)
    return (
      d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()
    )
  })

  const receitas = currentMonthTx
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)
  const despesas = currentMonthTx
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)
  const economia = receitas - despesas

  const gerais = currentMonthTx
    .filter((t) => t.type === 'expense' && !cards.some((c) => c.name === t.origin))
    .reduce((acc, t) => acc + t.amount, 0)
  const despesasCartoes = currentMonthTx
    .filter((t) => t.type === 'expense' && cards.some((c) => c.name === t.origin))
    .reduce((acc, t) => acc + t.amount, 0)

  const totalConsolidado = gerais + despesasCartoes
  const percGerais = totalConsolidado ? (gerais / totalConsolidado) * 100 : 0
  const percCartoes = totalConsolidado ? (despesasCartoes / totalConsolidado) * 100 : 0

  const cardChartData = cards.map((c) => {
    const used = currentMonthTx
      .filter((t) => t.type === 'expense' && t.origin === c.name)
      .reduce((acc, t) => acc + t.amount, 0)
    return { name: c.name, limit: c.limit, used }
  })

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm">Visão geral das suas finanças</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <InfoCard
          title="Saldo Atual"
          amount={balance}
          icon={Wallet}
          colorClass="text-emerald-500"
          iconBg="bg-emerald-500/10"
        />
        <InfoCard
          title="Receitas"
          amount={receitas}
          icon={TrendingUp}
          colorClass="text-emerald-500"
          iconBg="bg-emerald-500/10"
        />
        <InfoCard
          title="Despesas"
          amount={despesas}
          icon={TrendingDown}
          colorClass="text-red-500"
          iconBg="bg-red-500/10"
        />
        <InfoCard
          title="Economia"
          amount={economia >= 0 ? economia : 0}
          icon={PiggyBank}
          colorClass="text-emerald-500"
          iconBg="bg-emerald-500/10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-[#161925] border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-white font-semibold">Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
            Sem dados ainda.
          </CardContent>
        </Card>
        <Card className="bg-[#161925] border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-white font-semibold">
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
            Sem dados ainda.
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
                  R$ {gerais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-[#0b0e14] p-4 rounded-xl flex-1 border border-slate-800">
                <p className="text-xs text-slate-400 mb-1 font-medium flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Cartões
                </p>
                <p className="text-xl font-bold text-amber-500">
                  R$ {despesasCartoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm items-end">
                <span className="text-slate-400 font-medium">Total Consolidado</span>
                <span className="font-bold text-white text-lg">
                  R$ {totalConsolidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-3 flex rounded-full overflow-hidden bg-slate-800">
                <div style={{ width: `${percGerais}%` }} className="bg-red-500 transition-all" />
                <div style={{ width: `${percCartoes}%` }} className="bg-amber-500 transition-all" />
              </div>
              <div className="flex justify-between text-xs text-slate-500 uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Gerais
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Cartões
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161925] border-slate-800 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-base text-white font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" /> Despesas por Cartão
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-[250px]">
            {cardChartData.length > 0 ? (
              <ChartContainer
                config={{
                  used: { label: 'Usado', color: 'hsl(var(--destructive))' },
                  limit: { label: 'Limite', color: '#1e293b' },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cardChartData}
                    layout="vertical"
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="limit" stackId="a" fill="#1e293b" radius={[4, 4, 4, 4]} />
                    <Bar
                      dataKey="used"
                      stackId="b"
                      fill="#ef4444"
                      radius={[4, 4, 4, 4]}
                      style={{ transform: 'translateY(-100%)' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                Nenhum cartão cadastrado.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#161925] border-slate-800 shadow-sm mt-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base text-white font-semibold">Transações Recentes</CardTitle>
          <Link
            to="/transactions"
            className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            Ver todas
          </Link>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-8">
              Nenhuma transação registrada ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">{t.description}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(t.date), 'dd/MM/yyyy')} • {t.origin}
                    </p>
                  </div>
                  <div
                    className={`font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-300'}`}
                  >
                    {t.type === 'income' ? '+' : '-'} R${' '}
                    {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

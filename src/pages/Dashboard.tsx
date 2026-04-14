import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Building2,
  Receipt,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFinance, Transaction } from '@/stores/FinanceContext'
import { MonthSelector } from '@/components/MonthSelector'
import { DashboardSkeleton, ErrorState } from '@/components/StateFeedback'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { getBanks, Bank } from '@/services/bank-service'

export default function Dashboard() {
  const {
    balance,
    transactions,
    currentMonth,
    isLoading: isContextLoading,
    error: contextError,
    retry: contextRetry,
    getTransactionsByUser,
    currentUser,
  } = useFinance()
  const { toast } = useToast()

  const [monthTransactions, setMonthTransactions] = useState<Transaction[]>([])
  const [isTxLoading, setIsTxLoading] = useState(true)
  const [txError, setTxError] = useState<string | null>(null)

  const [banks, setBanks] = useState<Bank[]>([])
  const [isBanksLoading, setIsBanksLoading] = useState(true)

  const fetchMonthTransactions = useCallback(async () => {
    if (!currentUser) return
    try {
      setTxError(null)
      const data = await getTransactionsByUser(
        currentUser.id,
        currentMonth.getMonth(),
        currentMonth.getFullYear(),
      )
      setMonthTransactions(data)
    } catch (err) {
      setTxError('Não foi possível carregar transações')
      throw err
    } finally {
      setIsTxLoading(false)
    }
  }, [currentUser, currentMonth, getTransactionsByUser])

  const fetchBanks = useCallback(async () => {
    if (!currentUser) return
    try {
      const data = await getBanks(currentUser.id)
      setBanks(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsBanksLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    setIsTxLoading(true)
    fetchMonthTransactions().catch(() => {})
  }, [fetchMonthTransactions])

  useEffect(() => {
    setIsBanksLoading(true)
    fetchBanks().catch(() => {})
  }, [fetchBanks])

  useRealtime('transactions', (e) => {
    if (e.record.user_id === currentUser?.id) {
      fetchMonthTransactions().catch(() => {
        toast({
          title: 'Erro ao sincronizar transações',
          variant: 'destructive',
        })
      })
    }
  })

  useRealtime('banks', (e) => {
    if (e.record.user_id === currentUser?.id) {
      fetchBanks().catch(() => {})
    }
  })

  if (isContextLoading && !transactions?.length) return <DashboardSkeleton />
  if (contextError) return <ErrorState message={contextError} onRetry={contextRetry} />

  const receitas = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
  const despesas = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)

  return (
    <main className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Início</h1>
          <p className="text-slate-400 text-sm">Visão geral das suas finanças</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <MonthSelector />
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#161925] border-slate-800 shadow-sm">
          <CardContent className="p-6 flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-400">Saldo Total</h2>
              <p
                className="text-3xl font-bold text-white truncate max-w-[200px]"
                title={`R$ ${(Number(balance) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              >
                R$ {(Number(balance) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 flex-shrink-0">
              <Wallet className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161925] border-slate-800 shadow-sm">
          <CardContent className="p-6 flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-400">Receitas do Mês</h2>
              <p
                className="text-2xl font-bold text-emerald-500 truncate max-w-[180px]"
                title={`R$ ${(Number(receitas) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              >
                R$ {(Number(receitas) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161925] border-slate-800 shadow-sm">
          <CardContent className="p-6 flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-400">Despesas do Mês</h2>
              <p
                className="text-2xl font-bold text-red-500 truncate max-w-[180px]"
                title={`R$ ${(Number(despesas) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              >
                R$ {(Number(despesas) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-red-500/10 flex-shrink-0">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Banks Section */}
        <section className="flex flex-col gap-4">
          <Card className="bg-[#161925] border-slate-800 shadow-sm flex flex-col h-full min-h-[350px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg text-white font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" /> Contas Bancárias
                </CardTitle>
                <CardDescription className="text-slate-400">Suas contas vinculadas</CardDescription>
              </div>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
              >
                <Link to="/bancos">
                  <Plus className="w-5 h-5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {isBanksLoading ? (
                <div className="space-y-3 mt-2">
                  <Skeleton className="h-16 w-full bg-slate-800 rounded-xl" />
                  <Skeleton className="h-16 w-full bg-slate-800 rounded-xl" />
                </div>
              ) : banks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 flex-1 border border-dashed border-slate-800 rounded-xl bg-slate-900/50 mt-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">Nenhum banco cadastrado</p>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-2 bg-transparent border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                  >
                    <Link to="/bancos">Adicionar Banco</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 mt-2">
                  {banks.map((bank) => (
                    <div
                      key={bank.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#0b0e14] border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{bank.bank_name}</p>
                          <p className="text-xs text-slate-500 font-mono">
                            Ag: {bank.agency} • CC: {bank.account_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Transactions Section */}
        <section className="flex flex-col gap-4">
          <Card className="bg-[#161925] border-slate-800 shadow-sm flex flex-col h-full min-h-[350px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg text-white font-semibold flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-500" /> Transações Recentes
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Últimas 5 movimentações do mês
                </CardDescription>
              </div>
              {monthTransactions.length > 0 && (
                <Link
                  to="/transactions"
                  className="text-sm font-medium text-emerald-500 hover:text-emerald-400 px-2"
                >
                  Ver todas
                </Link>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {isTxLoading ? (
                <div className="space-y-4 mt-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px] bg-slate-800" />
                        <Skeleton className="h-3 w-[150px] bg-slate-800/50" />
                      </div>
                      <Skeleton className="h-5 w-[80px] bg-slate-800" />
                    </div>
                  ))}
                </div>
              ) : txError ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 flex-1 border border-dashed border-red-500/20 rounded-xl bg-red-500/5 mt-2">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <p className="text-sm font-medium text-slate-300">{txError}</p>
                  <Button
                    onClick={() => {
                      setIsTxLoading(true)
                      fetchMonthTransactions()
                    }}
                    variant="outline"
                    className="bg-transparent border-slate-700 hover:bg-slate-800 mt-2"
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : monthTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 flex-1 border border-dashed border-slate-800 rounded-xl bg-slate-900/50 mt-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">Nenhuma transação no mês</p>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-2 bg-transparent border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Link to="/transactions">Adicionar Transação</Link>
                  </Button>
                </div>
              ) : (
                <div className="animate-fade-in space-y-1 mt-2">
                  {monthTransactions.slice(0, 5).map((t) => {
                    const dateObj = new Date(t.date)
                    const safeDateStr = isNaN(dateObj.getTime())
                      ? '-'
                      : format(
                          new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000),
                          'dd/MM/yyyy',
                        )

                    return (
                      <div
                        key={t.id}
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-[#0b0e14] transition-colors border border-transparent hover:border-slate-800"
                      >
                        <div className="flex flex-col gap-1 overflow-hidden pr-4">
                          <p className="text-sm font-medium text-slate-200 truncate">
                            {t.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{safeDateStr}</span>
                            {t.category && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[100px]">{t.category}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-1 font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-300'}`}
                        >
                          {t.type === 'income' ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          )}
                          <span>
                            R${' '}
                            {(Number(t.amount) || 0).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}

import React, { createContext, useContext, useState, useMemo } from 'react'

export type Transaction = {
  id: string
  amount: number
  description: string
  type: 'income' | 'expense'
  date: string
  origin: string
  category: string
  isPending?: boolean
}

export type Card = {
  id: string
  name: string
  color: string
  limit: number
  used: number
  dueDate: string
  status: 'Aberta' | 'Fechada' | 'Atrasada'
}

type FinanceContextType = {
  isLoggedIn: boolean
  subscriptionStatus: 'active' | 'pending'
  balance: number
  transactions: Transaction[]
  cards: Card[]
  isMagicDrawerOpen: boolean
  login: () => void
  renewSubscription: () => void
  setMagicDrawerOpen: (open: boolean) => void
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void
  resolvePending: (id: string, newCategory?: string) => void
}

const FinanceContext = createContext<FinanceContextType | null>(null)

export const FinanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'pending'>('pending')
  const [isMagicDrawerOpen, setMagicDrawerOpen] = useState(false)
  const [balance, setBalance] = useState(12450.5)

  const [cards] = useState<Card[]>([
    {
      id: '1',
      name: 'Nubank',
      color: '#8a05be',
      limit: 5000,
      used: 4200,
      dueDate: '2023-11-10',
      status: 'Aberta',
    },
    {
      id: '2',
      name: 'Itaú',
      color: '#ff7800',
      limit: 10000,
      used: 1500,
      dueDate: '2023-11-15',
      status: 'Fechada',
    },
  ])

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 't1',
      amount: 45.0,
      description: 'Almoço - Restaurante',
      type: 'expense',
      date: new Date().toISOString(),
      origin: 'PIX',
      category: 'Alimentação',
    },
    {
      id: 't2',
      amount: 5000.0,
      description: 'Salário',
      type: 'income',
      date: new Date(Date.now() - 86400000).toISOString(),
      origin: 'Conta Corrente',
      category: 'Renda',
    },
    {
      id: 't3',
      amount: 1500.0,
      description: 'Fatura Cartão Nubank',
      type: 'expense',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      origin: 'Conta Corrente',
      category: 'Cartão',
    },
    {
      id: 'p1',
      amount: 39.9,
      description: 'PAG*MERCADOLIVRE',
      type: 'expense',
      date: new Date().toISOString(),
      origin: 'Cartão Roxinho',
      category: 'Compras',
      isPending: true,
    },
    {
      id: 'p2',
      amount: 15.0,
      description: 'UBER*TRIP',
      type: 'expense',
      date: new Date().toISOString(),
      origin: 'Cartão Roxinho',
      category: 'Transporte',
      isPending: true,
    },
  ])

  const login = () => setIsLoggedIn(true)
  const renewSubscription = () => setSubscriptionStatus('active')

  const addTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(),
      date: new Date().toISOString(),
    }
    setTransactions((prev) => [newTx, ...prev])
    if (tx.origin !== 'Cartão Roxinho' && tx.origin !== 'Cartão Black') {
      setBalance((prev) => (tx.type === 'income' ? prev + tx.amount : prev - tx.amount))
    }
  }

  const resolvePending = (id: string, newCategory?: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isPending: false, category: newCategory || t.category } : t,
      ),
    )
  }

  const value = useMemo(
    () => ({
      isLoggedIn,
      subscriptionStatus,
      balance,
      transactions,
      cards,
      isMagicDrawerOpen,
      login,
      renewSubscription,
      setMagicDrawerOpen,
      addTransaction,
      resolvePending,
    }),
    [isLoggedIn, subscriptionStatus, balance, transactions, cards, isMagicDrawerOpen],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}

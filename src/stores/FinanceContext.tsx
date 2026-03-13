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
  type: string
  color: string
  limit: number
  used: number
  dueDate: string
  status: 'Aberta' | 'Fechada' | 'Atrasada'
}

type FinanceContextType = {
  isLoggedIn: boolean
  balance: number
  transactions: Transaction[]
  cards: Card[]
  isMagicDrawerOpen: boolean
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  login: () => void
  setMagicDrawerOpen: (open: boolean) => void
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  addCard: (card: Omit<Card, 'id'>) => void
}

const FinanceContext = createContext<FinanceContextType | null>(null)

export const FinanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMagicDrawerOpen, setMagicDrawerOpen] = useState(false)
  const [balance, setBalance] = useState(12450.5)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [cards, setCards] = useState<Card[]>([
    {
      id: '1',
      name: 'Nubank',
      type: 'Mastercard',
      color: '#8a05be',
      limit: 5000,
      used: 4200,
      dueDate: '2023-11-10',
      status: 'Aberta',
    },
    {
      id: '2',
      name: 'Itaú',
      type: 'Visa',
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
      date: new Date().toISOString(),
      origin: 'Dinheiro',
      category: 'Renda',
    },
    {
      id: 't3',
      amount: 150.0,
      description: 'Supermercado',
      type: 'expense',
      date: new Date().toISOString(),
      origin: 'Nubank',
      category: 'Alimentação',
    },
  ])

  const login = () => setIsLoggedIn(true)

  const addCard = (card: Omit<Card, 'id'>) => {
    setCards((prev) => [...prev, { ...card, id: Math.random().toString() }])
  }

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...tx, id: Math.random().toString() }
    setTransactions((prev) => [newTx, ...prev])

    const isCard = cards.some((c) => c.name === tx.origin)
    if (isCard) {
      if (tx.type === 'expense') {
        setCards((prev) =>
          prev.map((c) => (c.name === tx.origin ? { ...c, used: c.used + tx.amount } : c)),
        )
      } else {
        setCards((prev) =>
          prev.map((c) =>
            c.name === tx.origin ? { ...c, used: Math.max(0, c.used - tx.amount) } : c,
          ),
        )
      }
    } else {
      setBalance((prev) => (tx.type === 'income' ? prev + tx.amount : prev - tx.amount))
    }
  }

  const value = useMemo(
    () => ({
      isLoggedIn,
      balance,
      transactions,
      cards,
      isMagicDrawerOpen,
      currentMonth,
      setCurrentMonth,
      login,
      setMagicDrawerOpen,
      addTransaction,
      addCard,
    }),
    [isLoggedIn, balance, transactions, cards, isMagicDrawerOpen, currentMonth],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}

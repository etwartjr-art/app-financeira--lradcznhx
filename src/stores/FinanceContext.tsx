import React, { createContext, useContext, useState, useMemo } from 'react'

export type Transaction = {
  id: string
  amount: number
  description: string
  type: 'income' | 'expense'
  date: string
  origin: string
  category: string
  tags?: string
  isPending?: boolean
}

export type Card = {
  id: string
  name: string
  type: string
  last4: string
  color: string
  limit: number
  used: number
  closingDate: string
  dueDate: string
  status: 'Aberta' | 'Fechada' | 'Atrasada'
}

export type Category = {
  id: string
  name: string
  color: string
}

export type User = {
  id: string
  name: string
  email: string
  password?: string
  role: 'Admin' | 'User'
  situation: 'Ativo' | 'Devedor'
  createdAt: string
}

type FinanceContextType = {
  isLoggedIn: boolean
  balance: number
  transactions: Transaction[]
  cards: Card[]
  categories: Category[]
  users: User[]
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  login: () => void
  logout: () => void
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, txData: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addCard: (card: Omit<Card, 'id'>) => void
  updateCard: (id: string, cardData: Partial<Card>) => void
  deleteCard: (id: string) => void
  addCategory: (cat: Omit<Category, 'id'>) => void
  updateCategory: (id: string, catData: Partial<Category>) => void
  deleteCategory: (id: string) => void
  addUser: (user: Omit<User, 'id'>) => void
  updateUser: (id: string, userData: Partial<User>) => void
  deleteUser: (id: string) => void
}

const FinanceContext = createContext<FinanceContextType | null>(null)

const dStr = (daysBack: number) => new Date(Date.now() - daysBack * 86400000).toISOString()

export const FinanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('@finance-app:isLoggedIn') === 'true'
  })

  const [balance, setBalance] = useState(12450.5)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Etwart Jr',
      email: 'Etwartjr@gmail.com',
      password: 'Samuel@1234@',
      role: 'Admin',
      situation: 'Ativo',
      createdAt: '2023-01-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'Maria Souza',
      email: 'maria@financasetw.com.br',
      password: 'password123',
      role: 'User',
      situation: 'Devedor',
      createdAt: '2023-11-20T10:00:00Z',
    },
    {
      id: '3',
      name: 'Carlos Santos',
      email: 'carlos@financasetw.com.br',
      password: 'password123',
      role: 'User',
      situation: 'Ativo',
      createdAt: '2024-01-05T10:00:00Z',
    },
  ])

  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Alimentação', color: '#ef4444' },
    { id: '2', name: 'Transporte', color: '#3b82f6' },
    { id: '3', name: 'Moradia', color: '#10b981' },
    { id: '4', name: 'Lazer', color: '#f59e0b' },
    { id: '5', name: 'Saúde', color: '#ec4899' },
    { id: '6', name: 'Salário', color: '#22c55e' },
    { id: '7', name: 'Outros', color: '#64748b' },
  ])

  const [cards, setCards] = useState<Card[]>([
    {
      id: '1',
      name: 'itau',
      type: 'Mastercard',
      last4: '5119',
      color: '#ff7800',
      limit: 5000,
      used: 0,
      closingDate: '2026-03-20',
      dueDate: '2026-03-27',
      status: 'Aberta',
    },
  ])

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 't1',
      amount: 5000,
      description: 'Salário',
      type: 'income',
      date: dStr(5),
      origin: 'Conta Principal',
      category: 'Salário',
    },
    {
      id: 't2',
      amount: 250.5,
      description: 'Supermercado',
      type: 'expense',
      date: dStr(2),
      origin: 'itau',
      category: 'Alimentação',
    },
    {
      id: 't3',
      amount: 80,
      description: 'Combustível',
      type: 'expense',
      date: dStr(1),
      origin: 'itau',
      category: 'Transporte',
    },
  ])

  const login = () => {
    localStorage.setItem('@finance-app:isLoggedIn', 'true')
    setIsLoggedIn(true)
  }
  const logout = () => {
    localStorage.removeItem('@finance-app:isLoggedIn')
    setIsLoggedIn(false)
  }

  const addUser = (user: Omit<User, 'id'>) =>
    setUsers((p) => [...p, { ...user, id: Math.random().toString() }])
  const updateUser = (id: string, data: Partial<User>) =>
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, ...data } : u)))
  const deleteUser = (id: string) => setUsers((p) => p.filter((u) => u.id !== id))

  const addCategory = (cat: Omit<Category, 'id'>) =>
    setCategories((p) => [...p, { ...cat, id: Math.random().toString() }])
  const updateCategory = (id: string, data: Partial<Category>) =>
    setCategories((p) => p.map((c) => (c.id === id ? { ...c, ...data } : c)))
  const deleteCategory = (id: string) => setCategories((p) => p.filter((c) => c.id !== id))

  const addCard = (card: Omit<Card, 'id'>) =>
    setCards((p) => [...p, { ...card, id: Math.random().toString() }])
  const updateCard = (id: string, data: Partial<Card>) =>
    setCards((p) => p.map((c) => (c.id === id ? { ...c, ...data } : c)))
  const deleteCard = (id: string) => setCards((p) => p.filter((c) => c.id !== id))

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    setTransactions((p) => [{ ...tx, id: Math.random().toString() }, ...p])
    if (!cards.some((c) => c.name === tx.origin))
      setBalance((p) => (tx.type === 'income' ? p + tx.amount : p - tx.amount))
  }
  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    setTransactions((p) => p.map((t) => (t.id === id ? ({ ...t, ...data } as Transaction) : t)))
  }
  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id)
    if (!tx) return
    setTransactions((p) => p.filter((t) => t.id !== id))
    if (!cards.some((c) => c.name === tx.origin))
      setBalance((p) => (tx.type === 'income' ? p - tx.amount : p + tx.amount))
  }

  const value = useMemo(
    () => ({
      isLoggedIn,
      balance,
      transactions,
      cards,
      categories,
      users,
      currentMonth,
      setCurrentMonth,
      login,
      logout,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCard,
      updateCard,
      deleteCard,
      addCategory,
      updateCategory,
      deleteCategory,
      addUser,
      updateUser,
      deleteUser,
    }),
    [isLoggedIn, balance, transactions, cards, categories, users, currentMonth],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}

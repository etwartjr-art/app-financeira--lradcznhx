import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react'

export type Transaction = {
  id: string
  userId: string
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
  userId: string
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
  userId: string
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
  currentUser: User | null
  isLoggedIn: boolean
  balance: number
  transactions: Transaction[]
  cards: Card[]
  categories: Category[]
  users: User[]
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  login: (user: User) => void
  logout: () => void
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId'>) => void
  updateTransaction: (id: string, txData: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addCard: (card: Omit<Card, 'id' | 'userId'>) => void
  updateCard: (id: string, cardData: Partial<Card>) => void
  deleteCard: (id: string) => void
  addCategory: (cat: Omit<Category, 'id' | 'userId'>) => void
  updateCategory: (id: string, catData: Partial<Category>) => void
  deleteCategory: (id: string) => void
  addUser: (user: Omit<User, 'id'>) => User
  updateUser: (id: string, userData: Partial<User>) => void
  deleteUser: (id: string) => void
}

const FinanceContext = createContext<FinanceContextType | null>(null)

function loadState<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return fallback
    const parsed = JSON.parse(saved)
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback
    return parsed !== null ? parsed : fallback
  } catch (err) {
    console.error(`Failed to load ${key}:`, err)
    return fallback
  }
}

function saveState(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to save ${key}:`, error)
  }
}

const defaultUsers: User[] = [
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
]

const defaultCatsFor = (userId: string) => [
  { id: Math.random().toString(), userId, name: 'Alimentação', color: '#ef4444' },
  { id: Math.random().toString(), userId, name: 'Transporte', color: '#3b82f6' },
  { id: Math.random().toString(), userId, name: 'Moradia', color: '#10b981' },
  { id: Math.random().toString(), userId, name: 'Lazer', color: '#f59e0b' },
  { id: Math.random().toString(), userId, name: 'Saúde', color: '#ec4899' },
  { id: Math.random().toString(), userId, name: 'Salário', color: '#22c55e' },
  { id: Math.random().toString(), userId, name: 'Outros', color: '#64748b' },
]

const initialCategories: Category[] = [
  ...defaultCatsFor('1'),
  ...defaultCatsFor('2'),
  ...defaultCatsFor('3'),
]

export const FinanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadState('@finance-app:user', null),
  )
  const isLoggedIn = !!currentUser
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [users, setUsers] = useState<User[]>(() => loadState('@finance-app:users', defaultUsers))
  const [categories, setCategories] = useState<Category[]>(() =>
    loadState('@finance-app:categories', initialCategories),
  )
  const [cards, setCards] = useState<Card[]>(() => loadState('@finance-app:cards', []))
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadState('@finance-app:transactions', []),
  )

  useEffect(() => saveState('@finance-app:users', users), [users])
  useEffect(() => saveState('@finance-app:categories', categories), [categories])
  useEffect(() => saveState('@finance-app:cards', cards), [cards])
  useEffect(() => saveState('@finance-app:transactions', transactions), [transactions])

  const userTransactions = useMemo(
    () => (transactions || []).filter((t) => t.userId === currentUser?.id),
    [transactions, currentUser],
  )
  const userCards = useMemo(
    () => (cards || []).filter((c) => c.userId === currentUser?.id),
    [cards, currentUser],
  )
  const userCategories = useMemo(
    () => (categories || []).filter((c) => c.userId === currentUser?.id),
    [categories, currentUser],
  )

  const balance = useMemo(() => {
    return userTransactions.reduce((acc, tx) => {
      if (!userCards.some((c) => c.name === tx.origin)) {
        return tx.type === 'income'
          ? acc + (Number(tx.amount) || 0)
          : acc - (Number(tx.amount) || 0)
      }
      return acc
    }, 0)
  }, [userTransactions, userCards])

  const login = useCallback((user: User) => {
    try {
      localStorage.setItem('@finance-app:isLoggedIn', 'true')
      localStorage.setItem('@finance-app:user', JSON.stringify(user))
    } catch (err) {
      console.error(err)
    }
    setCurrentUser(user)
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('@finance-app:isLoggedIn')
      localStorage.removeItem('@finance-app:user')
    } catch (err) {
      console.error(err)
    }
    setCurrentUser(null)
  }, [])

  const addUser = useCallback((user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: Math.random().toString() }
    setUsers((p) => [...(p || []), newUser])
    setCategories((p) => [...(p || []), ...defaultCatsFor(newUser.id)])
    return newUser
  }, [])

  const updateUser = useCallback((id: string, data: Partial<User>) => {
    setUsers((p) => (p || []).map((u) => (u.id === id ? { ...u, ...data } : u)))
  }, [])

  const deleteUser = useCallback(
    (id: string) => {
      setUsers((p) => {
        const arr = p || []
        const userToDelete = arr.find((u) => u.id === id)
        if (userToDelete?.role === 'Admin') return arr
        return arr.filter((u) => u.id !== id)
      })
      setTransactions((p) => (p || []).filter((t) => t.userId !== id))
      setCards((p) => (p || []).filter((c) => c.userId !== id))
      setCategories((p) => (p || []).filter((c) => c.userId !== id))
      if (currentUser?.id === id) logout()
    },
    [currentUser, logout],
  )

  const addCategory = useCallback(
    (cat: Omit<Category, 'id' | 'userId'>) => {
      if (currentUser)
        setCategories((p) => [
          ...(p || []),
          { ...cat, id: Math.random().toString(), userId: currentUser.id },
        ])
    },
    [currentUser],
  )

  const updateCategory = useCallback((id: string, data: Partial<Category>) => {
    setCategories((p) => (p || []).map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setCategories((p) => (p || []).filter((c) => c.id !== id))
  }, [])

  const addCard = useCallback(
    (card: Omit<Card, 'id' | 'userId'>) => {
      if (currentUser)
        setCards((p) => [
          ...(p || []),
          { ...card, id: Math.random().toString(), userId: currentUser.id },
        ])
    },
    [currentUser],
  )

  const updateCard = useCallback((id: string, data: Partial<Card>) => {
    setCards((p) => (p || []).map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [])

  const deleteCard = useCallback((id: string) => {
    setCards((p) => (p || []).filter((c) => c.id !== id))
  }, [])

  const addTransaction = useCallback(
    (tx: Omit<Transaction, 'id' | 'userId'>) => {
      if (currentUser)
        setTransactions((p) => [
          { ...tx, id: Math.random().toString(), userId: currentUser.id },
          ...(p || []),
        ])
    },
    [currentUser],
  )

  const updateTransaction = useCallback((id: string, data: Partial<Transaction>) => {
    setTransactions((p) =>
      (p || []).map((t) => (t.id === id ? ({ ...t, ...data } as Transaction) : t)),
    )
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((p) => (p || []).filter((t) => t.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      isLoggedIn,
      balance,
      transactions: userTransactions,
      cards: userCards,
      categories: userCategories,
      users: users || [],
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
    [
      currentUser,
      isLoggedIn,
      balance,
      userTransactions,
      userCards,
      userCategories,
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
    ],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'

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
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
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

  useEffect(() => {
    localStorage.setItem('@finance-app:users', JSON.stringify(users))
  }, [users])
  useEffect(() => {
    localStorage.setItem('@finance-app:categories', JSON.stringify(categories))
  }, [categories])
  useEffect(() => {
    localStorage.setItem('@finance-app:cards', JSON.stringify(cards))
  }, [cards])
  useEffect(() => {
    localStorage.setItem('@finance-app:transactions', JSON.stringify(transactions))
  }, [transactions])

  const userTransactions = useMemo(
    () => transactions.filter((t) => t.userId === currentUser?.id),
    [transactions, currentUser],
  )
  const userCards = useMemo(
    () => cards.filter((c) => c.userId === currentUser?.id),
    [cards, currentUser],
  )
  const userCategories = useMemo(
    () => categories.filter((c) => c.userId === currentUser?.id),
    [categories, currentUser],
  )

  const balance = useMemo(() => {
    return userTransactions.reduce((acc, tx) => {
      if (!userCards.some((c) => c.name === tx.origin)) {
        return tx.type === 'income' ? acc + tx.amount : acc - tx.amount
      }
      return acc
    }, 0)
  }, [userTransactions, userCards])

  const login = (user: User) => {
    localStorage.setItem('@finance-app:isLoggedIn', 'true')
    localStorage.setItem('@finance-app:user', JSON.stringify(user))
    setCurrentUser(user)
  }

  const logout = () => {
    localStorage.removeItem('@finance-app:isLoggedIn')
    localStorage.removeItem('@finance-app:user')
    setCurrentUser(null)
  }

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: Math.random().toString() }
    setUsers((p) => [...p, newUser])
    setCategories((p) => [...p, ...defaultCatsFor(newUser.id)])
    return newUser
  }

  const updateUser = (id: string, data: Partial<User>) =>
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, ...data } : u)))

  const deleteUser = (id: string) => {
    setUsers((p) => p.filter((u) => u.id !== id))
    setTransactions((p) => p.filter((t) => t.userId !== id))
    setCards((p) => p.filter((c) => c.userId !== id))
    setCategories((p) => p.filter((c) => c.userId !== id))
    if (currentUser?.id === id) logout()
  }

  const addCategory = (cat: Omit<Category, 'id' | 'userId'>) => {
    if (currentUser)
      setCategories((p) => [...p, { ...cat, id: Math.random().toString(), userId: currentUser.id }])
  }
  const updateCategory = (id: string, data: Partial<Category>) =>
    setCategories((p) => p.map((c) => (c.id === id ? { ...c, ...data } : c)))
  const deleteCategory = (id: string) => setCategories((p) => p.filter((c) => c.id !== id))

  const addCard = (card: Omit<Card, 'id' | 'userId'>) => {
    if (currentUser)
      setCards((p) => [...p, { ...card, id: Math.random().toString(), userId: currentUser.id }])
  }
  const updateCard = (id: string, data: Partial<Card>) =>
    setCards((p) => p.map((c) => (c.id === id ? { ...c, ...data } : c)))
  const deleteCard = (id: string) => setCards((p) => p.filter((c) => c.id !== id))

  const addTransaction = (tx: Omit<Transaction, 'id' | 'userId'>) => {
    if (currentUser)
      setTransactions((p) => [
        { ...tx, id: Math.random().toString(), userId: currentUser.id },
        ...p,
      ])
  }
  const updateTransaction = (id: string, data: Partial<Transaction>) =>
    setTransactions((p) => p.map((t) => (t.id === id ? ({ ...t, ...data } as Transaction) : t)))
  const deleteTransaction = (id: string) => setTransactions((p) => p.filter((t) => t.id !== id))

  const value = useMemo(
    () => ({
      currentUser,
      isLoggedIn,
      balance,
      transactions: userTransactions,
      cards: userCards,
      categories: userCategories,
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
    [
      currentUser,
      isLoggedIn,
      balance,
      userTransactions,
      userCards,
      userCategories,
      users,
      currentMonth,
    ],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}

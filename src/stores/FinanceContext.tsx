import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import * as txService from '@/services/transactions'
import * as cardService from '@/services/cards'
import * as catService from '@/services/categories'
import * as userService from '@/services/users'

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
  isLoading: boolean
  error: string | null
  retry: () => void
  balance: number
  transactions: Transaction[]
  cards: Card[]
  categories: Category[]
  users: User[]
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  login: (email: string, pass: string) => Promise<{ error: any }>
  logout: () => void
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId'>) => Promise<void>
  updateTransaction: (id: string, txData: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  addCard: (card: Omit<Card, 'id' | 'userId' | 'used'>) => Promise<void>
  updateCard: (id: string, cardData: Partial<Card>) => Promise<void>
  deleteCard: (id: string) => Promise<void>
  addCategory: (cat: Omit<Category, 'id' | 'userId'>) => Promise<void>
  updateCategory: (id: string, catData: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>
  updateUser: (id: string, userData: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

const FinanceContext = createContext<FinanceContextType | null>(null)

export const FinanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(
    (pb.authStore.record as unknown as User) || null,
  )
  const isLoggedIn = pb.authStore.isValid

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    return pb.authStore.onChange((token, model) => {
      setCurrentUser((model as unknown as User) || null)
    })
  }, [])

  const loadData = useCallback(async () => {
    if (!isLoggedIn) return
    setIsLoading(true)
    setError(null)
    try {
      const [txs, cds, cats, usrs] = await Promise.all([
        txService.getAll(),
        cardService.getAll(),
        catService.getAll(),
        currentUser?.role === 'Admin' ? userService.getAll() : Promise.resolve([]),
      ])
      setTransactions(txs)
      setCards(cds)
      setCategories(cats)
      setUsers(usrs)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dados. Verifique sua conexão e tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, currentUser?.role])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('transactions', () => {
    if (isLoggedIn) txService.getAll().then(setTransactions)
  })
  useRealtime('cards', () => {
    if (isLoggedIn) cardService.getAll().then(setCards)
  })
  useRealtime('categories', () => {
    if (isLoggedIn) catService.getAll().then(setCategories)
  })
  useRealtime('users', () => {
    if (isLoggedIn && currentUser?.role === 'Admin') userService.getAll().then(setUsers)
  })

  const balance = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      if (!cards.some((c) => c.name === tx.origin)) {
        return tx.type === 'income'
          ? acc + (Number(tx.amount) || 0)
          : acc - (Number(tx.amount) || 0)
      }
      return acc
    }, 0)
  }, [transactions, cards])

  const login = useCallback(async (email: string, pass: string) => {
    try {
      await pb.collection('users').authWithPassword(email, pass)
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }, [])

  const logout = useCallback(() => {
    pb.authStore.clear()
  }, [])

  const addUser = async (user: Omit<User, 'id' | 'createdAt'>) => {
    await userService.create(user)
  }
  const updateUser = async (id: string, data: Partial<User>) => {
    await userService.update(id, data)
  }
  const deleteUser = async (id: string) => {
    await userService.remove(id)
  }

  const addCategory = async (cat: Omit<Category, 'id' | 'userId'>) => {
    await catService.create(cat)
  }
  const updateCategory = async (id: string, data: Partial<Category>) => {
    await catService.update(id, data)
  }
  const deleteCategory = async (id: string) => {
    await catService.remove(id)
  }

  const addCard = async (card: Omit<Card, 'id' | 'userId' | 'used'>) => {
    await cardService.create(card)
  }
  const updateCard = async (id: string, data: Partial<Card>) => {
    await cardService.update(id, data)
  }
  const deleteCard = async (id: string) => {
    await cardService.remove(id)
  }

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'userId'>) => {
    await txService.create(tx)
  }
  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    await txService.update(id, data)
  }
  const deleteTransaction = async (id: string) => {
    await txService.remove(id)
  }

  const value = useMemo(
    () => ({
      currentUser,
      isLoggedIn,
      isLoading,
      error,
      retry: loadData,
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
    [
      currentUser,
      isLoggedIn,
      isLoading,
      error,
      loadData,
      balance,
      transactions,
      cards,
      categories,
      users,
      currentMonth,
      setCurrentMonth,
      login,
      logout,
    ],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}

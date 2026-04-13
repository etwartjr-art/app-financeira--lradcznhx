import pb from '@/lib/pocketbase/client'
import type { Transaction } from '@/stores/FinanceContext'

export type TransactionExt = Transaction & {
  fitId?: string
  refNum?: string
  cardId?: string
}

const mapRecord = (r: any): TransactionExt => ({
  id: r.id,
  userId: r.user_id,
  description: r.description,
  amount: r.amount,
  type: r.type,
  category: r.category,
  origin: r.origin,
  date: r.date,
  tags: r.tags,
  fitId: r.fitId,
  refNum: r.refNum,
  cardId: r.cardId,
})

class RequestManager {
  private active = 0
  private queue: (() => void)[] = []

  constructor(private maxConcurrency: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrency) {
      await new Promise<void>((resolve) => this.queue.push(resolve))
    }
    this.active++
    try {
      return await this.withRetry(fn)
    } finally {
      this.active--
      if (this.queue.length > 0) {
        const next = this.queue.shift()
        next?.()
      }
    }
  }

  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await fn()
        // Adding a small delay after successful operations helps
        // preventing rate-limit triggering during intensive bulk actions.
        await new Promise((r) => setTimeout(r, 100))
        return result
      } catch (error: any) {
        if (error?.status === 429 && i < maxRetries - 1) {
          // Wait exponentially before retrying + jitter
          const jitter = Math.random() * 200
          await new Promise((r) => setTimeout(r, delay * Math.pow(2, i) + jitter))
          continue
        }
        throw error
      }
    }
    return fn()
  }
}

// Global request manager to throttle concurrent requests to PocketBase
const requestManager = new RequestManager(3)

export const getAll = async () => {
  return requestManager.run(async () => {
    const records = await pb.collection('transactions').getFullList({ sort: '-date' })
    return records.map(mapRecord)
  })
}

export const getById = async (id: string) => {
  return requestManager.run(async () => {
    const record = await pb.collection('transactions').getOne(id)
    return mapRecord(record)
  })
}

export const create = async (data: Omit<TransactionExt, 'id' | 'userId'>) => {
  return requestManager.run(async () => {
    const record = await pb.collection('transactions').create({
      ...data,
      user_id: pb.authStore.record?.id,
    })
    return mapRecord(record)
  })
}

export const update = async (id: string, data: Partial<Transaction>) => {
  return requestManager.run(async () => {
    const record = await pb.collection('transactions').update(id, data)
    return mapRecord(record)
  })
}

export const remove = async (id: string) => {
  return requestManager.run(async () => {
    await pb.collection('transactions').delete(id)
  })
}

export const clearAllTransactions = async () => {
  return requestManager.run(async () => {
    return pb.send('/backend/v1/transactions/clear', { method: 'DELETE' })
  })
}

export const getTransactionsByUser = async (userId: string, month: number, year: number) => {
  return requestManager.run(async () => {
    const monthStr = String(month + 1).padStart(2, '0')
    const lastDay = new Date(year, month + 1, 0).getDate()
    const startStr = `${year}-${monthStr}-01 00:00:00.000Z`
    const endStr = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')} 23:59:59.999Z`

    const records = await pb.collection('transactions').getFullList({
      filter: `user_id = "${userId}" && date >= "${startStr}" && date <= "${endStr}"`,
      sort: '-date',
    })
    return records.map(mapRecord)
  })
}

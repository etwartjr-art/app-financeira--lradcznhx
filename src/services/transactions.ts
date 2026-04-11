import pb from '@/lib/pocketbase/client'
import type { Transaction } from '@/stores/FinanceContext'

const mapRecord = (r: any): Transaction => ({
  id: r.id,
  userId: r.user_id,
  description: r.description,
  amount: r.amount,
  type: r.type,
  category: r.category,
  origin: r.origin,
  date: r.date,
  tags: r.tags,
})

export const getAll = async () => {
  const records = await pb.collection('transactions').getFullList({ sort: '-date' })
  return records.map(mapRecord)
}

export const getById = async (id: string) => {
  const record = await pb.collection('transactions').getOne(id)
  return mapRecord(record)
}

export const create = async (data: Omit<Transaction, 'id' | 'userId'>) => {
  const record = await pb.collection('transactions').create({
    ...data,
    user_id: pb.authStore.record?.id,
  })
  return mapRecord(record)
}

export const update = async (id: string, data: Partial<Transaction>) => {
  const record = await pb.collection('transactions').update(id, data)
  return mapRecord(record)
}

export const remove = async (id: string) => {
  await pb.collection('transactions').delete(id)
}

export const getTransactionsByUser = async (userId: string, month: number, year: number) => {
  const monthStr = String(month + 1).padStart(2, '0')
  const lastDay = new Date(year, month + 1, 0).getDate()
  const startStr = `${year}-${monthStr}-01 00:00:00.000Z`
  const endStr = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')} 23:59:59.999Z`

  const records = await pb.collection('transactions').getFullList({
    filter: `user_id = "${userId}" && date >= "${startStr}" && date <= "${endStr}"`,
    sort: '-date',
  })
  return records.map(mapRecord)
}

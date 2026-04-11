import pb from '@/lib/pocketbase/client'
import type { Card as BaseCard } from '@/stores/FinanceContext'

export type Card = BaseCard & {
  availableLimit?: number
  usedLimit?: number
  nextClosingDate?: string
  bankName?: string
  flag?: string
}

const mapRecord = (r: any): Card => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  type: r.type,
  last4: r.last4,
  color: r.color,
  limit: r.limit,
  used: 0,
  closingDate: r.closingDate,
  dueDate: r.dueDate,
  status: r.status,
  availableLimit: r.availableLimit,
  usedLimit: r.usedLimit,
  nextClosingDate: r.nextClosingDate,
  bankName: r.bankName,
  flag: r.flag,
})

export const getAll = async () => {
  const records = await pb.collection('cards').getFullList({ sort: '-created' })
  return records.map(mapRecord)
}

export const getById = async (id: string) => {
  const record = await pb.collection('cards').getOne(id)
  return mapRecord(record)
}

export const create = async (data: Omit<Card, 'id' | 'userId' | 'used'>) => {
  const record = await pb.collection('cards').create({
    ...data,
    user_id: pb.authStore.record?.id,
  })
  return mapRecord(record)
}

export const update = async (id: string, data: Partial<Card>) => {
  const record = await pb.collection('cards').update(id, data)
  return mapRecord(record)
}

export const remove = async (id: string) => {
  await pb.collection('cards').delete(id)
}

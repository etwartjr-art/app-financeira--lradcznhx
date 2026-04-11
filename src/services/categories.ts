import pb from '@/lib/pocketbase/client'
import type { Category } from '@/stores/FinanceContext'

const mapRecord = (r: any): Category => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  color: r.color,
})

export const getAll = async () => {
  const records = await pb.collection('categories').getFullList({ sort: '-created' })
  return records.map(mapRecord)
}

export const getById = async (id: string) => {
  const record = await pb.collection('categories').getOne(id)
  return mapRecord(record)
}

export const create = async (data: Omit<Category, 'id' | 'userId'>) => {
  const record = await pb.collection('categories').create({
    ...data,
    user_id: pb.authStore.record?.id,
  })
  return mapRecord(record)
}

export const update = async (id: string, data: Partial<Category>) => {
  const record = await pb.collection('categories').update(id, data)
  return mapRecord(record)
}

export const remove = async (id: string) => {
  await pb.collection('categories').delete(id)
}

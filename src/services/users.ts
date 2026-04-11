import pb from '@/lib/pocketbase/client'
import type { User } from '@/stores/FinanceContext'

const mapRecord = (r: any): User => ({
  id: r.id,
  name: r.name,
  email: r.email,
  role: r.role || 'User',
  situation: r.situation || 'Ativo',
  createdAt: r.created,
})

export const getAll = async () => {
  const records = await pb.collection('users').getFullList({ sort: '-created' })
  return records.map(mapRecord)
}

export const getById = async (id: string) => {
  const record = await pb.collection('users').getOne(id)
  return mapRecord(record)
}

export const create = async (data: Omit<User, 'id' | 'createdAt'>) => {
  const record = await pb.collection('users').create({
    ...data,
    passwordConfirm: data.password,
  })
  return mapRecord(record)
}

export const update = async (id: string, data: Partial<User>) => {
  const record = await pb.collection('users').update(id, data)
  return mapRecord(record)
}

export const remove = async (id: string) => {
  await pb.collection('users').delete(id)
}

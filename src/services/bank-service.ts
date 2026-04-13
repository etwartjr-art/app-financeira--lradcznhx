import pb from '@/lib/pocketbase/client'

export interface Bank {
  id: string
  user_id: string
  bank_name: string
  agency: string
  account_number: string
  created: string
  updated: string
}

export const getBanks = async (userId: string): Promise<Bank[]> => {
  try {
    return await pb.collection('banks').getFullList({
      filter: `user_id = "${userId}"`,
      sort: '-created',
    })
  } catch (error) {
    throw new Error('Erro ao buscar bancos.')
  }
}

export const createBank = async (data: Partial<Bank>): Promise<Bank> => {
  try {
    return await pb.collection('banks').create(data)
  } catch (error) {
    throw new Error('Erro ao criar banco.')
  }
}

export const updateBank = async (bankId: string, data: Partial<Bank>): Promise<Bank> => {
  try {
    return await pb.collection('banks').update(bankId, data)
  } catch (error) {
    throw new Error('Erro ao atualizar banco.')
  }
}

export const deleteBank = async (bankId: string): Promise<void> => {
  try {
    await pb.collection('banks').delete(bankId)
  } catch (error) {
    throw new Error('Erro ao deletar banco.')
  }
}

import { getAll as getCategories, create as createCategory } from './categories'

export const mapEstablishmentToCategory = async (establishment: string): Promise<string> => {
  const lower = establishment.toLowerCase()
  let mappedName = 'Outros'

  if (lower.includes('educacao') || lower.includes('curso') || lower.includes('faculdade')) {
    mappedName = 'Educacao'
  } else if (lower.includes('transporte') || lower.includes('uber') || lower.includes('99')) {
    mappedName = 'Transporte'
  } else if (
    lower.includes('restaurante') ||
    lower.includes('ifood') ||
    lower.includes('padaria') ||
    lower.includes('alimentacao')
  ) {
    mappedName = 'Alimentacao'
  } else if (lower.includes('viagem') || lower.includes('hotel') || lower.includes('passagem')) {
    mappedName = 'Viagem'
  } else if (
    lower.includes('servicos') ||
    lower.includes('assinatura') ||
    lower.includes('netflix')
  ) {
    mappedName = 'Servicos'
  }

  try {
    const categories = await getCategories()
    const existing = categories.find((c) => c.name.toLowerCase() === mappedName.toLowerCase())

    if (existing) {
      return existing.name
    }

    const newCat = await createCategory({
      name: mappedName,
      color: '#0f766e',
    })

    return newCat.name
  } catch (error) {
    console.log('Erro ao mapear categoria', error)
    return mappedName
  }
}

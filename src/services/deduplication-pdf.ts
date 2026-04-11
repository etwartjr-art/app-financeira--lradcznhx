import type { ParsedPDFTransaction } from './pdf-parser'
import type { Transaction } from '@/stores/FinanceContext'

export const deduplicatePDFTransactions = (
  parsed: ParsedPDFTransaction[],
  existing: Transaction[],
) => {
  const newTransactions: ParsedPDFTransaction[] = []
  let duplicateCount = 0

  for (const p of parsed) {
    const isDuplicate = existing.some((e) => {
      if (!e.date) return false
      const eDate = e.date.substring(0, 10)
      const pDate = p.date.substring(0, 10)

      const sameDate = eDate === pDate
      const sameAmount = Math.abs(e.amount - p.amount) < 0.01
      const sameEstablishment = e.description.toLowerCase() === p.establishment.toLowerCase()

      return sameDate && sameAmount && sameEstablishment
    })

    if (isDuplicate) {
      duplicateCount++
    } else {
      newTransactions.push(p)
    }
  }

  console.log(
    `Importacao PDF: ${newTransactions.length} transacoes novas, ${duplicateCount} duplicadas removidas`,
  )

  return { newTransactions, duplicateCount }
}

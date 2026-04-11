import type { ParsedTransaction } from './ofx-parser'

export const deduplicateTransactions = (
  parsedTransactions: ParsedTransaction[],
  existingTransactions: { fitId?: string }[],
): { newTransactions: ParsedTransaction[]; duplicateCount: number } => {
  const existingIds = new Set(
    existingTransactions
      .map((t) => t.fitId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0),
  )

  const newTransactions = parsedTransactions.filter((t) => !existingIds.has(t.fitId))
  const duplicateCount = parsedTransactions.length - newTransactions.length

  console.log(
    `Importacao: ${newTransactions.length} transacoes novas, ${duplicateCount} duplicadas removidas`,
  )

  return { newTransactions, duplicateCount }
}

import pb from '@/lib/pocketbase/client'
import { ParsedInvoiceData } from './universal-parser'

export class TransactionService {
  assignCategoryAutomatically(description: string, type: 'income' | 'expense'): string {
    const lowerDesc = description.toLowerCase()

    if (lowerDesc.includes('agua') || lowerDesc.includes('água')) return 'AGUA'
    if (lowerDesc.includes('energia')) return 'ENERGIA'
    if (lowerDesc.includes('internet')) return 'INTERNET'
    if (lowerDesc.includes('combustivel') || lowerDesc.includes('combustível')) return 'COMBUSTIVEL'
    if (lowerDesc.includes('supermercado')) return 'SUPERMERCADO'
    if (
      lowerDesc.includes('lanche') ||
      lowerDesc.includes('refeicao') ||
      lowerDesc.includes('refeição')
    )
      return 'LANCHE E REFEICOES'
    if (lowerDesc.includes('salario') || lowerDesc.includes('salário')) return 'SALARIO'
    if (lowerDesc.includes('pro-labore') || lowerDesc.includes('pró-labore')) return 'PRO-LABORE'
    if (lowerDesc.includes('curso') || lowerDesc.includes('treinamento'))
      return 'CURSOS E TREINAMENTOS'

    return type === 'income' ? 'OUTROS RECEBIMENTOS' : 'OUTROS PAGAMENTOS'
  }

  async createTransactionsFromParsedStatement(
    parsedStatement: ParsedInvoiceData,
    userId: string,
  ): Promise<void> {
    if (!parsedStatement.transactions || parsedStatement.transactions.length === 0) {
      throw new Error('Dados insuficientes no extrato')
    }

    const promises = parsedStatement.transactions.map(async (t) => {
      const type = t.amount > 0 ? 'income' : 'expense'
      const category = this.assignCategoryAutomatically(t.description || '', type)

      return pb.collection('transactions').create({
        user_id: userId,
        description: t.description || 'Transação Importada',
        amount: Math.abs(t.amount),
        type: type,
        category: category,
        origin: 'import',
        date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
      })
    })

    await Promise.all(promises)
  }
}

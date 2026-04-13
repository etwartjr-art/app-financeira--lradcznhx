import { PDFParserService } from './pdf-parser'

export interface ParsedInvoiceData {
  cardInfo?: {
    cardNumber?: string
    holderName?: string
    bank?: string
  }
  totalAmount?: number
  creditLimits?: {
    totalLimit?: number
    availableLimit?: number
  }
  statementPeriod?: {
    startDate?: string
    endDate?: string
  }
  transactions?: Array<{
    date: string
    description?: string
    establishment?: string
    amount: number
    installment?: string
  }>
}

export class UniversalParserService {
  async parseFile(file: File): Promise<ParsedInvoiceData> {
    if (file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfParser = new PDFParserService()
        const data = await pdfParser.parseFile(file)
        return {
          ...data,
          cardInfo: {
            cardNumber: data.cardInfo?.cardNumber || '****',
            holderName: data.cardInfo?.holderName || 'Titular do Cartão',
            bank: data.cardInfo?.bank || 'Banco Desconhecido',
          },
          totalAmount: data.creditLimits?.totalLimit || 0,
        } as ParsedInvoiceData
      } catch (e: unknown) {
        throw new Error(e instanceof Error ? e.message : 'Erro ao processar PDF')
      }
    }

    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            cardInfo: {
              cardNumber: '1234',
              holderName: 'Cliente Silva',
              bank: 'Banco Digital',
            },
            totalAmount: 2540.5,
            creditLimits: { totalLimit: 5000, availableLimit: 2459.5 },
            statementPeriod: { startDate: '2023-10-01', endDate: '2023-10-31' },
            transactions: [
              { date: '2023-10-05', description: 'Supermercado', amount: 350.0 },
              { date: '2023-10-10', description: 'Restaurante', amount: 120.0 },
              { date: '2023-10-15', description: 'Posto de Gasolina', amount: 200.0 },
            ],
          })
        }, 2000)
      })
    }

    throw new Error('Formato de arquivo não suportado pelo parser.')
  }
}

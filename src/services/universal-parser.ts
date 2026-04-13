import { PDFParserService } from './pdf-parser'

export interface ParsedInvoiceData {
  cardInfo?: {
    cardNumber?: string
    holderName?: string
    bank?: string
  }
  bankInfo?: {
    bank?: string | null
    agency?: string | null
    accountNumber?: string | null
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
  parseText(text: string): {
    bank: string | null
    agency: string | null
    accountNumber: string | null
  } {
    const bankMatch = text.match(/banco:\s*([a-z0-9\s]+)/im)
    const agencyMatch = text.match(/ag[eê]ncia:\s*(\d+)/im)
    const accountMatch = text.match(/conta:\s*(\d+)/im)

    let bank = bankMatch ? bankMatch[1].trim() : null
    if (!bank) {
      const knownBanks = ['itau', 'bradesco', 'santander', 'c6', 'nubank', 'caixa', 'inter']
      for (const b of knownBanks) {
        if (text.toLowerCase().includes(b)) {
          bank = b
          break
        }
      }
    }

    return {
      bank: bank || null,
      agency: agencyMatch ? agencyMatch[1] : null,
      accountNumber: accountMatch ? accountMatch[1] : null,
    }
  }

  async parseFile(file: File): Promise<ParsedInvoiceData> {
    if (file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfParser = new PDFParserService()
        const data = await pdfParser.parseFile(file)

        const textToParse = (data as any).rawText || ''
        const bankInfo = this.parseText(textToParse)

        return {
          ...data,
          bankInfo,
          cardInfo: {
            cardNumber: data.cardInfo?.cardNumber || '****',
            holderName: data.cardInfo?.holderName || 'Titular do Cartão',
            bank: data.cardInfo?.bank || bankInfo.bank || 'Banco Desconhecido',
          },
          totalAmount: data.creditLimits?.totalLimit || 0,
        } as ParsedInvoiceData
      } catch (e: unknown) {
        throw new Error(e instanceof Error ? e.message : 'Erro ao processar arquivo')
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
            bankInfo: {
              bank: 'Banco Digital',
              agency: '0001',
              accountNumber: '123456-7',
            },
            totalAmount: 2540.5,
            creditLimits: { totalLimit: 5000, availableLimit: 2459.5 },
            statementPeriod: { startDate: '2023-10-01', endDate: '2023-10-31' },
            transactions: [
              { date: '2023-10-05', description: 'Supermercado Extra', amount: -350.0 },
              { date: '2023-10-10', description: 'Restaurante Lanche', amount: -120.0 },
              { date: '2023-10-15', description: 'Posto de Gasolina Combustivel', amount: -200.0 },
              { date: '2023-10-20', description: 'Salario Mensal', amount: 5000.0 },
            ],
          })
        }, 2000)
      })
    }

    throw new Error('Formato de arquivo não suportado pelo parser.')
  }
}

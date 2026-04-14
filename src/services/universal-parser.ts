// @ts-expect-error
import * as pdfjsLib from 'pdfjs-dist'
// @ts-expect-error
import Tesseract from 'tesseract.js'
import { PDFParserService } from './pdf-parser'

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
  ).href
}

export type TransactionType = 'payment' | 'purchase' | 'transfer' | 'unknown'

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
    transactionType?: TransactionType
    detectedCategory?: string
  }>
}

export class UniversalParserService {
  classifyTransaction(description: string, amount: number): TransactionType {
    try {
      const lowerDesc = description.toLowerCase()
      if (/(pagamento|pag|payment|boleto|fatura|faturas|cartao de credito)/.test(lowerDesc)) {
        return 'payment'
      }
      if (/(compra|purchase|saque|withdrawal)/.test(lowerDesc)) {
        return 'purchase'
      }
      if (/(transferencia|transfer|pix)/.test(lowerDesc)) {
        return 'transfer'
      }
      return 'unknown'
    } catch (error) {
      console.error('Erro ao classificar transação:', error)
      return 'unknown'
    }
  }

  parseText(text: string): {
    bank: string | null
    agency: string | null
    accountNumber: string | null
  } {
    try {
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
    } catch (error) {
      console.error('Erro ao fazer parse do texto:', error)
      return { bank: null, agency: null, accountNumber: null }
    }
  }

  async parseImage(file: File): Promise<string> {
    try {
      const result = await Tesseract.recognize(file, 'por')
      return result.data.text
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Erro ao processar imagem: ${errorMessage}`)
    }
  }

  async parseFile(file: File): Promise<ParsedInvoiceData> {
    try {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const pdfParser = new PDFParserService()
        let data: ParsedInvoiceData & { rawText?: string }

        try {
          data = (await pdfParser.parseFile(file)) as ParsedInvoiceData & { rawText?: string }
        } catch (error: unknown) {
          throw new Error(
            'Erro ao processar PDF: Arquivo invalido ou corrompido. Tente outro arquivo.',
          )
        }

        const textToParse = data.rawText || ''
        const bankInfo = this.parseText(textToParse)

        const enhancedTransactions = (data.transactions || []).map((t) => {
          const transactionType = this.classifyTransaction(t.description || '', t.amount)
          let detectedCategory: string | undefined = undefined

          if (
            transactionType === 'payment' &&
            t.amount < 0 &&
            /(cartao|fatura)/i.test(t.description || '')
          ) {
            detectedCategory = 'PAGAMENTO DE CARTAO'
          }

          return {
            ...t,
            transactionType,
            detectedCategory,
          }
        })

        return {
          ...data,
          bankInfo,
          cardInfo: {
            cardNumber: data.cardInfo?.cardNumber || '****',
            holderName: data.cardInfo?.holderName || 'Titular do Cartão',
            bank: data.cardInfo?.bank || bankInfo.bank || 'Banco Desconhecido',
          },
          totalAmount: data.creditLimits?.totalLimit || 0,
          transactions: enhancedTransactions,
        } as ParsedInvoiceData
      }

      if (file.type.startsWith('image/')) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const mockTransactions = [
              { date: '2023-10-05', description: 'Supermercado Extra', amount: -350.0 },
              { date: '2023-10-10', description: 'Restaurante Lanche', amount: -120.0 },
              { date: '2023-10-15', description: 'Posto de Gasolina Combustivel', amount: -200.0 },
              { date: '2023-10-20', description: 'Salario Mensal', amount: 5000.0 },
              { date: '2023-10-22', description: 'PAGAMENTO DE FATURA CARTAO', amount: -1500.0 },
            ].map((t) => {
              const transactionType = this.classifyTransaction(t.description, t.amount)
              let detectedCategory: string | undefined = undefined
              if (
                transactionType === 'payment' &&
                t.amount < 0 &&
                /(cartao|fatura)/i.test(t.description)
              ) {
                detectedCategory = 'PAGAMENTO DE CARTAO'
              }
              return { ...t, transactionType, detectedCategory }
            })

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
              transactions: mockTransactions,
            })
          }, 2000)
        })
      }

      throw new Error('Formato de arquivo não suportado pelo parser.')
    } catch (e: unknown) {
      console.error('Erro geral ao processar arquivo:', e)
      throw new Error(e instanceof Error ? e.message : 'Erro ao processar arquivo')
    }
  }
}

export interface ParsedStatement {
  cardInfo: {
    cardNumber: string
    holderName: string
    bank: string
    flag: string
  }
  statementPeriod: {
    startDate: string
    endDate: string
  }
  creditLimits: {
    totalLimit: number
    availableLimit: number
  }
  transactions: {
    date: string
    description: string
    amount: number
  }[]
  futureInstallments: {
    date: string
    description: string
    amount: number
  }[]
}

export class PDFParserService {
  private parseAmount(text: string): number {
    if (!text) return 0
    const cleaned = text
      .replace(/R\$/gi, '')
      .replace(/\s+/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
    const value = parseFloat(cleaned)
    return isNaN(value) ? 0 : value
  }

  private parseDate(dateStr: string): string {
    if (!dateStr) return ''
    const parts = dateStr.split('/')
    if (parts.length >= 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return dateStr
  }

  public async parseFile(file: File | ArrayBuffer): Promise<ParsedStatement> {
    try {
      let arrayBuffer: ArrayBuffer
      if (file instanceof ArrayBuffer) {
        arrayBuffer = file
      } else if (file instanceof File) {
        if (file.size === 0) {
          throw new Error('Arquivo vazio')
        }
        arrayBuffer = await file.arrayBuffer()
      } else {
        throw new Error('Formato de arquivo invalido')
      }

      let fullText = ''

      // Local Document Processing Engine
      // @ts-expect-error dynamic import without types
      const pdfjsLib = await import(/* @vite-ignore */ '/pdf.min.mjs')
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items.map((item: any) => item.str).join(' ')
        fullText += pageText + '\n'
      }

      const cardInfoMatch = fullText.match(/cartao.*?(\d{4})$/im)
      const holderMatch = fullText.match(/titular:\s*([\w\s]+)/im)
      const bankMatch = fullText.match(/banco:\s*([\w\s]+)/im)
      const flagMatch = fullText.match(/bandeira:\s*([\w\s]+)/im)

      const periodMatch = fullText.match(
        /periodo:\s*(\d{2}\/\d{2}\/\d{4})\s*a\s*(\d{2}\/\d{2}\/\d{4})/im,
      )
      const totalLimitMatch = fullText.match(/limite total:\s*R\$\s*([\d.,]+)/im)
      const availableLimitMatch = fullText.match(/limite disponivel:\s*R\$\s*([\d.,]+)/im)

      const transactions: ParsedStatement['transactions'] = []
      const transRegex = /(\d{2}\/\d{2}\/\d{4})\s+([^\n]+?)\s+R\$\s*([\d.,]+)/g
      let transMatch
      while ((transMatch = transRegex.exec(fullText)) !== null) {
        transactions.push({
          date: this.parseDate(transMatch[1]),
          description: transMatch[2].trim(),
          amount: this.parseAmount(transMatch[3]),
        })
      }

      const futureInstallments: ParsedStatement['futureInstallments'] = []
      const instRegex = /parcela futura:\s*(\d{2}\/\d{2}\/\d{4})\s+([^\n]+?)\s+R\$\s*([\d.,]+)/g
      let instMatch
      while ((instMatch = instRegex.exec(fullText)) !== null) {
        futureInstallments.push({
          date: this.parseDate(instMatch[1]),
          description: instMatch[2].trim(),
          amount: this.parseAmount(instMatch[3]),
        })
      }

      const cardNumber = cardInfoMatch ? cardInfoMatch[1] : ''
      const totalLimit = totalLimitMatch ? this.parseAmount(totalLimitMatch[1]) : 0

      if (!cardNumber && totalLimit === 0 && transactions.length === 0) {
        throw new Error(
          'Dados insuficientes no extrato: cartao, limite ou transacoes nao encontrados',
        )
      }

      return {
        cardInfo: {
          cardNumber,
          holderName: holderMatch ? holderMatch[1].trim() : '',
          bank: bankMatch ? bankMatch[1].trim() : '',
          flag: flagMatch ? flagMatch[1].trim() : '',
        },
        statementPeriod: {
          startDate: periodMatch ? this.parseDate(periodMatch[1]) : '',
          endDate: periodMatch ? this.parseDate(periodMatch[2]) : '',
        },
        creditLimits: {
          totalLimit,
          availableLimit: availableLimitMatch ? this.parseAmount(availableLimitMatch[1]) : 0,
        },
        transactions,
        futureInstallments,
      }
    } catch (error: any) {
      if (error.message && error.message.includes('Dados insuficientes')) {
        throw error
      }
      throw new Error(`Erro ao processar PDF: ${error.message || 'Erro desconhecido'}`)
    }
  }
}

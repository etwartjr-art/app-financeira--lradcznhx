import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

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

export default class UniversalParserService {
  private normalizeText(text: string): string {
    return text.toLowerCase().replace(/\s+/g, ' ').trim()
  }

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

  private parseText(fullText: string): ParsedStatement {
    const normText = this.normalizeText(fullText)

    let cardNumber = ''
    const cardMatch1 = fullText.match(/cartao.*?(\d{4})$/im)
    const cardMatch2 = fullText.match(/\d{4}$/im)
    if (cardMatch1) cardNumber = cardMatch1[1]
    else if (cardMatch2) cardNumber = cardMatch2[0]

    let holderName = ''
    const holderMatch1 = fullText.match(/titular:\s*([\w\s]+)/im)
    const holderMatch2 = fullText.match(/^[A-Z][A-Z\s]{5,}/m)
    if (holderMatch1) holderName = holderMatch1[1].trim()
    else if (holderMatch2) holderName = holderMatch2[0].trim()

    let bank = ''
    const bankKeywords = ['itau', 'bradesco', 'santander', 'c6', 'nubank', 'caixa']
    for (const b of bankKeywords) {
      if (normText.includes(b)) {
        bank = b.charAt(0).toUpperCase() + b.slice(1)
        break
      }
    }

    let flag = ''
    const flagKeywords = ['platinum', 'gold', 'black', 'infinite', 'signature']
    for (const f of flagKeywords) {
      if (normText.includes(f)) {
        flag = f.charAt(0).toUpperCase() + f.slice(1)
        break
      }
    }

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

    const totalLimit = totalLimitMatch ? this.parseAmount(totalLimitMatch[1]) : 0

    if (!cardNumber && totalLimit === 0 && transactions.length === 0) {
      throw new Error('Dados insuficientes no extrato')
    }

    return {
      cardInfo: {
        cardNumber,
        holderName,
        bank,
        flag,
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
  }

  private async parsePDF(file: File): Promise<ParsedStatement> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      let fullText = ''

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
        fullText += pageText + '\n'
      }

      return this.parseText(fullText)
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Dados insuficientes no extrato') {
        throw error
      }
      const msg = error instanceof Error ? error.message : String(error)
      throw new Error(`Erro ao processar arquivo: ${msg}`)
    }
  }

  private async parseImage(file: File): Promise<ParsedStatement> {
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const result = await Tesseract.recognize(dataUrl, 'por')
      return this.parseText(result.data.text)
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Dados insuficientes no extrato') {
        throw error
      }
      const msg = error instanceof Error ? error.message : String(error)
      throw new Error(`Erro ao processar imagem: ${msg}`)
    }
  }

  public async parseFile(file: File): Promise<ParsedStatement> {
    if (file.type === 'application/pdf') {
      return this.parsePDF(file)
    } else if (
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/webp'
    ) {
      return this.parseImage(file)
    } else {
      throw new Error('Tipo de arquivo nao suportado. Use PDF ou imagem')
    }
  }
}

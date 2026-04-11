export interface ParsedPDFTransaction {
  date: string // YYYY-MM-DD
  establishment: string
  amount: number
  installment?: string
  category?: string
}

export interface ParsedPDFInstallment {
  date: string // YYYY-MM-DD
  establishment: string
  amount: number
  installment: string
}

export interface ParsedPDFData {
  cardInfo: {
    cardNumber?: string
    holder?: string
    bank?: string
    flag?: string
    last4?: string
    holderName?: string
    bankName?: string
  }
  statementPeriod: {
    issuanceDate?: string
    dueDate?: string
    nextClosingDate?: string
  }
  creditLimits: {
    totalLimit?: number
    usedLimit?: number
    availableLimit?: number
  }
  limits?: {
    total?: number
    used?: number
    available?: number
  }
  transactions: ParsedPDFTransaction[]
  futureInstallments: ParsedPDFInstallment[]
}

const parseAmount = (text: string): number => {
  if (!text) return 0
  const cleaned = text.replace(/R\$/gi, '').trim()
  const normalized = cleaned.replace(/\./g, '').replace(',', '.')
  const value = parseFloat(normalized)
  return isNaN(value) ? 0 : value
}

const parseDate = (dateString: string): string => {
  if (!dateString) return ''
  const match = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`
  }
  return dateString
}

export const parsePDFFile = async (file: File): Promise<ParsedPDFData> => {
  if (!file || file.size === 0) {
    throw new Error('Arquivo vazio')
  }

  let text = ''

  try {
    // @ts-expect-error dynamic import without types
    const pdfjsLib =
      await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs')
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.mjs'

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let extractedText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()

      let lastY: number | undefined
      let pageText = ''

      // Reconstruct lines based on Y coordinate to accurately parse tabular data
      for (const item of content.items as any[]) {
        if (lastY !== item.transform[5]) {
          pageText += '\n'
          lastY = item.transform[5]
        } else {
          pageText += ' '
        }
        pageText += item.str
      }
      extractedText += pageText + '\n'
    }
    text = extractedText
  } catch (error) {
    console.error('Erro ao processar o PDF:', error)
    throw new Error('Não foi possível ler o PDF. Tente outro arquivo.')
  }

  if (!text || !text.trim()) {
    throw new Error('Não foi possível extrair texto do PDF')
  }

  console.log('PDF Text Extract (first 500 chars):', text.substring(0, 500))

  const isStatement = /fatura|cart[aã]o|limite|vencimento/i.test(text)
  if (!isStatement) {
    throw new Error('Não é uma fatura de cartão válida')
  }

  // Card Metadata Extraction
  let cardNumber = '1234'
  let last4 = '1234'
  const cardNumberMatch = text.match(
    /(?:\d{4}[.\s]){3}\d{4}|\b(?:5522|4\d{3})\d{12}\b|XXXX\.XXXX\.XXXX\.(\d{4})/i,
  )
  if (cardNumberMatch) {
    cardNumber = cardNumberMatch[0]
    const digitsOnly = cardNumber.replace(/\D/g, '')
    if (digitsOnly.length >= 4) {
      last4 = digitsOnly.slice(-4)
    } else if (cardNumberMatch[1]) {
      last4 = cardNumberMatch[1]
    }
  }

  let holder = 'Titular Desconhecido'
  const titularMatch = text.match(/Titular[:\s]+([A-Z\s]+)/i)
  if (titularMatch && titularMatch[1]) {
    holder = titularMatch[1].trim()
  } else {
    const uppercaseMatch = text.match(/\b([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\b/)
    if (uppercaseMatch) {
      holder = uppercaseMatch[1].trim()
    }
  }

  let bank = 'Banco Desconhecido'
  if (/ita[uú]/i.test(text)) bank = 'Itaú'
  else if (/bradesco/i.test(text)) bank = 'Bradesco'
  else if (/santander/i.test(text)) bank = 'Santander'
  else if (/c6\s*bank/i.test(text)) bank = 'C6 Bank'
  else if (/nubank/i.test(text)) bank = 'Nubank'

  let flag = 'Desconhecida'
  if (/mastercard/i.test(text)) flag = 'Mastercard'
  else if (/visa/i.test(text)) flag = 'Visa'
  else if (/elo/i.test(text)) flag = 'Elo'
  else if (/amex|american express/i.test(text)) flag = 'Amex'

  let tier = ''
  if (/platinum/i.test(text)) tier = ' Platinum'
  else if (/gold/i.test(text)) tier = ' Gold'
  else if (/black/i.test(text)) tier = ' Black'
  else if (/infinite/i.test(text)) tier = ' Infinite'

  if (flag !== 'Desconhecida') {
    flag += tier
  }

  // Statement Period Extraction
  const dates = [...text.matchAll(/(\d{2}\/\d{2}\/\d{4})/g)].map((m) => parseDate(m[1]))
  const issuanceDate = dates.length > 0 ? dates[0] : undefined
  const dueDate = dates.length > 1 ? dates[1] : undefined
  const nextClosingDate = dates.length > 2 ? dates[2] : undefined

  // Credit Limits Extraction
  let totalLimit = 0
  let usedLimit = 0
  let availableLimit = 0

  const limitTotalMatch = text.match(/Limite total.*?(?:R\$)?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/i)
  if (limitTotalMatch) totalLimit = parseAmount(limitTotalMatch[1])

  const limitUsedMatch = text.match(/Limite utilizado.*?(?:R\$)?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/i)
  if (limitUsedMatch) usedLimit = parseAmount(limitUsedMatch[1])

  const limitAvailMatch = text.match(
    /Limite dispon[ií]vel.*?(?:R\$)?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/i,
  )
  if (limitAvailMatch) {
    availableLimit = parseAmount(limitAvailMatch[1])
  } else if (totalLimit > 0) {
    availableLimit = totalLimit - usedLimit
  }

  // Transactions & Installments Parsing
  const transactions: ParsedPDFTransaction[] = []
  const futureInstallments: ParsedPDFInstallment[] = []

  const lines = text.split('\n')
  let inInstallments = false
  const currentYear = new Date().getFullYear()

  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    if (
      lowerLine.includes('compras parceladas') ||
      lowerLine.includes('próximas faturas') ||
      lowerLine.includes('proximas faturas')
    ) {
      inInstallments = true
      continue
    }

    const rowMatch = line.match(
      /(?:^|\s)(\d{2}\/\d{2})\s+(.+?)\s+(?:R\$)?\s*(-?\d{1,3}(?:\.\d{3})*,\d{2})/,
    )
    if (rowMatch) {
      const dateStr = rowMatch[1]
      const establishmentRaw = rowMatch[2].trim()
      const amountStr = rowMatch[3]
      const amount = parseAmount(amountStr)

      const [day, month] = dateStr.split('/')
      const date = `${currentYear}-${month}-${day}`

      const installMatch = establishmentRaw.match(/(\d{1,2})\/(\d{1,2})$/)

      if (inInstallments || installMatch) {
        futureInstallments.push({
          date,
          establishment: establishmentRaw.replace(/\s*\d{1,2}\/\d{1,2}$/, '').trim(),
          amount,
          installment: installMatch ? installMatch[0] : '1/1',
        })
      } else {
        transactions.push({
          date,
          establishment: establishmentRaw,
          amount,
        })
      }
    }
  }

  if (transactions.length === 0 && totalLimit === 0 && last4 === '1234') {
    throw new Error('Não é uma fatura de cartão válida')
  }

  const result: ParsedPDFData = {
    cardInfo: {
      cardNumber,
      holder,
      bank,
      flag,
      last4,
      holderName: holder,
      bankName: bank,
    },
    statementPeriod: {
      issuanceDate,
      dueDate,
      nextClosingDate,
    },
    creditLimits: {
      totalLimit,
      usedLimit,
      availableLimit,
    },
    limits: {
      total: totalLimit,
      used: usedLimit,
      available: availableLimit,
    },
    transactions,
    futureInstallments,
  }

  console.log('Summary of parsed data:', {
    cardInfo: result.cardInfo,
    periods: result.statementPeriod,
    limits: result.creditLimits,
    transactionsCount: transactions.length,
    installmentsCount: futureInstallments.length,
  })

  return result
}

export interface ParsedPDFTransaction {
  date: string // YYYY-MM-DD
  establishment: string
  location?: string
  amount: number
  installment?: string
  category?: string
}

export interface ParsedPDFInstallment {
  dueDate: string // YYYY-MM-DD
  date?: string
  establishment: string
  amount: number
  installment?: string
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
  const cleaned = text.replace(/R\$/gi, '').replace(/\s+/g, '').replace(/\./g, '').replace(',', '.')
  const value = parseFloat(cleaned)
  return isNaN(value) ? 0 : value
}

const parseDateString = (d: string, m: string, y: string): string => {
  return `${y}-${m}-${d}`
}

export const parsePDFFile = async (file: File): Promise<ParsedPDFData> => {
  if (!file || file.size === 0) {
    throw new Error('Arquivo vazio')
  }

  let fullText = ''

  try {
    // @ts-expect-error dynamic import without types
    const pdfjsLib =
      await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs')
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()

      let lastY: number | undefined
      for (const item of content.items as any[]) {
        if (lastY !== item.transform[5] && lastY !== undefined) {
          fullText += '\n'
        } else if (lastY !== undefined) {
          fullText += ' '
        }
        fullText += item.str
        lastY = item.transform[5]
      }
      fullText += '\n'
    }
  } catch (error) {
    console.error('Erro ao processar o PDF:', error)
    throw new Error('Nao foi possivel ler o PDF. Tente outro arquivo.')
  }

  if (!fullText || !fullText.trim()) {
    throw new Error('Nao foi possivel extrair texto do PDF')
  }

  console.log(`Extracted text length: ${fullText.length}`)

  // Card Info Extraction
  let cardNumber = ''
  let last4 = ''
  const cardMatch = fullText.match(/5522[\dX.]*|XXXX\.XXXX\.XXXX\.\d{4}/i)
  if (cardMatch) {
    cardNumber = cardMatch[0]
    const digitsOnly = cardNumber.replace(/\D/g, '')
    if (digitsOnly.length >= 4) {
      last4 = digitsOnly.slice(-4)
    }
  }

  let holder = ''
  const holderMatch1 = fullText.match(/Titular\s+([A-Z\s]+)/i)
  const holderMatch2 = fullText.match(/^[A-Z][A-Z\s]{10,}/m)
  if (holderMatch1) {
    holder = holderMatch1[1].trim()
  } else if (holderMatch2) {
    holder = holderMatch2[0].trim()
  }

  let bank = ''
  const bankMatch = fullText.match(/Itau|Bradesco|Santander|C6|Nubank|Caixa/i)
  if (bankMatch) {
    bank = bankMatch[0].trim()
  }

  let flag = ''
  const flagMatch = fullText.match(/Platinum|Gold|Black|Infinite|Signature/i)
  if (flagMatch) {
    flag = flagMatch[0].trim()
  }

  // Statement Period Extraction
  let issuanceDate = ''
  const issuanceMatch1 = fullText.match(/Emissao:\s*(\d{2})\/(\d{2})\/(\d{4})/i)
  if (issuanceMatch1) {
    issuanceDate = parseDateString(issuanceMatch1[1], issuanceMatch1[2], issuanceMatch1[3])
  } else {
    const issuanceMatch2 = fullText.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (issuanceMatch2) {
      issuanceDate = parseDateString(issuanceMatch2[1], issuanceMatch2[2], issuanceMatch2[3])
    }
  }

  let dueDate = ''
  const dueDateMatch = fullText.match(/Vencimento:\s*(\d{2})\/(\d{2})\/(\d{4})/i)
  if (dueDateMatch) {
    dueDate = parseDateString(dueDateMatch[1], dueDateMatch[2], dueDateMatch[3])
  }

  let nextClosingDate = ''
  const nextClosingMatch = fullText.match(/proxima.*fechamento:\s*(\d{2})\/(\d{2})\/(\d{4})/i)
  if (nextClosingMatch) {
    nextClosingDate = parseDateString(nextClosingMatch[1], nextClosingMatch[2], nextClosingMatch[3])
  }

  // Financial Limits
  let totalLimit = 0
  const totalLimitMatch = fullText.match(/Limite\s+total.*?R\$\s*([\d.,]+)/i)
  if (totalLimitMatch) {
    totalLimit = parseAmount(totalLimitMatch[1])
  }

  let usedLimit = 0
  const usedLimitMatch = fullText.match(/Limite\s+utilizado.*?R\$\s*([\d.,]+)/i)
  if (usedLimitMatch) {
    usedLimit = parseAmount(usedLimitMatch[1])
  }

  let availableLimit = 0
  const availableLimitMatch = fullText.match(/Limite\s+disponivel.*?R\$\s*([\d.,]+)/i)
  if (availableLimitMatch) {
    availableLimit = parseAmount(availableLimitMatch[1])
  }

  // Transactions & Installments
  const transactions: ParsedPDFTransaction[] = []
  const futureInstallments: ParsedPDFInstallment[] = []

  const lines = fullText.split('\n')
  let inInstallments = false
  const currentYear = new Date().getFullYear()

  for (const line of lines) {
    if (/Compras parceladas|proximas faturas|Parcelado/i.test(line)) {
      inInstallments = true
      continue
    }

    const rowMatch = line.match(/(?:^|\s)(\d{2})\/(\d{2})\s+(.+?)\s+R\$\s*([\d.,]+)/)
    if (rowMatch) {
      const day = rowMatch[1]
      const month = rowMatch[2]
      const establishmentRaw = rowMatch[3].trim()
      const amount = parseAmount(rowMatch[4])
      const date = `${currentYear}-${month}-${day}` // Fallback year

      // Extract location if establishment ends with a known city/state format
      let establishment = establishmentRaw
      let location = ''

      const locMatch = establishmentRaw.match(/\s+([A-Z]{2}|\w+\s[A-Z]{2})$/)
      if (locMatch) {
        location = locMatch[1].trim()
        establishment = establishmentRaw.substring(0, locMatch.index).trim()
      }

      if (inInstallments) {
        futureInstallments.push({
          dueDate: date,
          date: date,
          establishment,
          amount,
          installment: '1/1',
        })
      } else {
        transactions.push({
          date,
          establishment,
          location,
          amount,
        })
      }
    }
  }

  // Validation
  if (!cardNumber && totalLimit === 0 && transactions.length === 0) {
    throw new Error('Nao eh uma fatura de cartao valida')
  }

  return {
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
}

export interface ParsedPDFTransaction {
  date: string // YYYY-MM-DD
  establishment: string
  location?: string
  amount: number
}

export interface ParsedPDFInstallment {
  dueDate: string // YYYY-MM-DD
  establishment: string
  amount: number
}

export interface ParsedPDFData {
  cardInfo: {
    cardNumber?: string
    holder?: string
    bank?: string
    flag?: string
  }
  statementPeriod: {
    issuanceDate?: string
    dueDate?: string
    nextClosingDate?: string
  }
  creditLimits: {
    totalLimit: number
    usedLimit: number
    availableLimit: number
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

const parseDate = (dateStr: string): string => {
  const parts = dateStr.split('/')
  if (parts.length >= 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  } else if (parts.length === 2) {
    const currentYear = new Date().getFullYear()
    return `${currentYear}-${parts[1]}-${parts[0]}`
  }
  return dateStr
}

export const parsePDFFile = async (file: File | ArrayBuffer): Promise<ParsedPDFData> => {
  let arrayBuffer: ArrayBuffer
  if (file instanceof ArrayBuffer) {
    arrayBuffer = file
  } else if (file instanceof File) {
    if (file.size === 0) {
      throw new Error('Não foi possível ler o PDF. Tente outro arquivo.')
    }
    arrayBuffer = await file.arrayBuffer()
  } else {
    throw new Error('Não foi possível ler o PDF. Tente outro arquivo.')
  }

  let fullText = ''

  try {
    // @ts-expect-error dynamic import without types
    const pdfjsLib =
      await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs')
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

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
    console.error(error)
    throw new Error('Não foi possível ler o PDF. Tente outro arquivo.')
  }

  if (!fullText || fullText.trim().length < 50) {
    throw new Error('Não foi possível ler o PDF. Tente outro arquivo.')
  }

  // Card & Identity Extraction
  let cardNumber = ''
  const cardMatch = fullText.match(/5522[\dX.]*|XXXX\.XXXX\.XXXX\.\d{4}/i)
  if (cardMatch) {
    const digitsOnly = cardMatch[0].replace(/\D/g, '')
    if (digitsOnly.length >= 4) {
      cardNumber = digitsOnly.slice(-4)
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

  // Statement Period & Limits Extraction
  let issuanceDate = ''
  const issuanceMatch1 = fullText.match(/Emissao:\s*(\d{2}\/\d{2}\/\d{4})/i)
  if (issuanceMatch1) {
    issuanceDate = parseDate(issuanceMatch1[1])
  } else {
    const issuanceMatch2 = fullText.match(/(\d{2}\/\d{2}\/\d{4})/)
    if (issuanceMatch2) {
      issuanceDate = parseDate(issuanceMatch2[1])
    }
  }

  let dueDate = ''
  const dueDateMatch = fullText.match(/Vencimento:\s*(\d{2}\/\d{2}\/\d{4})/i)
  if (dueDateMatch) {
    dueDate = parseDate(dueDateMatch[1])
  }

  let nextClosingDate = ''
  const nextClosingMatch = fullText.match(/proxima.*fechamento:\s*(\d{2}\/\d{2}\/\d{4})/i)
  if (nextClosingMatch) {
    nextClosingDate = parseDate(nextClosingMatch[1])
  }

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
  } else {
    availableLimit = totalLimit - usedLimit
  }

  // Transactions & Installments
  const transactions: ParsedPDFTransaction[] = []
  const futureInstallments: ParsedPDFInstallment[] = []

  const lines = fullText.split('\n')
  let inInstallments = false

  for (const line of lines) {
    if (/Compras parceladas|proximas faturas|Parcelado/i.test(line)) {
      inInstallments = true
      continue
    }

    const rowMatch = line.match(
      /(?:^|\s)(\d{2}\/\d{2})\s+(.+?)\s+(?:R\$\s*([\d.,]+)|([\d.,]+)\s*$)/,
    )
    if (rowMatch) {
      const dateStr = rowMatch[1]
      const establishmentRaw = rowMatch[2].trim()
      const amountStr = rowMatch[3] || rowMatch[4]
      const amount = parseAmount(amountStr)
      const date = parseDate(dateStr)

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
          establishment,
          amount,
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
  if (!cardNumber && totalLimit <= 0 && transactions.length === 0) {
    throw new Error('Não é uma fatura de cartão válida')
  }

  return {
    cardInfo: {
      cardNumber,
      holder,
      bank,
      flag,
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
    transactions,
    futureInstallments,
  }
}

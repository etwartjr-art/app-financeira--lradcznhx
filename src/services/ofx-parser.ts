export interface ParsedTransaction {
  fitId: string
  refNum?: string
  amount: number
  type: 'income' | 'expense'
  date: string
  description: string
  origin: string
}

export const parseOFXFile = (fileContent: string): ParsedTransaction[] => {
  try {
    if (!fileContent.toLowerCase().includes('<ofx>')) {
      throw new Error('Arquivo OFX invalido')
    }

    // Extract Account Info to form the origin string
    const bankIdMatch = fileContent.match(/<BANKID>([^<\r\n]+)/i)
    const acctIdMatch = fileContent.match(/<ACCTID>([^<\r\n]+)/i)
    const orgMatch = fileContent.match(/<ORG>([^<\r\n]+)/i)

    const bankId = bankIdMatch ? bankIdMatch[1].trim() : ''
    const acctId = acctIdMatch ? acctIdMatch[1].trim() : ''
    const org = orgMatch ? orgMatch[1].trim() : bankId || 'Desconhecido'

    const origin = `Banco ${org} - ${acctId}`

    // Split transactions blocks (handling both SGML and XML style tags)
    const transBlocks = fileContent.split(/<STMTTRN>/i).slice(1)
    if (transBlocks.length === 0) {
      throw new Error('Arquivo OFX invalido')
    }

    const transactions: ParsedTransaction[] = []

    for (const block of transBlocks) {
      const trnTypeMatch = block.match(/<TRNTYPE>([^<\r\n]+)/i)
      const dtPostedMatch = block.match(/<DTPOSTED>([^<\r\n]+)/i)
      const trnAmtMatch = block.match(/<TRNAMT>([^<\r\n]+)/i)
      const fitIdMatch = block.match(/<FITID>([^<\r\n]+)/i)
      const refNumMatch = block.match(/<REFNUM>([^<\r\n]+)/i)
      const memoMatch = block.match(/<MEMO>([^<\r\n]+)/i)

      if (!trnTypeMatch || !dtPostedMatch || !trnAmtMatch || !fitIdMatch) {
        continue
      }

      const typeRaw = trnTypeMatch[1].trim().toUpperCase()
      const type = typeRaw === 'CREDIT' ? 'income' : 'expense'

      const rawDate = dtPostedMatch[1].trim()
      const dateMatch = rawDate.match(/^(\d{4})(\d{2})(\d{2})/)
      let date = new Date().toISOString()
      if (dateMatch) {
        date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T12:00:00.000Z`
      }

      const rawAmt = parseFloat(trnAmtMatch[1].trim().replace(',', '.'))
      const amount = Math.abs(rawAmt)

      transactions.push({
        fitId: fitIdMatch[1].trim(),
        refNum: refNumMatch ? refNumMatch[1].trim() : undefined,
        amount,
        type,
        date,
        description: memoMatch ? memoMatch[1].trim() : 'Transação Bancária',
        origin,
      })
    }

    if (transactions.length === 0) {
      throw new Error('Arquivo OFX invalido')
    }

    return transactions
  } catch (e) {
    throw new Error('Arquivo OFX invalido')
  }
}

import { useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, FileCode } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { parseOFXFile } from '@/services/ofx-parser'
import { deduplicateTransactions } from '@/services/deduplication'
import { create as createTransaction, getAll as getAllTransactions } from '@/services/transactions'
import { PDFParserService } from '@/services/pdf-parser'
import { deduplicatePDFTransactions } from '@/services/deduplication-pdf'
import { mapEstablishmentToCategory } from '@/services/category-mapper'
import { getAll as getCards, update as updateCard } from '@/services/cards'

export default function Import() {
  const ofxInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const [isDraggingOfx, setIsDraggingOfx] = useState(false)
  const [isLoadingOfx, setIsLoadingOfx] = useState(false)

  const [isDraggingPdf, setIsDraggingPdf] = useState(false)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)

  const processOfxFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.ofx')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione apenas arquivos .ofx',
        variant: 'destructive',
      })
      return
    }

    if (file.size === 0) {
      toast({ title: 'Arquivo vazio', variant: 'destructive' })
      return
    }

    setIsLoadingOfx(true)

    try {
      const text = await file.text()
      if (!text.trim()) {
        toast({ title: 'Arquivo vazio', variant: 'destructive' })
        setIsLoadingOfx(false)
        return
      }

      const parsedTransactions = parseOFXFile(text)
      const existingTransactions = await getAllTransactions()

      const { newTransactions, duplicateCount } = deduplicateTransactions(
        parsedTransactions,
        existingTransactions,
      )

      const shouldThrottle = newTransactions.length > 50
      let importedCount = 0

      for (const t of newTransactions) {
        await createTransaction({
          description: t.description,
          amount: t.amount,
          type: t.type,
          date: t.date,
          origin: t.origin,
          category: 'Outros',
          fitId: t.fitId,
          refNum: t.refNum,
          tags: 'importado',
        })
        importedCount++
        if (shouldThrottle) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      if (importedCount > 0) {
        toast({
          title: `${importedCount} transações importadas com sucesso`,
          className: 'bg-emerald-600 text-white border-none',
        })
      }

      if (duplicateCount > 0) {
        toast({ title: `${duplicateCount} transações duplicadas ignoradas` })
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao ler arquivo OFX',
        description:
          error.message === 'Arquivo OFX invalido' ? error.message : 'Ocorreu um erro inesperado.',
        variant: 'destructive',
        action: (
          <ToastAction altText="Tentar novamente" onClick={() => ofxInputRef.current?.click()}>
            Tentar novamente
          </ToastAction>
        ),
      })
    } finally {
      setIsLoadingOfx(false)
      if (ofxInputRef.current) ofxInputRef.current.value = ''
    }
  }

  const processPdfFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione apenas arquivos .pdf',
        variant: 'destructive',
      })
      return
    }

    setIsLoadingPdf(true)

    try {
      const parserService = new PDFParserService()
      const parsedData = await parserService.parsePDF(file)
      const cards = await getCards()

      const matchedCard = cards.find((c) => c.last4 === parsedData.cardInfo.cardNumber)

      if (!matchedCard) {
        toast({
          title: 'Cartao nao encontrado. Crie o cartao primeiro.',
          variant: 'destructive',
        })
        setIsLoadingPdf(false)
        if (pdfInputRef.current) pdfInputRef.current.value = ''
        return
      }

      await updateCard(matchedCard.id, {
        limit: parsedData.creditLimits.totalLimit || matchedCard.limit,
        availableLimit: parsedData.creditLimits.availableLimit,
        usedLimit: parsedData.creditLimits.totalLimit - parsedData.creditLimits.availableLimit,
        dueDate: parsedData.statementPeriod.endDate || matchedCard.dueDate,
        nextClosingDate: parsedData.statementPeriod.startDate,
      })

      const existingTransactions = await getAllTransactions()

      const mappedTransactions = parsedData.transactions.map((t) => ({
        date: t.date,
        establishment: t.description,
        amount: t.amount,
        installment: '',
      }))

      const { newTransactions, duplicateCount } = deduplicatePDFTransactions(
        mappedTransactions,
        existingTransactions,
      )

      let importedCount = 0

      for (const t of newTransactions) {
        const category = await mapEstablishmentToCategory(t.establishment)
        const desc = t.installment ? `${t.establishment} (${t.installment})` : t.establishment

        await createTransaction({
          description: desc,
          amount: t.amount,
          type: 'expense',
          date: t.date + ' 12:00:00.000Z',
          origin: matchedCard.name,
          category: category,
          tags: 'importado-pdf',
          cardId: matchedCard.id,
        })
        importedCount++
      }

      if (importedCount > 0) {
        toast({
          title: `${importedCount} transacoes importadas com sucesso`,
          className: 'bg-emerald-600 text-white border-none',
        })
      }

      if (duplicateCount > 0) {
        toast({
          title: `${duplicateCount} transacoes duplicadas ignoradas`,
        })
      }
    } catch (error: any) {
      console.log(error)
      toast({
        title: 'Erro ao ler arquivo PDF',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
        action: (
          <ToastAction altText="Tentar novamente" onClick={() => pdfInputRef.current?.click()}>
            Tentar novamente
          </ToastAction>
        ),
      })
    } finally {
      setIsLoadingPdf(false)
      if (pdfInputRef.current) pdfInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Conciliação</h1>
        <p className="text-slate-400">
          Importe arquivos OFX ou faturas em PDF para sincronizar transações
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OFX Zone */}
        <div
          className={`w-full h-80 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all bg-[#161925] ${isDraggingOfx ? 'border-[#0f766e] bg-[#0f766e]/5' : 'border-slate-700 hover:border-slate-500'} ${isLoadingOfx ? 'opacity-70 pointer-events-none' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDraggingOfx(true)
          }}
          onDragLeave={() => setIsDraggingOfx(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDraggingOfx(false)
            const file = e.dataTransfer.files?.[0]
            if (file) processOfxFile(file)
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0f766e]/10 flex items-center justify-center mb-6 shadow-sm">
            {isLoadingOfx ? (
              <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin" />
            ) : (
              <FileCode className="w-8 h-8 text-[#0f766e]" />
            )}
          </div>

          <h3 className="text-xl font-semibold text-white mb-2 text-center">
            {isLoadingOfx ? 'Importando OFX...' : 'Arraste arquivo OFX aqui'}
          </h3>
          {!isLoadingOfx && (
            <p className="text-slate-400 text-sm mb-8">Apenas arquivos .ofx do seu banco</p>
          )}

          <input
            type="file"
            accept=".ofx"
            className="hidden"
            ref={ofxInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) processOfxFile(file)
            }}
            disabled={isLoadingOfx}
          />

          {!isLoadingOfx && (
            <Button
              className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-lg px-8 h-12 font-medium"
              onClick={() => ofxInputRef.current?.click()}
            >
              Selecionar OFX
            </Button>
          )}
        </div>

        {/* PDF Zone */}
        <div
          className={`w-full h-80 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all bg-[#161925] ${isDraggingPdf ? 'border-[#8b5cf6] bg-[#8b5cf6]/5' : 'border-slate-700 hover:border-slate-500'} ${isLoadingPdf ? 'opacity-70 pointer-events-none' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDraggingPdf(true)
          }}
          onDragLeave={() => setIsDraggingPdf(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDraggingPdf(false)
            const file = e.dataTransfer.files?.[0]
            if (file) processPdfFile(file)
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center mb-6 shadow-sm">
            {isLoadingPdf ? (
              <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            ) : (
              <FileText className="w-8 h-8 text-[#8b5cf6]" />
            )}
          </div>

          <h3 className="text-xl font-semibold text-white mb-2 text-center">
            {isLoadingPdf ? 'Importando fatura...' : 'Arraste arquivo OFX ou PDF aqui'}
          </h3>
          {!isLoadingPdf && (
            <p className="text-slate-400 text-sm mb-8 text-center px-4">
              Faturas de cartão de crédito (.pdf)
            </p>
          )}

          <input
            type="file"
            accept=".pdf,.ofx"
            className="hidden"
            ref={pdfInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) processPdfFile(file)
            }}
            disabled={isLoadingPdf}
          />

          {!isLoadingPdf && (
            <Button
              className="bg-[#8b5cf6] hover:bg-[#8b5cf6]/90 text-white rounded-lg px-8 h-12 font-medium"
              onClick={() => pdfInputRef.current?.click()}
            >
              Selecionar Fatura
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#161925] border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Multi-formato</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Suporte para arquivos OFX e faturas em PDF
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161925] border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Inteligente</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Categorização automática e extração de dados
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161925] border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Deduplicação</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conciliação inteligente previne registros duplicados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

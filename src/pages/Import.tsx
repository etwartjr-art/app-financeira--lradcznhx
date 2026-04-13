import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, CheckCircle2, AlertCircle, Loader2, FileCode } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { parseOFXFile } from '@/services/ofx-parser'
import { deduplicateTransactions } from '@/services/deduplication'
import { create as createTransaction, getAll as getAllTransactions } from '@/services/transactions'
import { deduplicatePDFTransactions } from '@/services/deduplication-pdf'
import { mapEstablishmentToCategory } from '@/services/category-mapper'
import { getAll as getCards, update as updateCard } from '@/services/cards'
import { FileUploadArea } from '@/components/FileUploadArea'
import { ParsedInvoiceData } from '@/services/universal-parser'

export default function Import() {
  const navigate = useNavigate()
  const ofxInputRef = useRef<HTMLInputElement>(null)
  const [isDraggingOfx, setIsDraggingOfx] = useState(false)
  const [isLoadingOfx, setIsLoadingOfx] = useState(false)

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

  const handleInvoiceSuccess = async (parsedData: ParsedInvoiceData) => {
    try {
      const cards = await getCards()
      const matchedCard = cards.find((c) => c.last4 === parsedData.cardInfo?.cardNumber)

      if (!matchedCard) {
        toast({
          title: 'Cartão não encontrado.',
          description: `Crie um cartão com os 4 últimos dígitos ${parsedData.cardInfo?.cardNumber || 'XXXX'} primeiro.`,
          variant: 'destructive',
        })
        return
      }

      await updateCard(matchedCard.id, {
        limit: parsedData.creditLimits?.totalLimit || matchedCard.limit,
        availableLimit: parsedData.creditLimits?.availableLimit,
        usedLimit: parsedData.creditLimits?.totalLimit
          ? parsedData.creditLimits.totalLimit - (parsedData.creditLimits.availableLimit || 0)
          : undefined,
        dueDate: parsedData.statementPeriod?.endDate || matchedCard.dueDate,
        nextClosingDate: parsedData.statementPeriod?.startDate,
      })

      const existingTransactions = await getAllTransactions()

      const mappedTransactions = (parsedData.transactions || []).map((t) => ({
        date: t.date,
        establishment: t.description || t.establishment || '',
        amount: t.amount,
        installment: t.installment || '',
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
          tags: 'importado-fatura',
          cardId: matchedCard.id,
        })
        importedCount++
      }

      toast({
        title: 'Fatura importada com sucesso!',
        className: 'bg-emerald-600 text-white border-none',
      })

      if (duplicateCount > 0) {
        toast({
          title: `${duplicateCount} transações duplicadas ignoradas`,
        })
      }

      navigate('/dashboard')
    } catch (error: any) {
      toast({
        title: 'Erro ao importar fatura',
        description: error.message || 'Ocorreu um erro inesperado ao salvar os dados.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Importar Fatura</h1>
        <p className="text-slate-400">
          Selecione um PDF ou imagem da sua fatura de cartao de credito
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* OFX Zone */}
        <div
          className={`w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all min-h-[320px] bg-[#161925] ${isDraggingOfx ? 'border-[#0f766e] bg-[#0f766e]/5' : 'border-slate-700 hover:border-slate-500'} ${isLoadingOfx ? 'opacity-70 pointer-events-none' : ''}`}
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

        {/* Universal Invoice Upload Area */}
        <FileUploadArea onSuccess={handleInvoiceSuccess} />
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
                Suporte para arquivos OFX, PDFs e Imagens
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
                Extração automática via OCR e categorização
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

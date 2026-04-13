import React, { useState, useRef, useCallback } from 'react'
import { FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { UniversalParserService, ParsedInvoiceData } from '@/services/universal-parser'

type State = 'IDLE' | 'LOADING' | 'ERROR' | 'SUCCESS'

interface FileUploadAreaProps {
  onSuccess: (data: ParsedInvoiceData, file: File) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

export function FileUploadArea({ onSuccess }: FileUploadAreaProps) {
  const [state, setState] = useState<State>('IDLE')
  const [isDragging, setIsDragging] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [parsedData, setParsedData] = useState<ParsedInvoiceData | null>(null)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    const isValidExt = ['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext || '')
    const isValidType = ALLOWED_TYPES.includes(file.type) || file.type === ''

    if (!isValidExt || !isValidType) {
      setState('ERROR')
      setErrorMsg('Formato inválido. Apenas PDF, JPG, PNG ou WEBP.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setState('ERROR')
      setErrorMsg('Arquivo muito grande. O tamanho máximo é 5MB.')
      return
    }

    if (!currentUser?.id) {
      setState('ERROR')
      setErrorMsg('Usuário não autenticado.')
      return
    }

    setState('LOADING')

    try {
      const parser = new UniversalParserService()
      const data = await parser.parseFile(file)

      const transactionService = new TransactionService()
      await transactionService.createTransactionsFromParsedStatement(data, currentUser.id)

      toast({
        title: 'Sucesso',
        description: 'Transações importadas com sucesso! Categorias atribuídas automaticamente.',
      })

      if (onSuccess) {
        onSuccess(data, file)
      }

      navigate('/transactions')
    } catch (err: unknown) {
      setState('ERROR')
      const msg = err instanceof Error ? err.message : 'Erro ao processar arquivo'
      setErrorMsg(msg)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: msg,
      })
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (state === 'LOADING') return
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [state],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <section
      aria-label="Área de upload de fatura"
      className={cn(
        'w-full max-w-2xl mx-auto rounded-2xl border-2 border-dashed p-4 md:p-8 transition-all flex flex-col items-center justify-center text-center min-h-[320px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        state === 'IDLE' && isDragging ? 'border-[#8b5cf6] bg-[#8b5cf6]/10' : '',
        state === 'IDLE' && !isDragging
          ? 'border-[#8b5cf6]/50 bg-[#8b5cf6]/5 hover:border-[#8b5cf6]'
          : '',
        state === 'LOADING' ? 'border-slate-700 bg-[#161925] opacity-80 pointer-events-none' : '',
        state === 'ERROR' ? 'border-red-500/50 bg-red-500/5' : '',
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      tabIndex={0}
    >
      {state === 'IDLE' && (
        <div className="flex flex-col items-center animate-fade-in w-full">
          <div className="w-16 h-16 rounded-2xl bg-[#8b5cf6]/20 flex items-center justify-center mb-6 shadow-sm">
            <FileText className="w-8 h-8 text-[#8b5cf6]" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Arraste arquivo OFX ou PDF aqui</h3>
          <p className="text-slate-400 text-sm mb-8 px-4">
            Faturas de cartão de crédito (.pdf ou imagem)
          </p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            aria-label="Upload de arquivo"
          />
          <Button
            className="bg-[#8b5cf6] hover:bg-[#8b5cf6]/90 text-white rounded-lg px-8 h-12 font-medium"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Selecionar Arquivo"
          >
            Selecionar Arquivo
          </Button>
        </div>
      )}

      {state === 'LOADING' && (
        <div className="flex flex-col items-center animate-fade-in w-full">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 shadow-sm">
            <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Processando arquivo...</h3>
          <p className="text-slate-400 text-sm">Aguarde enquanto extraimos os dados</p>
        </div>
      )}

      {state === 'ERROR' && (
        <div className="flex flex-col items-center animate-fade-in w-full">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mb-6 shadow-sm">
            <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Erro ao processar arquivo</h3>
          <p className="text-red-400 text-sm mb-8 px-4">{errorMsg}</p>
          <Button
            variant="outline"
            className="border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-lg px-8 h-12 font-medium"
            onClick={() => setState('IDLE')}
            aria-label="Tentar novamente"
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </section>
  )
}

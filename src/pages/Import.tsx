import { useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { parseOFXFile } from '@/services/ofx-parser'
import { deduplicateTransactions } from '@/services/deduplication'
import { create, getAll } from '@/services/transactions'

export default function Import() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.ofx')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione apenas arquivos .ofx',
        variant: 'destructive',
      })
      return
    }

    if (file.size === 0) {
      toast({
        title: 'Arquivo vazio',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const text = await file.text()
      if (!text.trim()) {
        toast({ title: 'Arquivo vazio', variant: 'destructive' })
        setIsLoading(false)
        return
      }

      const parsedTransactions = parseOFXFile(text)
      const existingTransactions = await getAll()

      const { newTransactions, duplicateCount } = deduplicateTransactions(
        parsedTransactions,
        existingTransactions,
      )

      const shouldThrottle = newTransactions.length > 50
      let importedCount = 0
      let rateLimited = false

      for (const t of newTransactions) {
        try {
          await create({
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
        } catch (err: any) {
          if (err?.status === 429 || err?.response?.code === 429) {
            rateLimited = true
            break
          }
          throw err
        }
      }

      if (importedCount > 0) {
        toast({
          title: `${importedCount} transações importadas com sucesso`,
          className: 'bg-emerald-600 text-white border-none',
        })
      }

      if (duplicateCount > 0) {
        toast({
          title: `${duplicateCount} transações duplicadas ignoradas`,
        })
      }

      if (rateLimited) {
        toast({
          title: 'Muitas requisições',
          description:
            'Muitas requisições em curto tempo. Por favor, aguarde um momento e tente novamente.',
          variant: 'destructive',
          action: (
            <ToastAction altText="Tentar novamente" onClick={() => fileInputRef.current?.click()}>
              Tentar novamente
            </ToastAction>
          ),
        })
      }
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.response?.code === 429
      if (isRateLimit) {
        toast({
          title: 'Muitas requisições',
          description:
            'Muitas requisições em curto tempo. Por favor, aguarde um momento e tente novamente.',
          variant: 'destructive',
          action: (
            <ToastAction altText="Tentar novamente" onClick={() => fileInputRef.current?.click()}>
              Tentar novamente
            </ToastAction>
          ),
        })
      } else {
        toast({
          title: 'Erro ao ler arquivo OFX',
          description:
            error.message === 'Arquivo OFX invalido'
              ? error.message
              : 'Ocorreu um erro inesperado.',
          variant: 'destructive',
          action: (
            <ToastAction altText="Tentar novamente" onClick={() => fileInputRef.current?.click()}>
              Tentar novamente
            </ToastAction>
          ),
        })
      }
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Importar Extrato</h1>
        <p className="text-slate-400">Importe arquivos OFX do seu banco</p>
      </div>

      <div
        className={`w-full h-80 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all bg-[#161925] ${isDragging ? 'border-[#0f766e] bg-[#0f766e]/5' : 'border-slate-700 hover:border-slate-500'} ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#0f766e]/10 flex items-center justify-center mb-6 shadow-sm">
          {isLoading ? (
            <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-[#0f766e]" />
          )}
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">
          {isLoading
            ? 'Importando transacoes...'
            : 'Arraste arquivo OFX aqui ou clique para selecionar'}
        </h3>
        {!isLoading && (
          <p className="text-slate-400 text-sm mb-8">Apenas arquivos .ofx são suportados</p>
        )}

        <input
          type="file"
          accept=".ofx"
          className="hidden"
          ref={fileInputRef}
          onChange={onFileChange}
          disabled={isLoading}
        />

        {!isLoading && (
          <Button
            className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-lg px-8 h-12 font-medium"
            onClick={() => fileInputRef.current?.click()}
          >
            Selecionar Arquivo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#161925] border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Upload</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Envie seu arquivo .ofx exportado do internet banking
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161925] border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Processamento</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Categorização automática via regras e histórico
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161925] border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Conciliação</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deduplicação e importação inteligente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

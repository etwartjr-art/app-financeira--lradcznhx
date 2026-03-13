import { useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useFinance } from '@/stores/FinanceContext'

export default function Import() {
  const { addTransaction } = useFinance()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.ofx')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione apenas arquivos .ofx',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: `Arquivo ${file.name} processado!`,
      description: 'Transações preparadas para conciliação.',
    })

    // Mock processing delay and add a transaction
    setTimeout(() => {
      addTransaction({
        amount: 120.5,
        description: 'Compra Via OFX Importado',
        type: 'expense',
        date: new Date().toISOString(),
        origin: 'Extrato Bancário',
        category: 'Outros',
        isPending: true,
      })
      toast({ title: '1 transação encontrada e importada.' })
    }, 1500)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
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
    if (file) handleFileUpload(file)
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Importar Extrato</h1>
        <p className="text-slate-400">Importe arquivos OFX do seu banco</p>
      </div>

      <div
        className={`w-full h-80 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all bg-[#161925] ${isDragging ? 'border-[#0f766e] bg-[#0f766e]/5' : 'border-slate-700 hover:border-slate-500'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#0f766e]/10 flex items-center justify-center mb-6 shadow-sm">
          <Upload className="w-8 h-8 text-[#0f766e]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Arraste seu arquivo OFX aqui</h3>
        <p className="text-slate-400 text-sm mb-8">ou clique para selecionar</p>

        <input
          type="file"
          accept=".ofx"
          className="hidden"
          ref={fileInputRef}
          onChange={onFileChange}
        />
        <Button
          className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-lg px-8 h-12 font-medium"
          onClick={() => fileInputRef.current?.click()}
        >
          Selecionar Arquivo
        </Button>
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
                Revise transações duvidosas e aprove manualmente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, Upload } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Conciliation() {
  const [pending, setPending] = useState([
    { id: 1, desc: 'Pagamento Boleto', date: '12 de Maio, 2024', amount: 250.0 },
    { id: 2, desc: 'Assinatura Software', date: '14 de Maio, 2024', amount: 49.9 },
    { id: 3, desc: 'Transferência Recebida', date: '15 de Maio, 2024', amount: -1500.0 },
  ])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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

      // Add a mock transaction from the OFX
      setPending((prev) => [
        { id: Math.random(), desc: 'Compra Via OFX', date: 'Hoje', amount: 120.5 },
        ...prev,
      ])

      e.target.value = '' // Reset input
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conciliação Bancária</h1>
          <p className="text-muted-foreground">Sincronize suas contas ou importe arquivos OFX.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <label className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Incluir Arquivo OFX
              <input type="file" accept=".ofx" className="hidden" onChange={handleFileUpload} />
            </label>
          </Button>
          <Button variant="default">Sincronizar Agora</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações Pendentes</CardTitle>
          <CardDescription>
            Você tem {pending.length} transações aguardando verificação no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pending.map((t) => (
              <div
                key={t.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{t.desc}</p>
                    <p className="text-sm text-muted-foreground">{t.date}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <span
                    className={`font-medium ${t.amount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}
                  >
                    {t.amount > 0 ? '- ' : '+ '}R$ {Math.abs(t.amount).toFixed(2).replace('.', ',')}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => {
                      setPending(pending.filter((p) => p.id !== t.id))
                      toast({ title: 'Transação conciliada com sucesso!' })
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Conciliar
                  </Button>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhuma transação pendente.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

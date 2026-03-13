import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function Conciliation() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conciliação Bancária</h1>
          <p className="text-muted-foreground">
            Sincronize suas contas com o APP FINANÇAS PESSOAL ETW.
          </p>
        </div>
        <Button variant="outline">Sincronizar Agora</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações Pendentes</CardTitle>
          <CardDescription>
            Você tem 3 transações aguardando verificação no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Pagamento Boleto</p>
                    <p className="text-sm text-muted-foreground">12 de Maio, 2024</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <span className="font-medium text-rose-500">- R$ 250,00</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Conciliar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

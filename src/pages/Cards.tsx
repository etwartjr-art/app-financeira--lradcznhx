import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function Cards() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visão de Cartões</h1>
          <p className="text-muted-foreground">
            Gerencie seus cartões no APP FINANÇAS PESSOAL ETW.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Cartão
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg opacity-80">Cartão Black</CardTitle>
            <CardDescription className="text-zinc-400">APP FINANÇAS PESSOAL ETW</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl tracking-widest mt-4">**** **** **** 1234</div>
            <div className="flex justify-between text-sm opacity-80 pt-4">
              <span>João Silva</span>
              <span>12/28</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-700 to-blue-500 text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg opacity-80">Cartão Platinum</CardTitle>
            <CardDescription className="text-blue-100">APP FINANÇAS PESSOAL ETW</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl tracking-widest mt-4">**** **** **** 5678</div>
            <div className="flex justify-between text-sm opacity-80 pt-4">
              <span>João Silva</span>
              <span>08/26</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed flex flex-col items-center justify-center min-h-[220px] text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer hover:bg-muted/50">
          <Plus className="h-8 w-8 mb-2" />
          <span className="font-medium">Novo Cartão</span>
        </Card>
      </div>
    </div>
  )
}

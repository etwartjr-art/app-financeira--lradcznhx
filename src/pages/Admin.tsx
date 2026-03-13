import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Admin() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel Admin</h1>
        <p className="text-muted-foreground">Configurações do sistema APP FINANÇAS PESSOAL ETW.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Gerencie as preferências globais do aplicativo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Aplicativo</Label>
              <Input defaultValue="APP FINANÇAS PESSOAL ETW" disabled />
            </div>
            <div className="space-y-2">
              <Label>E-mail de Suporte</Label>
              <Input defaultValue="suporte@financasetw.com.br" />
            </div>
            <Button className="w-full sm:w-auto">Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>Controle de acessos e permissões da equipe.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <p className="font-medium">João Silva (Admin)</p>
                  <p className="text-sm text-muted-foreground">joao@financasetw.com.br</p>
                </div>
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </div>
              <Button className="w-full" variant="secondary">
                Adicionar Novo Usuário
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

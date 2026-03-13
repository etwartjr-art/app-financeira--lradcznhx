import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, Settings, TrendingUp } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, CartesianGrid } from 'recharts'

export default function Admin() {
  const chartData = [
    { month: 'Jan', mrr: 15000 },
    { month: 'Fev', mrr: 18500 },
    { month: 'Mar', mrr: 24000 },
    { month: 'Abr', mrr: 22000 },
    { month: 'Mai', mrr: 28000 },
    { month: 'Jun', mrr: 35000 },
  ]

  const users = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', plan: 'Anual', status: 'Ativo' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', plan: 'Mensal', status: 'Inativo' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', plan: 'Anual', status: 'Ativo' },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar>
          <SidebarContent>
            <div className="p-6 pb-2">
              <h1 className="font-bold text-xl text-primary flex items-center gap-2">
                <TrendingUp /> Admin
              </h1>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <LayoutDashboard /> Dashboard
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Users /> Usuários
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings /> Configurações
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Visão Executiva</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">MRR Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">R$ 35.000</p>
                  <p className="text-xs text-success mt-1">+12% vs mês passado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">CAC Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">R$ 150</p>
                  <p className="text-xs text-destructive mt-1">+5% vs mês passado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">2.4%</p>
                  <p className="text-xs text-success mt-1">-0.5% vs mês passado</p>
                </CardContent>
              </Card>
            </div>

            <Card className="pt-6">
              <CardContent>
                <h3 className="text-lg font-semibold mb-6">Crescimento de Receita (MRR)</h3>
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={{ mrr: { label: 'MRR', color: 'hsl(var(--primary))' } }}
                    className="h-full w-full"
                  >
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="mrr"
                        stroke="var(--color-mrr)"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestão de Assinantes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </TableCell>
                        <TableCell>{u.plan}</TableCell>
                        <TableCell>
                          <Badge
                            variant={u.status === 'Ativo' ? 'default' : 'destructive'}
                            className={u.status === 'Ativo' ? 'bg-success hover:bg-success' : ''}
                          >
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm">
                            Bônus
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            Bloquear
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

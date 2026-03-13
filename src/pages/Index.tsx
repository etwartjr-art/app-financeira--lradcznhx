import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import logoImg from '@/assets/financas-pessoal-etw-5d9f2.png'

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-white p-4 shadow-lg ring-1 ring-black/5">
            <img
              src={logoImg}
              alt="Logo APP FINANÇAS PESSOAL ETW"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            APP FINANÇAS PESSOAL ETW
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua mentoria financeira inteligente e intuitiva.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesse sua conta</CardTitle>
            <CardDescription>Insira seus dados para gerenciar suas finanças.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link to="#" className="text-xs font-medium text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input id="password" type="password" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" size="lg" asChild>
              <Link to="/dashboard">Entrar</Link>
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link to="#" className="font-semibold text-primary hover:underline">
                Cadastre-se
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

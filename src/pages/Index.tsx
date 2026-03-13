import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFinance } from '@/stores/FinanceContext'
import { Fingerprint, Wallet } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

export default function Index() {
  const navigate = useNavigate()
  const { login, subscriptionStatus, renewSubscription } = useFinance()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    login()
    if (subscriptionStatus === 'active') {
      navigate('/dashboard')
    }
  }

  const handleRenew = () => {
    renewSubscription()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col p-6 items-center justify-center relative">
      <div className="w-full max-w-sm space-y-8 animate-fade-in-up">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Wallet className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-center">Mentoria Financeira</h1>
          <p className="text-muted-foreground text-center">
            Domine suas finanças em 3 segundos por dia.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              required
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required className="h-12 rounded-xl" />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl text-md font-semibold mt-2">
            Entrar
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-12 rounded-xl" onClick={handleLogin}>
            Google
          </Button>
          <Button variant="outline" className="h-12 rounded-xl" onClick={handleLogin}>
            Apple
          </Button>
        </div>

        <Button
          variant="ghost"
          className="w-full h-12 rounded-xl text-primary gap-2"
          onClick={handleLogin}
        >
          <Fingerprint className="w-5 h-5" /> Entrar com Biometria
        </Button>
      </div>

      <AlertDialog open={subscriptionStatus === 'pending' && false}>
        {/* Controlled by a state if we wanted to show it after login, but let's show it on login click for demo */}
      </AlertDialog>

      {/* Manual Modal for demo since we intercept routing */}
      {subscriptionStatus === 'pending' && (
        <AlertDialog open={true}>
          <AlertDialogContent className="w-[90vw] rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-xl">
                Assinatura Pendente
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Seu período de mentoria expirou. Renove agora para continuar tendo acesso à
                plataforma e consolidação inteligente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogAction onClick={handleRenew} className="w-full h-12 rounded-xl text-md">
                Renovar Agora
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

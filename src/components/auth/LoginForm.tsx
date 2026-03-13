import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFinance } from '@/stores/FinanceContext'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { GoogleIcon } from '@/components/icons/GoogleIcon'

export default function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { login, users } = useFinance()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      return toast({ title: 'Preencha todos os campos', variant: 'destructive' })
    }

    const user = (users || []).find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    )

    if (user) {
      toast({ title: `Bem-vindo(a), ${user.name}!`, description: 'Login realizado com sucesso.' })
      login(user)
    } else {
      const userExists = (users || []).some(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      )
      if (userExists) {
        toast({
          title: 'Credenciais inválidas',
          description: 'Senha incorreta.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Usuário não encontrado',
          description: 'Verifique o e-mail digitado.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleGoogleLoginInit = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      const mockedOAuthEmail = email.trim() || 'Etwartjr@gmail.com'
      const foundUser = (users || []).find(
        (u) => u.email.toLowerCase() === mockedOAuthEmail.toLowerCase(),
      )

      if (foundUser) {
        toast({
          title: `Bem-vindo(a), ${foundUser.name}!`,
          description: 'Acesso via Google concluído.',
        })
        login(foundUser)
      } else {
        toast({
          title: 'Conta não encontrada',
          description: 'Nenhum usuário registrado com este e-mail do Google.',
          variant: 'destructive',
        })
      }
    }, 1500)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={handleGoogleLoginInit}
        className="w-full h-12 bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-70"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin text-emerald-500" />
        ) : (
          <GoogleIcon className="mr-2 h-5 w-5" />
        )}
        {isLoading ? 'Autenticando...' : 'Entrar com Google'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#161925] px-2 text-slate-500">Acesso Manual</span>
        </div>
      </div>

      <form onSubmit={handleManualLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 bg-[#0b0e14] border-slate-800 placeholder:text-slate-600 focus-visible:ring-emerald-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 bg-[#0b0e14] border-slate-800 focus-visible:ring-emerald-500 text-2xl tracking-widest font-mono"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white font-medium text-base rounded-xl mt-2"
        >
          Entrar
        </Button>
      </form>
      <div className="text-center pt-2">
        <p className="text-sm text-slate-400">
          Ainda não tem conta?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-emerald-500 hover:text-emerald-400 font-medium hover:underline"
          >
            Cadastrar-se
          </button>
        </p>
      </div>
    </div>
  )
}

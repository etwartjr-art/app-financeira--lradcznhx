import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { GoogleIcon } from '@/components/icons/GoogleIcon'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { signIn, signInWithGoogle } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      return toast({ title: 'Preencha todos os campos', variant: 'destructive' })
    }

    setIsLoading(true)
    const { error } = await signIn(email, password)
    setIsLoading(false)

    if (!error) {
      toast({ title: `Login realizado com sucesso.` })
    } else {
      toast({
        title: 'Credenciais inválidas',
        description: 'Verifique o e-mail e senha informados.',
        variant: 'destructive',
      })
    }
  }

  const handleGoogleLoginInit = async () => {
    setIsLoading(true)
    const { error } = await signInWithGoogle()

    if (!error) {
      toast({ title: 'Login realizado com sucesso.' })
    } else {
      setIsLoading(false)
      toast({
        title: 'Erro ao entrar com Google',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    }
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
        <span>{isLoading ? 'Autenticando...' : 'Entrar com Google'}</span>
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
          <span>Entrar</span>
        </Button>
      </form>
      <div className="text-center pt-2">
        <p className="text-sm text-slate-400">
          <span>Ainda não tem conta?</span>{' '}
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

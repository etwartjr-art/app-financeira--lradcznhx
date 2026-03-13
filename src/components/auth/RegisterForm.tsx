import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFinance } from '@/stores/FinanceContext'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { GoogleIcon } from '@/components/icons/GoogleIcon'

export default function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { users, addUser, login } = useFinance()
  const [isLoading, setIsLoading] = useState(false)

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    const { name, email, password, confirm } = form

    if (!name || !email || !password || !confirm) {
      return toast({ title: 'Preencha todos os campos', variant: 'destructive' })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast({ title: 'E-mail inválido', variant: 'destructive' })
    }

    if (password.length < 6) {
      return toast({ title: 'Senha deve ter no mínimo 6 caracteres', variant: 'destructive' })
    }

    if (password !== confirm) {
      return toast({ title: 'As senhas não coincidem', variant: 'destructive' })
    }

    if ((users || []).some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return toast({
        title: 'E-mail já cadastrado',
        description: 'Faça login na sua conta.',
        variant: 'destructive',
      })
    }

    const createdUser = addUser({
      name,
      email,
      password,
      role: 'User',
      situation: 'Ativo',
      createdAt: new Date().toISOString(),
    })

    toast({ title: 'Cadastro realizado com sucesso!', description: 'Bem-vindo(a) ao sistema.' })
    login(createdUser)
  }

  const handleGoogleRegister = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      const mockEmail = form.email.trim() || 'novo_usuario@gmail.com'

      if ((users || []).some((u) => u.email.toLowerCase() === mockEmail.toLowerCase())) {
        toast({
          title: 'Conta já existente',
          description: 'Este e-mail já está cadastrado. Por favor, faça login.',
          variant: 'destructive',
        })
      } else {
        const createdUser = addUser({
          name: mockEmail.split('@')[0],
          email: mockEmail,
          password: 'google_oauth_dummy',
          role: 'User',
          situation: 'Ativo',
          createdAt: new Date().toISOString(),
        })
        toast({ title: 'Sucesso!', description: 'Sua conta foi criada via Google.' })
        login(createdUser)
      }
    }, 1500)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={handleGoogleRegister}
        className="w-full h-12 bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-70"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin text-emerald-500" />
        ) : (
          <GoogleIcon className="mr-2 h-5 w-5" />
        )}
        {isLoading ? 'Conectando...' : 'Cadastrar com Google'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#161925] px-2 text-slate-500">Ou use seu e-mail</span>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reg-name" className="text-slate-300">
            Nome Completo
          </Label>
          <Input
            id="reg-name"
            placeholder="Seu nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-10 bg-[#0b0e14] border-slate-800 focus-visible:ring-emerald-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-email" className="text-slate-300">
            E-mail
          </Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="h-10 bg-[#0b0e14] border-slate-800 focus-visible:ring-emerald-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reg-pass" className="text-slate-300">
              Senha
            </Label>
            <Input
              id="reg-pass"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="h-10 bg-[#0b0e14] border-slate-800 focus-visible:ring-emerald-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-confirm" className="text-slate-300">
              Confirmar
            </Label>
            <Input
              id="reg-confirm"
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="h-10 bg-[#0b0e14] border-slate-800 focus-visible:ring-emerald-500"
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base rounded-xl mt-4"
        >
          Criar Conta
        </Button>
      </form>

      <div className="text-center pt-2">
        <p className="text-sm text-slate-400">
          Já possui conta?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-emerald-500 hover:text-emerald-400 font-medium hover:underline"
          >
            Voltar para Login
          </button>
        </p>
      </div>
    </div>
  )
}

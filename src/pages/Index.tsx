import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import logoImg from '@/assets/financas-pessoal-etw-5d9f2.png'
import { useFinance } from '@/stores/FinanceContext'
import { toast } from '@/hooks/use-toast'

export default function Index() {
  const { login } = useFinance()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    login()
    toast({ title: 'Acesso validado com sucesso!', description: 'Bem-vindo ao dashboard.' })
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0e14] text-slate-50 p-4">
      <div className="w-full max-w-[400px] space-y-8 animate-fade-in-up">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-white p-2 shadow-lg">
            <img src={logoImg} alt="Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-white">
            Finanças Pessoal ETW
          </h1>
          <p className="mt-2 text-sm text-slate-400">Entre na sua conta</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-slate-800 bg-[#161925] p-6 shadow-xl space-y-6"
        >
          <Button
            type="button"
            variant="outline"
            onClick={handleLogin}
            className="w-full h-12 bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5" aria-hidden="true">
              <path
                d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                fill="#EA4335"
              />
              <path
                d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                fill="#4285F4"
              />
              <path
                d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                fill="#FBBC05"
              />
              <path
                d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                fill="#34A853"
              />
            </svg>
            Entrar com Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#161925] px-2 text-slate-500">ou</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="h-12 bg-[#0b0e14] border-slate-800 placeholder:text-slate-600 focus-visible:ring-emerald-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                defaultValue="12345678"
                className="h-12 bg-[#0b0e14] border-slate-800 focus-visible:ring-emerald-500 text-2xl tracking-widest font-mono"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-base rounded-xl"
          >
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}

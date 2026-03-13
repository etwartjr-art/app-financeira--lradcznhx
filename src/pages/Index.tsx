import { useState } from 'react'
import logoImg from '@/assets/financas-pessoal-etw-5d9f2.png'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'

export default function Index() {
  const [view, setView] = useState<'login' | 'register'>('login')

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
          <p className="mt-2 text-sm text-slate-400">Controle e mentoria financeira</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#161925] p-6 shadow-xl relative overflow-hidden">
          {view === 'login' ? (
            <LoginForm onSwitchToRegister={() => setView('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setView('login')} />
          )}
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import logoImg from '@/assets/financas-pessoal-etw-5d9f2.png'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center p-4">
      <img
        src={logoImg}
        alt="APP FINANÇAS PESSOAL ETW"
        className="mb-8 h-24 w-24 object-contain opacity-50"
      />
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Página não encontrada</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Desculpe, a página que você está procurando não existe ou foi movida. Continue sua jornada
        no APP FINANÇAS PESSOAL ETW.
      </p>
      <Button asChild>
        <Link to="/dashboard">Voltar para o Início</Link>
      </Button>
    </div>
  )
}

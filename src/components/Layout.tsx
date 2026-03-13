import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CreditCard,
  ArrowRightLeft,
  Users,
  LogOut,
  Menu,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import logoImg from '@/assets/financas-pessoal-etw-5d9f2.png'
import { useFinance } from '@/stores/FinanceContext'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: ArrowRightLeft },
  { href: '/cards', label: 'Cartões', icon: CreditCard },
  { href: '/import', label: 'Importar', icon: Upload },
]

const ADMIN_ITEMS = [{ href: '/users', label: 'Usuários', icon: Users }]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useFinance()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const NavLinks = ({ items }: { items: typeof NAV_ITEMS }) => (
    <>
      {items.map((item) => {
        const isActive = location.pathname === item.href
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0b0e14] md:flex-row text-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-800 bg-[#0b0e14] md:flex">
        <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
          <img
            src={logoImg}
            alt="APP FINANÇAS PESSOAL ETW"
            className="h-8 w-8 object-contain rounded-md bg-white p-1"
          />
          <span className="font-bold text-sm tracking-tight leading-tight">
            Finanças Pessoal ETW
            <span className="block text-[10px] font-normal text-muted-foreground">
              Controle financeiro
            </span>
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <NavLinks items={NAV_ITEMS} />

          <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Admin
          </div>
          <NavLinks items={ADMIN_ITEMS} />
        </nav>
        <div className="border-t border-slate-800 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-400 hover:text-slate-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-[#0b0e14] px-4 md:hidden">
        <div className="flex items-center gap-2">
          <img
            src={logoImg}
            alt="Logo"
            className="h-8 w-8 object-contain bg-white rounded-md p-1"
          />
          <span className="font-bold text-xs leading-tight sm:text-sm">Finanças Pessoal ETW</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex flex-col bg-[#0b0e14] border-r border-slate-800 p-0 text-slate-50"
          >
            <SheetHeader className="border-b border-slate-800 p-6 text-left">
              <div className="flex items-center gap-3">
                <img
                  src={logoImg}
                  alt="Logo"
                  className="h-10 w-10 object-contain bg-white rounded-md p-1"
                />
                <SheetTitle className="text-sm font-bold leading-tight text-slate-50">
                  Finanças Pessoal ETW
                </SheetTitle>
              </div>
            </SheetHeader>
            <nav className="flex-1 space-y-2 p-4">
              <NavLinks items={NAV_ITEMS} />
              <div className="mt-6 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Admin
              </div>
              <NavLinks items={ADMIN_ITEMS} />
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 pb-16 md:pb-0 relative bg-[#0b0e14]">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 z-30 flex h-16 w-full border-t border-slate-800 bg-[#0b0e14] md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.5)] overflow-x-auto no-scrollbar">
        {[...NAV_ITEMS, ...ADMIN_ITEMS].map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[72px] px-2 gap-1 text-[10px] font-medium transition-colors flex-1',
                isActive ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-50',
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-emerald-500')} />
              <span className="truncate w-full text-center">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

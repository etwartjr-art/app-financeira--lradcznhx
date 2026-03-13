import { Outlet, useLocation, Link } from 'react-router-dom'
import { LayoutDashboard, CreditCard, GitCompareArrows, User, Plus } from 'lucide-react'
import { useFinance } from '@/stores/FinanceContext'
import { MagicEntryDrawer } from './MagicEntryDrawer'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()
  const { setMagicDrawerOpen } = useFinance()

  const isAppRoute = ['/dashboard', '/cartoes', '/conciliacao', '/perfil'].includes(
    location.pathname,
  )
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
    return <Outlet />
  }

  return (
    <div className="bg-slate-900 min-h-screen flex justify-center">
      <main className="w-full max-w-md bg-background min-h-screen relative flex flex-col shadow-2xl overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          <Outlet />
        </div>

        {isAppRoute && (
          <>
            <button
              onClick={() => setMagicDrawerOpen(true)}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(99,102,241,0.5)] z-50 hover:scale-105 transition-transform active:scale-95"
            >
              <Plus size={28} />
            </button>

            <nav className="absolute bottom-0 w-full h-20 bg-background/80 backdrop-blur-lg border-t flex items-center justify-between px-6 z-40 pb-safe">
              <NavItem
                to="/dashboard"
                icon={LayoutDashboard}
                label="Resumo"
                active={location.pathname === '/dashboard'}
              />
              <NavItem
                to="/cartoes"
                icon={CreditCard}
                label="Cartões"
                active={location.pathname === '/cartoes'}
              />
              <div className="w-12" /> {/* Spacer for FAB */}
              <NavItem
                to="/conciliacao"
                icon={GitCompareArrows}
                label="Conciliação"
                active={location.pathname === '/conciliacao'}
              />
              <NavItem
                to="/dashboard"
                icon={User}
                label="Perfil"
                active={location.pathname === '/perfil'}
              />
            </nav>

            <MagicEntryDrawer />
          </>
        )}
      </main>
    </div>
  )
}

function NavItem({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string
  icon: any
  label: string
  active: boolean
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex flex-col items-center justify-center w-16 gap-1 transition-colors',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )
}

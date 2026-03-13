import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, CreditCard, ArrowRightLeft, Settings, LogOut, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import logoImg from '@/assets/financas-pessoal-etw-5d9f2.png'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cards', label: 'Cartões', icon: CreditCard },
  { href: '/conciliation', label: 'Conciliação', icon: ArrowRightLeft },
  { href: '/admin', label: 'Admin', icon: Settings },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20 md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <img src={logoImg} alt="APP FINANÇAS PESSOAL ETW" className="h-8 w-8 object-contain" />
          <span className="font-bold text-sm tracking-tight leading-tight">
            APP FINANÇAS
            <br />
            PESSOAL ETW
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-start gap-3" asChild>
            <Link to="/">
              <LogOut className="h-4 w-4" />
              Sair
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:hidden">
        <div className="flex items-center gap-2">
          <img
            src={logoImg}
            alt="APP FINANÇAS PESSOAL ETW Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="font-bold text-xs leading-tight sm:text-sm">
            APP FINANÇAS
            <br />
            PESSOAL ETW
          </span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <SheetHeader className="border-b pb-4 text-left">
              <div className="flex items-center gap-2">
                <img
                  src={logoImg}
                  alt="APP FINANÇAS PESSOAL ETW Logo"
                  className="h-10 w-10 object-contain"
                />
                <SheetTitle className="text-sm font-bold leading-tight">
                  APP FINANÇAS
                  <br />
                  PESSOAL ETW
                </SheetTitle>
              </div>
            </SheetHeader>
            <nav className="flex-1 space-y-2 py-4">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t pt-4">
              <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                <Link to="/">
                  <LogOut className="h-5 w-5" />
                  Sair
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 z-30 flex h-16 w-full border-t bg-background md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'fill-primary/20')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

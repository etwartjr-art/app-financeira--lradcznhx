import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FinanceProvider } from '@/stores/FinanceContext'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Dashboard from '@/pages/Dashboard'
import Cards from '@/pages/Cards'
import Transactions from '@/pages/Transactions'
import TransactionDetail from '@/pages/TransactionDetail'
import Categories from '@/pages/Categories'
import Import from '@/pages/Import'
import Users from '@/pages/Users'
import AnnualReport from '@/pages/AnnualReport'
import NotFound from '@/pages/NotFound'
import logoImg from '@/assets/financas-pessoal-etw-5d9f2.png'

const BanksPage = React.lazy(() => import('@/pages/BanksPage'))

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, errorMsg: '' }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMsg: error?.message || 'Ocorreu um erro interno.' }
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('App UI Error:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0b0e14] text-slate-50 p-4">
          <img src={logoImg} alt="Logo" className="mb-6 h-16 w-16 object-contain opacity-50" />
          <h2 className="text-xl font-bold text-red-500 mb-2">Ops! Ocorreu um erro.</h2>
          <p className="text-slate-400 text-sm mb-2 text-center max-w-sm">
            Tivemos um problema ao carregar esta tela.
          </p>
          <p className="text-slate-500 text-xs mb-8 text-center max-w-sm bg-slate-800/50 p-3 rounded border border-slate-700 font-mono break-all">
            {this.state.errorMsg}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.location.replace('/dashboard')}
              className="px-6 py-2.5 bg-[#0f766e] hover:bg-[#0f766e]/90 transition-colors rounded-lg text-sm font-medium text-white"
            >
              Recarregar Página
            </button>
            <button
              onClick={() => {
                localStorage.clear()
                window.location.replace('/')
              }}
              className="px-6 py-2.5 bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors rounded-lg text-sm font-medium"
            >
              Limpar Dados e Sair
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const ProtectedLayout = () => {
  const { isLoggedIn, currentUser, loading } = useAuth()

  if (loading) return <div className="min-h-screen bg-[#0b0e14]" />

  if (!isLoggedIn || !currentUser) return <Navigate to="/" replace />
  return <Layout />
}

const AdminLayout = () => {
  const { currentUser, loading } = useAuth()

  if (loading) return <div className="min-h-screen bg-[#0b0e14]" />

  if (currentUser?.role !== 'Admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function AppContent() {
  const { isLoggedIn, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-[#0b0e14]" />
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Index />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
            <Route path="/cards" element={<Cards />} />
            <Route
              path="/bancos"
              element={
                <React.Suspense
                  fallback={
                    <div className="flex h-full w-full items-center justify-center p-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500"></div>
                    </div>
                  }
                >
                  <BanksPage />
                </React.Suspense>
              }
            />
            <Route path="/annual-report" element={<AnnualReport />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/import" element={<Import />} />
            <Route path="/conciliation" element={<Navigate to="/import" replace />} />

            <Route element={<AdminLayout />}>
              <Route path="/users" element={<Users />} />
              <Route path="/admin" element={<Navigate to="/users" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  )
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <FinanceProvider>
          <AppContent />
        </FinanceProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

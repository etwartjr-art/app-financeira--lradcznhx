import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FinanceProvider, useFinance } from '@/stores/FinanceContext'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Dashboard from '@/pages/Dashboard'
import Cards from '@/pages/Cards'
import Transactions from '@/pages/Transactions'
import Categories from '@/pages/Categories'
import Import from '@/pages/Import'
import Users from '@/pages/Users'
import AnnualReport from '@/pages/AnnualReport'
import NotFound from '@/pages/NotFound'
import logoImg from '@/assets/financas-pessoal-etw-5d9f2.png'

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
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
          <p className="text-slate-400 text-sm mb-6 text-center max-w-sm">
            Tivemos um problema ao carregar esta tela. Clique no botão abaixo para recarregar o
            aplicativo.
          </p>
          <button
            onClick={() => window.location.replace('/dashboard')}
            className="px-6 py-2.5 bg-[#0f766e] hover:bg-[#0f766e]/90 transition-colors rounded-lg text-sm font-medium"
          >
            Recarregar Aplicativo
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const ProtectedLayout = () => {
  const { isLoggedIn } = useFinance()
  if (!isLoggedIn) return <Navigate to="/" replace />
  return <Layout />
}

const AdminLayout = () => {
  const { currentUser } = useFinance()
  if (currentUser?.role !== 'Admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function AppContent() {
  const { isLoggedIn } = useFinance()

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
            <Route path="/cards" element={<Cards />} />
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
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </ErrorBoundary>
  )
}

export default App

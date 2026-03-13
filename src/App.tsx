import { useEffect } from 'react'
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
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  )
}

export default App

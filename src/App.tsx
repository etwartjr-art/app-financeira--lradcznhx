import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FinanceProvider } from '@/stores/FinanceContext'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Dashboard from '@/pages/Dashboard'
import Cards from '@/pages/Cards'
import Transactions from '@/pages/Transactions'
import Import from '@/pages/Import'
import Users from '@/pages/Users'
import NotFound from '@/pages/NotFound'

function App() {
  // Force dark mode for this specific layout
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <FinanceProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Index />} />

            {/* Protected Routes inside Layout */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/cards" element={<Cards />} />
              <Route path="/import" element={<Import />} />
              <Route path="/users" element={<Users />} />

              {/* Legacy route redirects to keep links from breaking if saved */}
              <Route path="/conciliation" element={<Navigate to="/import" replace />} />
              <Route path="/admin" element={<Navigate to="/users" replace />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </FinanceProvider>
  )
}

export default App

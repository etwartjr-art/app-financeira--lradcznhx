import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FinanceProvider } from '@/stores/FinanceContext'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Dashboard from '@/pages/Dashboard'
import Cards from '@/pages/Cards'
import Conciliation from '@/pages/Conciliation'
import Admin from '@/pages/Admin'
import NotFound from '@/pages/NotFound'

function App() {
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
              <Route path="/cards" element={<Cards />} />
              <Route path="/conciliation" element={<Conciliation />} />
              <Route path="/admin" element={<Admin />} />
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

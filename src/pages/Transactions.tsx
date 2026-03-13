import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useFinance, type Transaction } from '@/stores/FinanceContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, ArrowDownCircle, ArrowUpCircle, Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, cards } = useFinance()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'expense',
    amount: 0,
    description: '',
    category: '',
    origin: 'PIX',
    date: new Date().toISOString().split('T')[0],
  })

  const ORIGINS = ['PIX', 'Dinheiro', ...cards.map((c) => c.name)]

  const handleSaveTx = () => {
    if (!newTx.description || !newTx.amount || newTx.amount <= 0) {
      return toast({ title: 'Preencha os campos obrigatórios.', variant: 'destructive' })
    }

    const [y, m, d] = (newTx.date as string).split('-')
    const localDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 12, 0, 0)

    addTransaction({
      description: newTx.description,
      amount: Number(newTx.amount),
      type: newTx.type as 'income' | 'expense',
      category: newTx.category || 'Outros',
      origin: newTx.origin || 'PIX',
      date: localDate.toISOString(),
    })
    setIsAddOpen(false)
    setNewTx({
      type: 'expense',
      amount: 0,
      description: '',
      category: '',
      origin: 'PIX',
      date: new Date().toISOString().split('T')[0],
    })
    toast({ title: 'Transação salva com sucesso!' })
  }

  const handleUpdateTx = () => {
    if (!editingTx) return
    const val = Number(editingTx.amount)
    if (isNaN(val) || val <= 0 || !editingTx.description) {
      return toast({ title: 'Preencha os campos obrigatórios.', variant: 'destructive' })
    }
    updateTransaction(editingTx.id, {
      ...editingTx,
      amount: val,
    })
    setEditingTx(null)
    toast({ title: 'Transação atualizada.' })
  }

  const handleDelete = (id: string) => {
    deleteTransaction(id)
    toast({ title: 'Transação excluída.' })
  }

  const openNew = (type: 'income' | 'expense') => {
    setNewTx({ ...newTx, type, amount: 0, description: '' })
    setIsAddOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Transações</h1>
          <p className="text-slate-400">Histórico completo de receitas e despesas</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => openNew('expense')}
          >
            <ArrowDownCircle className="mr-2 h-4 w-4" /> Nova Despesa
          </Button>
          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => openNew('income')}
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" /> Nova Receita
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#161925] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Descrição</TableHead>
              <TableHead className="text-slate-400">Categoria</TableHead>
              <TableHead className="text-slate-400">Método/Cartão</TableHead>
              <TableHead className="text-slate-400">Data</TableHead>
              <TableHead className="text-right text-slate-400">Valor</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Nenhuma transação registrada.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((t) => (
                <TableRow
                  key={t.id}
                  className="border-slate-800 hover:bg-slate-800/50 group transition-colors"
                >
                  <TableCell className="font-medium text-slate-200">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          t.type === 'income'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500',
                        )}
                      >
                        {t.type === 'income' ? (
                          <ArrowUpCircle className="w-4 h-4" />
                        ) : (
                          <ArrowDownCircle className="w-4 h-4" />
                        )}
                      </div>
                      {t.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400">{t.category}</TableCell>
                  <TableCell className="text-slate-400">
                    <span className="bg-slate-800 px-2 py-1 rounded text-xs">{t.origin}</span>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {format(new Date(t.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold',
                      t.type === 'income' ? 'text-emerald-500' : 'text-slate-200',
                    )}
                  >
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white"
                        onClick={() => setEditingTx(t)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-400"
                        onClick={() => handleDelete(t.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Modals share similar structure */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#161925] border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {newTx.type === 'income' ? 'Nova Receita' : 'Nova Despesa'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Descrição</Label>
              <Input
                className="bg-[#0f111a] border-slate-700 focus-visible:ring-emerald-500"
                value={newTx.description}
                onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                placeholder="Ex: Supermercado"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Valor (R$)</Label>
                <Input
                  type="number"
                  className="bg-[#0f111a] border-slate-700 focus-visible:ring-emerald-500"
                  value={newTx.amount || ''}
                  onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Data</Label>
                <Input
                  type="date"
                  className="bg-[#0f111a] border-slate-700 focus-visible:ring-emerald-500"
                  value={newTx.date as string}
                  onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Categoria</Label>
                <Input
                  className="bg-[#0f111a] border-slate-700 focus-visible:ring-emerald-500"
                  value={newTx.category}
                  onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                  placeholder="Alimentação"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Método / Cartão</Label>
                <Select
                  value={newTx.origin}
                  onValueChange={(v) => setNewTx({ ...newTx, origin: v })}
                >
                  <SelectTrigger className="bg-[#0f111a] border-slate-700 focus:ring-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161925] border-slate-700 text-slate-100">
                    {ORIGINS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
              onClick={() => setIsAddOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className={cn(
                'text-white',
                newTx.type === 'income'
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-red-500 hover:bg-red-600',
              )}
              onClick={handleSaveTx}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTx} onOpenChange={(o) => !o && setEditingTx(null)}>
        <DialogContent className="bg-[#161925] border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Transação</DialogTitle>
          </DialogHeader>
          {editingTx && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Tipo</Label>
                <Select
                  value={editingTx.type}
                  onValueChange={(v: 'income' | 'expense') =>
                    setEditingTx({ ...editingTx, type: v })
                  }
                >
                  <SelectTrigger className="bg-[#0f111a] border-slate-700 focus:ring-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161925] border-slate-700 text-slate-100">
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Descrição</Label>
                <Input
                  className="bg-[#0f111a] border-slate-700 focus-visible:ring-emerald-500"
                  value={editingTx.description}
                  onChange={(e) => setEditingTx({ ...editingTx, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Valor (R$)</Label>
                  <Input
                    type="number"
                    className="bg-[#0f111a] border-slate-700 focus-visible:ring-emerald-500"
                    value={editingTx.amount}
                    onChange={(e) => setEditingTx({ ...editingTx, amount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Data</Label>
                  <Input
                    type="date"
                    className="bg-[#0f111a] border-slate-700 focus-visible:ring-emerald-500"
                    value={editingTx.date.split('T')[0]}
                    onChange={(e) =>
                      setEditingTx({
                        ...editingTx,
                        date: new Date(`${e.target.value}T12:00:00Z`).toISOString(),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Categoria</Label>
                  <Input
                    className="bg-[#0f111a] border-slate-700 focus-visible:ring-emerald-500"
                    value={editingTx.category}
                    onChange={(e) => setEditingTx({ ...editingTx, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Método / Cartão</Label>
                  <Select
                    value={editingTx.origin}
                    onValueChange={(v) => setEditingTx({ ...editingTx, origin: v })}
                  >
                    <SelectTrigger className="bg-[#0f111a] border-slate-700 focus:ring-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161925] border-slate-700 text-slate-100">
                      {ORIGINS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
              onClick={() => setEditingTx(null)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white"
              onClick={handleUpdateTx}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

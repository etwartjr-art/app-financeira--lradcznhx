import { useState } from 'react'
import { format } from 'date-fns'
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
import { Search, Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

const CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Educação',
  'Salário',
  'Outros',
]

export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, cards } = useFinance()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'expense',
    amount: 0,
    description: '',
    category: 'Outros',
    origin: 'Conta Principal',
    date: new Date().toISOString().split('T')[0],
    tags: '',
  })

  const ORIGINS = ['Conta Principal', 'Dinheiro', ...cards.map((c) => c.name)]

  const handleSave = () => {
    if (!newTx.description || !newTx.amount)
      return toast({ title: 'Preencha os campos obrigatórios.', variant: 'destructive' })
    const localDate = new Date(`${newTx.date}T12:00:00Z`).toISOString()
    if (editingTx) {
      updateTransaction(editingTx.id, { ...newTx, amount: Number(newTx.amount), date: localDate })
      setEditingTx(null)
      toast({ title: 'Transação atualizada.' })
    } else {
      addTransaction({
        description: newTx.description,
        amount: Number(newTx.amount),
        type: newTx.type as any,
        category: newTx.category!,
        origin: newTx.origin!,
        date: localDate,
        tags: newTx.tags,
      })
      setIsAddOpen(false)
      toast({ title: 'Transação salva!' })
    }
    setNewTx({
      type: 'expense',
      amount: 0,
      description: '',
      category: 'Outros',
      origin: 'Conta Principal',
      date: new Date().toISOString().split('T')[0],
      tags: '',
    })
  }

  const openEdit = (t: Transaction) => {
    setEditingTx(t)
    setNewTx({ ...t, date: t.date.split('T')[0] })
  }

  const filteredList = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' ? true : t.type === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Transações</h1>
          <p className="text-slate-400">Gerencie suas receitas e despesas</p>
        </div>
        <Button
          className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-lg px-6"
          onClick={() => setIsAddOpen(true)}
        >
          + Nova Transação
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            className="bg-[#161925] border-slate-800 pl-9 focus-visible:ring-[#0f766e] text-slate-200 w-full"
            placeholder="Buscar transação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-[#161925] p-1 rounded-lg border border-slate-800">
          <button
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
              filter === 'all' ? 'bg-[#0f766e] text-white' : 'text-slate-400 hover:text-white',
            )}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
              filter === 'income' ? 'bg-[#0f766e] text-white' : 'text-slate-400 hover:text-white',
            )}
            onClick={() => setFilter('income')}
          >
            Receitas
          </button>
          <button
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
              filter === 'expense' ? 'bg-[#0f766e] text-white' : 'text-slate-400 hover:text-white',
            )}
            onClick={() => setFilter('expense')}
          >
            Despesas
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#161925] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 font-semibold tracking-wider text-xs">
                DESCRIÇÃO
              </TableHead>
              <TableHead className="text-slate-400 font-semibold tracking-wider text-xs">
                CATEGORIA
              </TableHead>
              <TableHead className="text-slate-400 font-semibold tracking-wider text-xs">
                DATA
              </TableHead>
              <TableHead className="text-slate-400 font-semibold tracking-wider text-xs">
                CONTA
              </TableHead>
              <TableHead className="text-right text-slate-400 font-semibold tracking-wider text-xs">
                VALOR
              </TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.map((t) => (
              <TableRow key={t.id} className="border-slate-800/50 hover:bg-slate-800/30 group">
                <TableCell className="font-medium text-slate-200">
                  <div className="flex flex-col">
                    <span>{t.description}</span>
                    {t.tags && <span className="text-[10px] text-slate-500 mt-0.5">{t.tags}</span>}
                  </div>
                </TableCell>
                <TableCell className="text-slate-400 text-sm">{t.category}</TableCell>
                <TableCell className="text-slate-400 text-sm">
                  {format(new Date(t.date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="text-slate-400 text-sm">{t.origin}</TableCell>
                <TableCell
                  className={cn(
                    'text-right font-bold',
                    t.type === 'income' ? 'text-emerald-500' : 'text-slate-200',
                  )}
                >
                  {t.type === 'income' ? '' : '-'} R${' '}
                  {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                      onClick={() => openEdit(t)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        deleteTransaction(t.id)
                        toast({ title: 'Excluída' })
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredList.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={isAddOpen || !!editingTx}
        onOpenChange={(o) => {
          if (!o) {
            setIsAddOpen(false)
            setEditingTx(null)
          }
        }}
      >
        <DialogContent className="bg-[#161925] border-slate-800 text-slate-100 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingTx ? 'Editar Transação' : 'Nova Transação'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="flex bg-[#0b0e14] p-1 rounded-lg gap-1 border border-slate-800">
              <button
                className={cn(
                  'flex-1 py-2 text-sm font-semibold rounded-md transition-all',
                  newTx.type === 'expense'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white',
                )}
                onClick={() => setNewTx({ ...newTx, type: 'expense' })}
              >
                Despesa
              </button>
              <button
                className={cn(
                  'flex-1 py-2 text-sm font-semibold rounded-md transition-all',
                  newTx.type === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white',
                )}
                onClick={() => setNewTx({ ...newTx, type: 'income' })}
              >
                Receita
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  className="bg-[#0b0e14] border-slate-700 focus-visible:ring-[#0f766e]"
                  placeholder="Ex: Supermercado"
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  className="bg-[#0b0e14] border-slate-700 focus-visible:ring-[#0f766e]"
                  placeholder="0,00"
                  value={newTx.amount || ''}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={newTx.category}
                  onValueChange={(v) => setNewTx({ ...newTx, category: v })}
                >
                  <SelectTrigger className="bg-[#0b0e14] border-slate-700">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161925] border-slate-700 text-slate-100">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  className="bg-[#0b0e14] border-slate-700 focus-visible:ring-[#0f766e]"
                  value={newTx.date as string}
                  onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Conta</Label>
                <Select
                  value={newTx.origin}
                  onValueChange={(v) => setNewTx({ ...newTx, origin: v })}
                >
                  <SelectTrigger className="bg-[#0b0e14] border-slate-700">
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
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  className="bg-[#0b0e14] border-slate-700 focus-visible:ring-[#0f766e]"
                  placeholder="Ex: essencial, fixo"
                  value={newTx.tags}
                  onChange={(e) => setNewTx({ ...newTx, tags: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
              onClick={() => {
                setIsAddOpen(false)
                setEditingTx(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#0f766e] text-white hover:bg-[#0f766e]/90 px-8"
              onClick={handleSave}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

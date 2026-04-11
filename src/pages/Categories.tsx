import { useState } from 'react'
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
import { Tags, Edit, Trash2, Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useFinance, type Category } from '@/stores/FinanceContext'

import { TableSkeleton, ErrorState, EmptyState } from '@/components/StateFeedback'

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory, isLoading, error, retry } =
    useFinance()
  const [modal, setModal] = useState<{
    open: boolean
    mode: 'add' | 'edit'
    cat: Partial<Category>
  }>({
    open: false,
    mode: 'add',
    cat: { color: '#0f766e' },
  })

  const handleSave = async () => {
    if (!modal.cat.name || !modal.cat.color) {
      return toast({ title: 'Preencha todos os campos.', variant: 'destructive' })
    }
    try {
      if (modal.mode === 'add') {
        await addCategory({ name: modal.cat.name, color: modal.cat.color })
        toast({ title: 'Criado com sucesso' })
      } else {
        await updateCategory(modal.cat.id!, { name: modal.cat.name, color: modal.cat.color })
        toast({ title: 'Atualizado com sucesso' })
      }
      setModal({ open: false, mode: 'add', cat: { color: '#0f766e' } })
    } catch (err) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id)
      toast({ title: 'Removido com sucesso' })
    } catch (err) {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  if (isLoading && !categories.length) return <TableSkeleton />
  if (error) return <ErrorState message={error} onRetry={retry} />

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Categorias</h1>
          <p className="text-slate-400">Gerencie as categorias de transações.</p>
        </div>
        <Button
          className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-lg"
          onClick={() => setModal({ open: true, mode: 'add', cat: { color: '#0f766e' } })}
        >
          <Plus className="mr-2 h-4 w-4" /> <span>Adicionar Categoria</span>
        </Button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#161925] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[#0b0e14]">
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-400 font-semibold text-xs tracking-wider">
                COR
              </TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs tracking-wider w-full">
                NOME
              </TableHead>
              <TableHead className="text-right text-slate-400 font-semibold text-xs tracking-wider">
                AÇÕES
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id} className="border-slate-800/50 hover:bg-slate-800/30">
                <TableCell>
                  <div
                    className="w-6 h-6 rounded-full border border-slate-700 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                </TableCell>
                <TableCell className="font-medium text-slate-200">{cat.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white"
                      onClick={() => setModal({ open: true, mode: 'edit', cat })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-red-400"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modal.open} onOpenChange={(o) => !o && setModal({ ...modal, open: false })}>
        <DialogContent className="bg-[#161925] border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Tags className="w-5 h-5 text-[#0f766e]" />
              <span>{modal.mode === 'add' ? 'Nova Categoria' : 'Editar Categoria'}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Nome da Categoria</Label>
              <Input
                className="bg-[#0b0e14] border-slate-700 focus-visible:ring-[#0f766e]"
                placeholder="Ex: Alimentação"
                value={modal.cat.name || ''}
                onChange={(e) =>
                  setModal({ ...modal, cat: { ...modal.cat, name: e.target.value } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Cor de Identificação</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  className="w-16 h-12 p-1 bg-[#0b0e14] border-slate-700 rounded-md cursor-pointer"
                  value={modal.cat.color || '#0f766e'}
                  onChange={(e) =>
                    setModal({ ...modal, cat: { ...modal.cat, color: e.target.value } })
                  }
                />
                <span className="text-sm text-slate-400 font-mono tracking-wider uppercase bg-[#0b0e14] px-3 py-1.5 rounded-md border border-slate-800">
                  {modal.cat.color || '#0f766e'}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-transparent border-slate-700 text-white"
              onClick={() => setModal({ ...modal, open: false })}
            >
              Cancelar
            </Button>
            <Button className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white" onClick={handleSave}>
              Salvar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

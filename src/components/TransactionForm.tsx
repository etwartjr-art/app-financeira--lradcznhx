import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TransactionExt } from '@/services/transactions'

interface Category {
  id: string
  name: string
}

interface Card {
  id: string
  name: string
}

interface TransactionFormProps {
  transaction?: TransactionExt
  categories: Category[]
  cards: Card[]
  onSubmit: (data: Partial<TransactionExt>) => void
  onCancel: () => void
  isLoading?: boolean
}

export function TransactionForm({
  transaction,
  categories,
  cards,
  onSubmit,
  onCancel,
  isLoading,
}: TransactionFormProps) {
  const [formData, setFormData] = useState({
    description: transaction?.description || '',
    amount: transaction?.amount ? String(Math.abs(transaction.amount)) : '',
    date: transaction?.date
      ? new Date(transaction.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    type: transaction?.type || 'expense',
    category: transaction?.category || 'none',
    cardId: transaction?.cardId || 'none',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description || '',
        amount: transaction.amount ? String(Math.abs(transaction.amount)) : '',
        date: transaction.date
          ? new Date(transaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        type: transaction.type || 'expense',
        category: transaction.category || 'none',
        cardId: transaction.cardId || 'none',
      })
    }
  }, [transaction])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = 'A descrição é obrigatória.'
    }
    const numAmount = Number(formData.amount.replace(',', '.'))
    if (!formData.amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'O valor é obrigatório e deve ser maior que zero.'
    }
    if (!formData.date) {
      newErrors.date = 'A data é obrigatória.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    let finalAmount = numAmount
    if (formData.type === 'expense') {
      finalAmount = -Math.abs(numAmount)
    } else {
      finalAmount = Math.abs(numAmount)
    }

    onSubmit({
      description: formData.description.trim(),
      amount: finalAmount,
      date: new Date(`${formData.date}T12:00:00Z`).toISOString(),
      type: formData.type as 'income' | 'expense',
      category: formData.category === 'none' ? '' : formData.category,
      cardId: formData.cardId === 'none' ? '' : formData.cardId,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={isLoading}
            placeholder="Ex: Supermercado"
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              disabled={isLoading}
              placeholder="0.00"
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              disabled={isLoading}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange('type', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange('category', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Conta / Cartão</Label>
          <Select
            value={formData.cardId}
            onValueChange={(value) => handleChange('cardId', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a conta/cartão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {cards.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

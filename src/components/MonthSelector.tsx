import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFinance } from '@/stores/FinanceContext'

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function MonthSelector() {
  const { currentMonth, setCurrentMonth } = useFinance()
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const handlePrev = () => setCurrentMonth(new Date(year, month - 1, 1))
  const handleNext = () => setCurrentMonth(new Date(year, month + 1, 1))

  return (
    <div className="flex items-center gap-1 bg-[#161925] border border-slate-800 rounded-lg p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-white"
        onClick={handlePrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex gap-1 items-center">
        <Select
          value={month.toString()}
          onValueChange={(v) => setCurrentMonth(new Date(year, parseInt(v), 1))}
        >
          <SelectTrigger className="h-8 border-0 bg-transparent shadow-none focus:ring-0 text-sm font-medium w-[110px] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#161925] border-slate-800 text-slate-100">
            {MONTHS.map((m, i) => (
              <SelectItem key={i} value={i.toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year.toString()}
          onValueChange={(v) => setCurrentMonth(new Date(parseInt(v), month, 1))}
        >
          <SelectTrigger className="h-8 border-0 bg-transparent shadow-none focus:ring-0 text-sm font-medium w-[80px] text-slate-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#161925] border-slate-800 text-slate-100">
            {Array.from({ length: 11 }, (_, i) => year - 5 + i).map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-white"
        onClick={handleNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

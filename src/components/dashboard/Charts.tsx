import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

export function CashFlowChart({ data }: { data: any[] }) {
  if (data.length === 0 || data.every((d) => d.Receitas === 0 && d.Despesas === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        Sem dados de fluxo neste mês.
      </div>
    )
  }

  return (
    <ChartContainer
      config={{
        Receitas: { label: 'Receitas', color: '#10b981' },
        Despesas: { label: 'Despesas', color: '#ef4444' },
      }}
      className="w-full h-[200px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="Receitas"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorRec)"
          />
          <Area
            type="monotone"
            dataKey="Despesas"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorDes)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function CategoryExpensesChart({ data }: { data: any[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        Nenhuma despesa registrada.
      </div>
    )
  }

  const config = data.reduce(
    (acc, curr) => {
      acc[curr.name] = { label: curr.name, color: curr.color }
      return acc
    },
    {} as Record<string, { label: string; color: string }>,
  )

  return (
    <ChartContainer config={config} className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

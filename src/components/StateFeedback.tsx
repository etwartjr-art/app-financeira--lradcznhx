import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 animate-fade-in p-4">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-lg font-semibold text-white">Ops, algo deu errado</h3>
        <p className="text-sm text-slate-400">{message}</p>
      </div>
      <Button onClick={onRetry} className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white">
        Tentar novamente
      </Button>
    </div>
  )
}

export function EmptyState({ message = 'Nenhum registro encontrado' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 w-full">
      <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-base font-medium text-slate-300">{message}</p>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48 bg-slate-800" />
        <Skeleton className="h-10 w-32 bg-slate-800" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64 w-full bg-slate-800 rounded-xl" />
        <Skeleton className="h-64 w-full bg-slate-800 rounded-xl" />
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48 bg-slate-800" />
        <Skeleton className="h-10 w-32 bg-slate-800" />
      </div>
      <Skeleton className="h-12 w-full max-w-md bg-slate-800 rounded-lg" />
      <div className="rounded-xl border border-slate-800 bg-[#161925] overflow-hidden">
        <Skeleton className="h-12 w-full bg-[#0b0e14]" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-slate-800/50">
            <Skeleton className="h-6 w-full bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48 bg-slate-800" />
        <Skeleton className="h-10 w-32 bg-slate-800" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full bg-slate-800 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

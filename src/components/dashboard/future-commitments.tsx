import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/utils/format'

interface FutureCommitmentsProps {
    data: { month: string; amount: number }[]
}

export function FutureCommitments({ data }: FutureCommitmentsProps) {
    if (data.length === 0) return null

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Próximos Meses</h3>
            <div className="space-y-2">
                {data.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="capitalize text-zinc-600 dark:text-zinc-400">{item.month}</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(item.amount)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

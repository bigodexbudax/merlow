import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/utils/format'

interface DashboardSummaryProps {
    confirmedTotal: number
    projectedTotal: number
}

export function DashboardSummary({ confirmedTotal, projectedTotal }: DashboardSummaryProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Card className="bg-zinc-900 text-white dark:bg-zinc-800">
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-zinc-400">Total Confirmado</p>
                    <p className="text-3xl font-bold mt-2">{formatCurrency(confirmedTotal)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Previsto (Pendente)</p>
                    <p className="text-3xl font-bold mt-2 text-muted-foreground">{formatCurrency(projectedTotal)}</p>
                </CardContent>
            </Card>
        </div>
    )
}

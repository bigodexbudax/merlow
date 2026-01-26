import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/utils/format'

interface DashboardSummaryProps {
    confirmedTotal: number
    projectedTotal: number
}

export function DashboardSummary({ confirmedTotal, projectedTotal }: DashboardSummaryProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Card className="border-none text-zinc-950 overflow-hidden relative shadow-lg">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,#62bfd4,#f1dd76)] opacity-90" />
                <CardContent className="p-6 relative z-10">
                    <p className="text-sm font-semibold opacity-70">Total Confirmado</p>
                    <p className="text-3xl font-black mt-2 tracking-tight">{formatCurrency(confirmedTotal)}</p>
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

'use client'

import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/utils/format'
import { EditEventDialog } from '@/components/events/edit-event-dialog'
import { useState } from 'react'

interface TimelineListProps {
    events: any[]
    accounts: any[]
    categories: any[]
    entities: any[]
}

export function TimelineList({ events, accounts, categories, entities }: TimelineListProps) {
    const [selectedEvent, setSelectedEvent] = useState<any>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const handleRowClick = (event: any) => {
        setSelectedEvent(event)
        setDialogOpen(true)
    }

    return (
        <div className="space-y-1">
            {events.map((event) => (
                <div
                    key={event.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(event)}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-12 text-center">
                            <span className="text-xl font-bold leading-none">
                                {format(new Date(event.event_date + 'T00:00:00'), 'dd')}
                            </span>
                            <span className="text-xs uppercase text-muted-foreground">
                                {format(new Date(event.event_date + 'T00:00:00'), 'MMM', { locale: ptBR })}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-sm md:text-base">
                                {event.description || 'Sem descrição'}
                            </span>
                            <div className="flex gap-2 items-center mt-1">
                                {event.categories && (
                                    <span className="text-xs text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                        {event.categories.name}
                                    </span>
                                )}
                                {event.status === 'pendente' && (
                                    <Badge variant="secondary" className="text-[10px] h-5">Previsto</Badge>
                                )}
                                {event.recurrence_id && (
                                    <Badge variant="outline" className="text-[10px] h-5 border-blue-500 text-blue-600">Recorrente</Badge>
                                )}
                                {event.installment_id && (
                                    <Badge variant="outline" className="text-[10px] h-5 border-orange-500 text-orange-600">
                                        Parcelado
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <span className={cn(
                            "font-bold block",
                            event.status === 'pendente' ? "text-muted-foreground" : ""
                        )}>
                            {formatCurrency(event.amount)}
                        </span>
                        {event.installment_id && event.installment && (() => {
                            const match = event.description?.match(/\((\d+)\/(\d+)\)/)
                            const total = match ? match[2] : null
                            return (
                                <span className="text-[10px] text-muted-foreground mt-0.5">
                                    Parcela {event.installment}
                                    {total ? ` de ${total}` : ''}
                                    {total && (
                                        <> (faltam {Number(total) - Number(event.installment)})</>
                                    )}
                                </span>
                            )
                        })()}
                    </div>
                </div>
            ))}

            {selectedEvent && (
                <EditEventDialog
                    key={selectedEvent.id}
                    event={selectedEvent}
                    accounts={accounts}
                    categories={categories}
                    entities={entities}
                    defaultOpen={true}
                    trigger={<span className="hidden" />}
                    onOpenChange={(open) => {
                        setDialogOpen(open)
                        if (!open) {
                            setTimeout(() => setSelectedEvent(null), 300)
                        }
                    }}
                />
            )}
        </div>
    )
}

// Utility for conditional classes
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}

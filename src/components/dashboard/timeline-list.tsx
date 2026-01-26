'use client'

import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/utils/format'
import { EditEventDialog } from '@/components/events/edit-event-dialog'
import { useState } from 'react'

interface TimelineListProps {
    events: any[]
    categories: any[]
    entities: any[]
}

export function TimelineList({ events, categories, entities }: TimelineListProps) {
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
                                {event.payment_method && (
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 border border-zinc-200 dark:border-zinc-800 px-1.5 rounded-sm">
                                        {event.payment_method}
                                    </span>
                                )}
                                {event.status === 'pendente' && (
                                    <Badge variant="secondary" className="text-[10px] h-5">Previsto</Badge>
                                )}
                                {event.recurrence_id && (
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] shrink-0 shadow-sm" title="Recorrente">R</div>
                                )}
                                {event.installment_id && (
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[10px] shrink-0 shadow-sm" title="Parcelado">P</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-center">
                        <span className={cn(
                            "font-bold block",
                            event.status === 'pendente' ? "text-muted-foreground" : ""
                        )}>
                            {formatCurrency(event.amount)}
                        </span>
                        {event.installment_id && event.installment && (() => {
                            const match = event.description?.match(/\((\d+)\/(\d+)\)/)
                            const total = match ? Number(match[2]) : null
                            const current = Number(event.installment)
                            if (!total) return null
                            const remaining = total - current
                            return (
                                <span className="text-[10px] text-muted-foreground mt-0.5 font-medium tracking-tighter">
                                    {remaining > 0 ? `(faltam ${remaining} parcelas)` : '(última)'}
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

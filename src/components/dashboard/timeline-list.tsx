'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/utils/format'
import { EditEventDialog } from '@/components/events/edit-event-dialog'
import { confirmFinancialEvent, deleteFinancialEvent } from '@/app/events/actions'
import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'

interface TimelineListProps {
    events: any[]
    categories: any[]
    entities: any[]
}

type PrevistoEvent = { id: string; description?: string | null; amount: number } | null

export function TimelineList({ events, categories, entities }: TimelineListProps) {
    const [selectedEvent, setSelectedEvent] = useState<any>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [previstoEvent, setPrevistoEvent] = useState<PrevistoEvent>(null)
    const [previstoAction, setPrevistoAction] = useState<'idle' | 'confirm' | 'delete'>('idle')

    const handleRowClick = (event: any) => {
        setSelectedEvent(event)
        setDialogOpen(true)
    }

    const openPrevistoDialog = (e: React.MouseEvent, event: any) => {
        e.stopPropagation()
        setPrevistoEvent({ id: event.id, description: event.description, amount: event.amount })
    }

    const closePrevistoDialog = () => {
        setPrevistoEvent(null)
        setPrevistoAction('idle')
    }

    const handlePrevistoConfirm = async () => {
        if (!previstoEvent) return
        setPrevistoAction('confirm')
        const result = await confirmFinancialEvent(previstoEvent.id)
        setPrevistoAction('idle')
        if ('error' in result) {
            alert(result.error)
            return
        }
        closePrevistoDialog()
    }

    const handlePrevistoDelete = async () => {
        if (!previstoEvent) return
        const ok = window.confirm(
            'Tem certeza que deseja apagar apenas este lançamento? As outras parcelas/recorrências não serão alteradas.'
        )
        if (!ok) return
        setPrevistoAction('delete')
        const result = await deleteFinancialEvent(previstoEvent.id)
        setPrevistoAction('idle')
        if ('error' in result) {
            alert(result.error)
            return
        }
        closePrevistoDialog()
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
                                    <Badge asChild variant="secondary" className="text-[10px] h-5 cursor-pointer hover:opacity-90">
                                        <button
                                            type="button"
                                            onClick={(e) => openPrevistoDialog(e, event)}
                                            className="focus:outline-none focus:ring-2 focus:ring-ring rounded-full"
                                        >
                                            Previsto
                                        </button>
                                    </Badge>
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

                    <div className="text-right flex flex-col items-end gap-1">
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
                    event={{ ...selectedEvent, source_type: selectedEvent.source_type ?? undefined }}
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

            <Dialog open={!!previstoEvent} onOpenChange={(open) => !open && closePrevistoDialog()}>
                <DialogContent className="sm:max-w-[440px] p-0 border-none gap-0 overflow-hidden">
                    <div className="bg-[linear-gradient(90deg,#62bfd4,#f1dd76)] px-6 pt-6 pb-5 text-zinc-950">
                        <DialogHeader className="space-y-2">
                            <DialogTitle className="text-lg font-bold text-zinc-900">
                                O que fazer com este lançamento?
                            </DialogTitle>
                            {previstoEvent && (
                                <p className="text-sm font-medium text-zinc-800/90 pt-0.5">
                                    {previstoEvent.description || 'Sem descrição'} · {formatCurrency(previstoEvent.amount)}
                                </p>
                            )}
                        </DialogHeader>
                    </div>
                    <div className="p-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                        <Button
                            variant="ghost"
                            onClick={handlePrevistoDelete}
                            disabled={previstoAction !== 'idle'}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 sm:order-1"
                        >
                            {previstoAction === 'delete' ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Apagar
                        </Button>
                        <Button
                            onClick={handlePrevistoConfirm}
                            disabled={previstoAction !== 'idle'}
                            className="sm:order-2"
                        >
                            {previstoAction === 'confirm' ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Confirmar cobrança
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Utility for conditional classes
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}

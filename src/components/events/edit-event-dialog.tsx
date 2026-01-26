'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateFinancialEvent } from '@/app/events/actions'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    CalendarIcon,
    CreditCard,
    Tag,
    Building2,
    Info,
    ArrowRight,
    FileText,
    Wallet,
    QrCode,
    Banknote,
    MoreHorizontal
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/utils/format'

// Helper types
type ListOption = { id: string; name: string }

interface EditEventDialogProps {
    event: {
        id: string
        description: string | null
        amount: number
        event_date: string
        category_id: string | null
        entity_id: string | null
        payment_method: string | null
        installment?: number | null
        installment_id?: string | null
        recurrence_id?: string | null
    }
    categories: ListOption[]
    entities: ListOption[]
    trigger?: React.ReactNode
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

export function EditEventDialog({ event, categories, entities, trigger, onOpenChange, defaultOpen = false }: EditEventDialogProps) {
    const [open, setOpen] = useState(defaultOpen)
    const [paymentMethod, setPaymentMethod] = useState<string>(event.payment_method || '')

    const PAYMENT_METHODS = [
        { id: 'credito', label: 'Crédito', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50/50' },
        { id: 'debito', label: 'Débito', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
        { id: 'pix', label: 'Pix', icon: QrCode, color: 'text-cyan-600', bg: 'bg-cyan-50/50' },
        { id: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: 'text-amber-600', bg: 'bg-amber-50/50' },
        { id: 'boleto', label: 'Boleto', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50/50' },
        { id: 'outro', label: 'Outro', icon: MoreHorizontal, color: 'text-zinc-600', bg: 'bg-zinc-50/50' },
    ]

    const handleSubmit = async (formData: FormData) => {
        if (paymentMethod) {
            formData.set('payment_method', paymentMethod)
        }
        const result = await updateFinancialEvent(event.id, null, formData)
        if (result.success) {
            setOpen(false)
            if (onOpenChange) onOpenChange(false)
        } else {
            alert('Erro ao atualizar lançamento: ' + JSON.stringify(result.error))
        }
    }

    const eventDate = new Date(event.event_date + 'T00:00:00')

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (onOpenChange) onOpenChange(val)
        }}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Editar</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0 border-none">
                <DialogHeader className="sr-only">
                    <DialogTitle>Editar Lançamento</DialogTitle>
                </DialogHeader>
                <div className="relative overflow-hidden bg-[linear-gradient(90deg,#62bfd4,#f1dd76)] p-8 text-zinc-950">
                    <div className="flex flex-col gap-1 relative z-10">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-white/30 border-none text-zinc-900 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5">
                                Edição de Lançamento
                            </Badge>
                            {event.installment_id && (
                                <Badge className="bg-orange-500/20 text-orange-900 border-none font-bold text-[10px]">
                                    Parcela {event.installment ? `(${event.installment})` : ''}
                                </Badge>
                            )}
                            {event.recurrence_id && (
                                <Badge className="bg-blue-500/20 text-blue-900 border-none font-bold text-[10px]">
                                    Recorrente
                                </Badge>
                            )}
                        </div>
                        <h2 className="text-4xl font-black mt-2 tracking-tighter">
                            {formatCurrency(event.amount)}
                        </h2>
                        <div className="flex items-center gap-2 mt-2 font-medium opacity-80">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="capitalize">{format(eventDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
                        </div>
                    </div>
                    {/* Abstract background elements */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-white/20 rounded-full blur-2xl" />
                </div>

                <form action={handleSubmit} className="space-y-6 p-6">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                            <FileText className="h-3 w-3" /> Descrição
                        </Label>
                        <Input
                            name="description"
                            defaultValue={event.description || ''}
                            placeholder="Ex: Mercado mensal"
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                            <CreditCard className="h-3 w-3" /> Método de Pagamento
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            {PAYMENT_METHODS.map((method) => {
                                const Icon = method.icon
                                const isActive = paymentMethod === method.id
                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all gap-1 group",
                                            isActive
                                                ? "border-[#4c2ab4] bg-zinc-50/50 shadow-sm"
                                                : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-1.5 rounded-lg transition-colors",
                                            isActive ? method.bg : "bg-zinc-100/50 dark:bg-zinc-800/50 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800"
                                        )}>
                                            <Icon className={cn("h-3.5 w-3.5", isActive ? method.color : "text-zinc-400 dark:text-zinc-500")} />
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-tight transition-colors text-center",
                                            isActive ? "text-[#4c2ab4]" : "text-zinc-500"
                                        )}>
                                            {method.label}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                        <input type="hidden" name="payment_method" value={paymentMethod} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                                <Tag className="h-3 w-3" /> Categoria
                            </Label>
                            <Select name="category_id" defaultValue={event.category_id || undefined}>
                                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11 w-full">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                                <Building2 className="h-3 w-3" /> Empresa / Entidade
                            </Label>
                            <Select name="entity_id" defaultValue={event.entity_id || undefined}>
                                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11 w-full">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {entities.map(ent => (
                                        <SelectItem key={ent.id} value={ent.id}>{ent.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        <Info className="h-5 w-5 text-[#4c2ab4] shrink-0" />
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                            Os campos de **valor** e **data** são protegidos para garantir a consistência de seus históricos e automações.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="submit" className="flex-1 h-12 text-md font-bold">
                            Salvar Alterações <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

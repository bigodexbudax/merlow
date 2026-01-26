'use client'

import { useState } from 'react'
import {
    CalendarIcon,
    Plus,
    Wallet,
    FileText,
    Tag,
    Building2,
    ArrowRight,
    Clock,
    CreditCard,
    QrCode,
    Banknote,
    MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { createFinancialEvent } from '@/app/events/actions'

// Helper types
type ListOption = { id: string; name: string }

interface CreateEventDialogProps {
    categories: ListOption[]
    entities: ListOption[]
    trigger?: React.ReactNode
}

export function CreateEventDialog({ categories, entities, trigger }: CreateEventDialogProps) {
    const [open, setOpen] = useState(false)
    const [isRecurring, setIsRecurring] = useState(false)
    const [isInstallment, setIsInstallment] = useState(false)

    // State for controlled inputs to handle masking & calc
    const [amountStr, setAmountStr] = useState('')
    const [installmentCount, setInstallmentCount] = useState('')
    const [installmentAmountStr, setInstallmentAmountStr] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<string>('')

    const PAYMENT_METHODS = [
        { id: 'credito', label: 'Crédito', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50/50' },
        { id: 'debito', label: 'Débito', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
        { id: 'pix', label: 'Pix', icon: QrCode, color: 'text-cyan-600', bg: 'bg-cyan-50/50' },
        { id: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: 'text-amber-600', bg: 'bg-amber-50/50' },
        { id: 'boleto', label: 'Boleto', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50/50' },
        { id: 'outro', label: 'Outro', icon: MoreHorizontal, color: 'text-zinc-600', bg: 'bg-zinc-50/50' },
    ]

    // Currency Formatter: R$ 0,00
    const formatCurrency = (value: string) => {
        const numeric = value.replace(/\D/g, '')
        const floatVal = Number(numeric) / 100
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(floatVal)
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setAmountStr(formatCurrency(val))
    }

    const handleInstallmentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setInstallmentAmountStr(formatCurrency(val))
    }

    const handleInstallmentCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const countStr = e.target.value
        setInstallmentCount(countStr)

        const count = parseInt(countStr)
        if (isInstallment && count > 0 && amountStr) {
            const numericAmount = Number(amountStr.replace(/[^\d]/g, '')) / 100
            const instVal = numericAmount / count
            setInstallmentAmountStr(new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(instVal))
        }
    }

    const handleSubmit = async (formData: FormData) => {
        if (amountStr) {
            const numeric = Number(amountStr.replace(/[^\d]/g, '')) / 100
            formData.set('amount', numeric.toString())
        }
        if (installmentAmountStr) {
            const numeric = Number(installmentAmountStr.replace(/[^\d]/g, '')) / 100
            formData.set('installment_amount', numeric.toString())
        }

        const result = await createFinancialEvent(null, formData)
        if (result.success) {
            setOpen(false)
            setAmountStr('')
            setInstallmentCount('')
            setInstallmentAmountStr('')
            setPaymentMethod('')
        } else {
            const errorMsg = result.details
                ? JSON.stringify(result.details.fieldErrors, null, 2)
                : result.error
            alert('Erro ao criar lançamento: ' + errorMsg)
        }
    }

    const handleOpenChange = (val: boolean) => {
        setOpen(val)
        if (!val) {
            setAmountStr('')
            setInstallmentCount('')
            setInstallmentAmountStr('')
            setPaymentMethod('')
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || <Button><Plus className="mr-2 h-4 w-4" /> Novo Lançamento</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0 border-none font-sans">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-black tracking-tight">Novo Lançamento</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-6 p-6 pt-2 pb-10">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                                <CalendarIcon className="h-3 w-3" /> Data
                            </Label>
                            <Input
                                type="date"
                                name="event_date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                                <Wallet className="h-3 w-3" /> Valor
                            </Label>
                            <Input
                                type="text"
                                name="amount_display"
                                value={amountStr}
                                onChange={handleAmountChange}
                                required
                                placeholder="R$ 0,00"
                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-bold text-lg h-11"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                            <FileText className="h-3 w-3" /> Descrição
                        </Label>
                        <Input
                            name="description"
                            placeholder="Ex: Compra de suprimentos"
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11"
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
                            <Select name="category_id">
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
                                <Building2 className="h-3 w-3" /> Empresa
                            </Label>
                            <Select name="entity_id">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
                            <div className="flex flex-col gap-0.5">
                                <Label htmlFor="is_recurring" className="text-xs font-bold uppercase tracking-tight cursor-pointer">Recorrente</Label>
                                <span className="text-[9px] text-zinc-500 font-medium italic">Lançamento mensal</span>
                            </div>
                            <Switch
                                id="is_recurring"
                                checked={isRecurring}
                                onCheckedChange={(val) => {
                                    setIsRecurring(val)
                                    if (val) setIsInstallment(false)
                                }}
                            />
                            <input type="hidden" name="is_recurring" value={isRecurring ? "on" : ""} />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
                            <div className="flex flex-col gap-0.5">
                                <Label htmlFor="is_installment" className="text-xs font-bold uppercase tracking-tight cursor-pointer">Parcelado</Label>
                                <span className="text-[9px] text-zinc-500 font-medium italic">Dividir em partes</span>
                            </div>
                            <Switch
                                id="is_installment"
                                checked={isInstallment}
                                onCheckedChange={(val) => {
                                    setIsInstallment(val)
                                    if (val) setIsRecurring(false)
                                }}
                            />
                            <input type="hidden" name="is_installment" value={isInstallment ? "on" : ""} />
                        </div>
                    </div>

                    {isRecurring && (
                        <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/20 p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                                <Clock className="h-3 w-3" /> Configuração de Recorrência
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase text-blue-600/70 dark:text-blue-400/70 font-bold tracking-tighter">A cada</Label>
                                    <Input type="number" name="recurrence_interval_value" defaultValue="1" min="1" required={isRecurring} className="bg-white dark:bg-zinc-950 border-blue-200 dark:border-blue-800" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase text-blue-600/70 dark:text-blue-400/70 font-bold tracking-tighter">Unidade</Label>
                                    <Select name="recurrence_interval_unit" defaultValue="mes" required={isRecurring}>
                                        <SelectTrigger className="bg-white dark:bg-zinc-950 border-blue-200 dark:border-blue-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dia">Dia(s)</SelectItem>
                                            <SelectItem value="semana">Semana(s)</SelectItem>
                                            <SelectItem value="mes">Mês(es)</SelectItem>
                                            <SelectItem value="ano">Ano(s)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase text-blue-600/70 dark:text-blue-400/70 font-bold tracking-tighter">Termina em (Obrigatório)</Label>
                                <Input type="date" name="recurrence_ends_at" required={isRecurring} id="recurrence_ends_at_input" className="bg-white dark:bg-zinc-950 border-blue-200 dark:border-blue-800 h-10" />
                                <div className="flex gap-2 flex-wrap pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="text-[10px] h-7 px-2 border-blue-200 dark:border-blue-800 text-blue-700 bg-white/50"
                                        onClick={() => {
                                            const today = new Date()
                                            const future = new Date(today.setMonth(today.getMonth() + 6))
                                            const str = future.toISOString().split('T')[0]
                                            const el = document.getElementById('recurrence_ends_at_input') as HTMLInputElement
                                            if (el) el.value = str
                                        }}
                                    >
                                        6 Meses
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="text-[10px] h-7 px-2 border-blue-200 dark:border-blue-800 text-blue-700 bg-white/50"
                                        onClick={() => {
                                            const today = new Date()
                                            const future = new Date(today.setMonth(today.getMonth() + 12))
                                            const str = future.toISOString().split('T')[0]
                                            const el = document.getElementById('recurrence_ends_at_input') as HTMLInputElement
                                            if (el) el.value = str
                                        }}
                                    >
                                        1 Ano
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="text-[10px] h-7 px-2 border-blue-200 dark:border-blue-800 text-blue-700 bg-white/50"
                                        onClick={() => {
                                            const today = new Date()
                                            const future = new Date(today.getFullYear(), 11, 31)
                                            const y = future.getFullYear()
                                            const m = String(future.getMonth() + 1).padStart(2, '0')
                                            const d = String(future.getDate()).padStart(2, '0')
                                            const str = `${y}-${m}-${d}`
                                            const el = document.getElementById('recurrence_ends_at_input') as HTMLInputElement
                                            if (el) el.value = str
                                        }}
                                    >
                                        Fim do Ano
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isInstallment && (
                        <div className="rounded-xl border border-orange-100 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-900/20 p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-bold text-xs uppercase tracking-wider">
                                <CreditCard className="h-3 w-3" /> Configuração de Parcelamento
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase text-orange-600/70 dark:text-orange-400/70 font-bold tracking-tighter">Total de Parcelas</Label>
                                    <Input
                                        type="number"
                                        name="installment_count"
                                        min="2"
                                        required={isInstallment}
                                        value={installmentCount}
                                        onChange={handleInstallmentCountChange}
                                        placeholder="12"
                                        className="bg-white dark:bg-zinc-950 border-orange-200 dark:border-orange-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase text-orange-600/70 dark:text-orange-400/70 font-bold tracking-tighter">Valor da Parcela</Label>
                                    <Input
                                        type="text"
                                        name="installment_amount_display"
                                        required={isInstallment}
                                        value={installmentAmountStr}
                                        onChange={handleInstallmentAmountChange}
                                        placeholder="R$ 0,00"
                                        className="bg-white dark:bg-zinc-950 border-orange-200 dark:border-orange-800 font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <Button type="submit" className="flex-1 h-12 text-md font-bold">
                            Criar Lançamento <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

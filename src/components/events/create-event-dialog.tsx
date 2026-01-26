'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CalendarIcon, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { createFinancialEvent } from '@/app/events/actions'

// Helper types
type ListOption = { id: string; name: string }

interface CreateEventDialogProps {
    accounts: ListOption[]
    categories: ListOption[]
    entities: ListOption[]
    trigger?: React.ReactNode
}

export function CreateEventDialog({ accounts, categories, entities, trigger }: CreateEventDialogProps) {
    const [open, setOpen] = useState(false)
    const [isRecurring, setIsRecurring] = useState(false)
    const [isInstallment, setIsInstallment] = useState(false)

    // State for controlled inputs to handle masking & calc
    const [amountStr, setAmountStr] = useState('')
    const [installmentCount, setInstallmentCount] = useState('')
    const [installmentAmountStr, setInstallmentAmountStr] = useState('')

    // Currency Formatter: R$ 0,00
    const formatCurrency = (value: string) => {
        // Remove non-digits
        const numeric = value.replace(/\D/g, '')
        // Convert to float
        const floatVal = Number(numeric) / 100
        // Format
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(floatVal)
    }

    // Handle Amount Change
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setAmountStr(formatCurrency(val))
    }

    // Handle Installment Amount Change
    const handleInstallmentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setInstallmentAmountStr(formatCurrency(val))
    }

    // Auto-calc logic
    const handleInstallmentCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const countStr = e.target.value
        setInstallmentCount(countStr)

        const count = parseInt(countStr)
        if (isInstallment && count > 0 && amountStr) {
            // Unmask amount
            const numericAmount = Number(amountStr.replace(/[^\d]/g, '')) / 100
            const instVal = numericAmount / count
            setInstallmentAmountStr(new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(instVal))
        }
    }

    const handleSubmit = async (formData: FormData) => {
        // Unmask currency fields before submission
        if (amountStr) {
            const numeric = Number(amountStr.replace(/[^\d]/g, '')) / 100
            formData.set('amount', numeric.toString())
        }
        if (installmentAmountStr) {
            const numeric = Number(installmentAmountStr.replace(/[^\d]/g, '')) / 100
            formData.set('installment_amount', numeric.toString())
        }
        // Force installment_count from state if needed, though input name handles it.
        // Actually, uncontrolled inputs send their value. But we controlled installment_count.
        // Wait, input name="installment_count" value={installmentCount} onChange={...} 
        // will send the current value in formData correctly.

        const result = await createFinancialEvent(null, formData)
        if (result.success) {
            setOpen(false)
            setAmountStr('')
            setInstallmentCount('')
            setInstallmentAmountStr('')
        } else {
            const errorMsg = result.details
                ? JSON.stringify(result.details.fieldErrors, null, 2)
                : result.error
            alert('Erro ao criar lançamento: ' + errorMsg)
        }
    }

    // Reset when opening/closing
    const handleOpenChange = (val: boolean) => {
        setOpen(val)
        if (!val) {
            setAmountStr('')
            setInstallmentCount('')
            setInstallmentAmountStr('')
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || <Button><Plus className="mr-2 h-4 w-4" /> Novo Lançamento</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo Lançamento</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4 py-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Data</Label>
                            <Input type="date" name="event_date" required defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="space-y-2">
                            <Label>Valor</Label>
                            {/* Controlled Input with Mask */}
                            <Input
                                type="text"
                                name="amount_display" // Dont name it 'amount' so it doesn't conflict with formData override logic, or let it override? Best to override.
                                // Actually, if we use name="amount", form data takes the string "R$ ...". We override it in handleSubmit.
                                // But if JS is disabled (unlikely for client component), it fails. Client component implies JS.
                                value={amountStr}
                                onChange={handleAmountChange}
                                required
                                placeholder="R$ 0,00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input name="description" placeholder="Descrição do lançamento" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select name="category_id">
                                <SelectTrigger>
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
                            <Label>Empresa</Label>
                            <Select name="entity_id">
                                <SelectTrigger>
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

                    <div className="flex gap-4 border-t pt-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_recurring"
                                name="is_recurring"
                                checked={isRecurring}
                                onCheckedChange={(c) => {
                                    setIsRecurring(!!c)
                                    if (c) setIsInstallment(false)
                                }}
                            />
                            <label htmlFor="is_recurring" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Recorrente
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_installment"
                                name="is_installment"
                                checked={isInstallment}
                                onCheckedChange={(c) => {
                                    setIsInstallment(!!c)
                                    if (c) setIsRecurring(false)
                                }}
                            />
                            <label htmlFor="is_installment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Parcelado
                            </label>
                        </div>
                    </div>

                    {isRecurring && (
                        <div className="rounded-md bg-muted p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>A cada</Label>
                                    <Input type="number" name="recurrence_interval_value" defaultValue="1" min="1" required={isRecurring} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unidade</Label>
                                    <Select name="recurrence_interval_unit" defaultValue="mes" required={isRecurring}>
                                        <SelectTrigger>
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
                                <Label>Termina em</Label>
                                <Input type="date" name="recurrence_ends_at" required={isRecurring} id="recurrence_ends_at_input" />
                                <div className="flex gap-2 flex-wrap">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="xs"
                                        className="text-xs h-7"
                                        onClick={() => {
                                            const today = new Date()
                                            // 6 months
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
                                        size="xs"
                                        className="text-xs h-7"
                                        onClick={() => {
                                            const today = new Date()
                                            // 12 months (1 year)
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
                                        size="xs"
                                        className="text-xs h-7"
                                        onClick={() => {
                                            const today = new Date()
                                            // End of Year
                                            const future = new Date(today.getFullYear(), 11, 31)
                                            // Correct timezone offset issue simply by using Local string formatting or manual YYYY-MM-DD
                                            // new Date(y, 11, 31) is local.
                                            // toISOString() uses UTC. 
                                            // Let's use simple formatting:
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
                        <div className="rounded-md bg-muted p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Total de Parcelas</Label>
                                    <Input
                                        type="number"
                                        name="installment_count"
                                        min="2"
                                        required={isInstallment}
                                        value={installmentCount} // Controlled
                                        onChange={handleInstallmentCountChange} // Trigger auto-calc
                                        placeholder="12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor da Parcela</Label>
                                    <Input
                                        type="text"
                                        name="installment_amount_display"
                                        required={isInstallment}
                                        value={installmentAmountStr}
                                        onChange={handleInstallmentAmountChange}
                                        placeholder="R$ 0,00"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button type="submit">Criar Lançamento</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

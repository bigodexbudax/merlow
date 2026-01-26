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

// Helper types
type ListOption = { id: string; name: string }

interface EditEventDialogProps {
    event: {
        id: string
        description: string | null
        amount: number
        event_date: string
        account_id: string | null
        category_id: string | null
        entity_id: string | null
    }
    accounts: ListOption[]
    categories: ListOption[]
    entities: ListOption[]
    trigger?: React.ReactNode
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

export function EditEventDialog({ event, accounts, categories, entities, trigger, onOpenChange, defaultOpen = false }: EditEventDialogProps) {
    const [open, setOpen] = useState(defaultOpen)

    const handleSubmit = async (formData: FormData) => {
        // bind the ID
        const result = await updateFinancialEvent(event.id, null, formData)
        if (result.success) {
            setOpen(false)
            if (onOpenChange) onOpenChange(false)
        } else {
            alert('Erro ao atualizar lançamento: ' + JSON.stringify(result.error))
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (onOpenChange) onOpenChange(val)
        }}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Editar</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Lançamento</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4 py-4">
                    {/* Read-only info context */}
                    <div className="text-sm text-muted-foreground mb-4">
                        <span className="font-semibold">{event.event_date}</span> - <span className="font-bold text-foreground">R$ {event.amount}</span>
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input name="description" defaultValue={event.description || ''} placeholder="Descrição" />
                    </div>

                    <div className="space-y-2">
                        <Label>Conta/Perfil</Label>
                        <Select name="account_id" defaultValue={event.account_id || undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select name="category_id" defaultValue={event.category_id || undefined}>
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
                        <Select name="entity_id" defaultValue={event.entity_id || undefined}>
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

                    <div className="flex justify-end pt-4">
                        <Button type="submit">Salvar Alterações</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

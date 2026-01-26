"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
    id: string
    name: string
}

interface InlineComboboxProps {
    options: Option[]
    value?: string
    onChange: (value: string) => void
    onAdd?: (name: string) => Promise<string | null>
    placeholder?: string
    emptyMessage?: string
    className?: string
    name?: string // Added for hidden input name
}

export function InlineCombobox({
    options,
    value,
    onChange,
    onAdd,
    placeholder = "Selecione...",
    emptyMessage = "Nenhum item encontrado.",
    className,
    name,
}: InlineComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    const selectedOption = options.find((opt) => opt.id === value)

    const handleAdd = async () => {
        if (!onAdd || !search) return
        const newId = await onAdd(search)
        if (newId) {
            onChange(newId)
            setOpen(false)
            setSearch("")
        }
    }

    return (
        <div className={cn("w-full", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11 px-3 font-normal"
                    >
                        <span className="truncate">
                            {selectedOption ? selectedOption.name : placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder={`Procurar...`}
                            value={search}
                            onValueChange={setSearch}
                        />
                        <CommandList>
                            <CommandEmpty className="p-2">
                                <p className="text-xs text-muted-foreground mb-2 px-1">{emptyMessage}</p>
                                {onAdd && search && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="w-full justify-start gap-2 h-8 text-xs font-bold uppercase tracking-tight"
                                        onClick={handleAdd}
                                    >
                                        <Plus className="h-3 w-3" /> Criar "{search}"
                                    </Button>
                                )}
                            </CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.id}
                                        value={option.name}
                                        onSelect={() => {
                                            onChange(option.id)
                                            setOpen(false)
                                            setSearch("")
                                        }}
                                        className="text-sm"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {name && <input type="hidden" name={name} value={value || ""} />}
        </div>
    )
}

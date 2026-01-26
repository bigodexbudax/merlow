"use client"

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar as CalendarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { addMonths, format, subMonths, setMonth, setYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'

export function MonthNav({ currentMonth }: { currentMonth: Date }) {
    const router = useRouter()

    const handleNavigate = (date: Date) => {
        const y = date.getFullYear()
        const m = date.getMonth() + 1
        router.push(`/?month=${m}&year=${y}`)
    }

    const months = Array.from({ length: 12 }, (_, i) => {
        const date = setMonth(new Date(), i)
        return {
            index: i,
            name: format(date, 'MMM', { locale: ptBR })
        }
    })

    return (
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => handleNavigate(subMonths(currentMonth, 1))}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            className="px-3 h-8 gap-2 font-bold text-sm uppercase tracking-tight hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />
                            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="center">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleNavigate(setYear(currentMonth, currentMonth.getFullYear() - 1))}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <span className="font-bold text-sm">{currentMonth.getFullYear()}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleNavigate(setYear(currentMonth, currentMonth.getFullYear() + 1))}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            {months.map((m) => {
                                const isCurrent = currentMonth.getMonth() === m.index
                                return (
                                    <Button
                                        key={m.index}
                                        variant={isCurrent ? "default" : "ghost"}
                                        className={cn(
                                            "h-9 text-[11px] font-bold uppercase tracking-tighter rounded-md",
                                            isCurrent && "bg-[#4c2ab4] hover:bg-[#3d2190]"
                                        )}
                                        onClick={() => handleNavigate(setMonth(currentMonth, m.index))}
                                    >
                                        {m.name}
                                    </Button>
                                )
                            })}
                        </div>
                    </PopoverContent>
                </Popover>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => handleNavigate(addMonths(currentMonth, 1))}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                    const now = new Date()
                    router.push(`/?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
                }}
                className="h-8 px-4 font-bold text-[10px] uppercase tracking-widest bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-none rounded-lg"
            >
                Hoje
            </Button>
        </div>
    )
}

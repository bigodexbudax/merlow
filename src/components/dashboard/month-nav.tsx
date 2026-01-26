'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { addMonths, format, subMonths, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function MonthNav({ currentMonth }: { currentMonth: Date }) {
    const router = useRouter()

    const handleNavigate = (date: Date) => {
        const y = date.getFullYear()
        const m = date.getMonth() + 1 // 1-indexed for URL clarity
        router.push(`/?month=${m}&year=${y}`)
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={() => handleNavigate(subMonths(currentMonth, 1))}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                onClick={() => handleNavigate(new Date())}
                className="w-24"
            >
                Hoje
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={() => handleNavigate(addMonths(currentMonth, 1))}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            <span className="text-lg font-medium ml-2 capitalize w-40 text-center">
                {format(currentMonth, 'MMMM / yyyy', { locale: ptBR })}
            </span>
        </div>
    )
}

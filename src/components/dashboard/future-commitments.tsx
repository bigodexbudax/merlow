'use client'

import { useEffect, useRef, useState } from 'react'
import { formatCurrency } from '@/utils/format'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface FutureCommitmentsItem {
  month: string
  amount: number
  monthKey: string
  isCurrent?: boolean
}

interface FutureCommitmentsProps {
  data: FutureCommitmentsItem[]
}

const BAR_MAX_HEIGHT = 80

export function FutureCommitments({ data }: FutureCommitmentsProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [openMonthKey, setOpenMonthKey] = useState<string | null>(null)

  useEffect(() => {
    const currentIndex = data.findIndex((d) => d.isCurrent)
    if (currentIndex === -1 || !sliderRef.current) return
    const child = sliderRef.current.children[currentIndex] as HTMLElement
    child?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' })
  }, [data])

  if (data.length === 0) return null

  const maxAmount = Math.max(...data.map((d) => d.amount), 1)

  return (
    <div className="space-y-4 w-full">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Próximos Meses
      </h3>

      <div
        ref={sliderRef}
        className="flex gap-1 w-full overflow-x-auto overflow-y-hidden pb-2 -mx-0.5 snap-x snap-mandatory scroll-smooth touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {data.map((item) => (
          <Tooltip
            key={item.monthKey}
            delayDuration={0}
            open={openMonthKey === item.monthKey}
            onOpenChange={(open) => setOpenMonthKey(open ? item.monthKey : null)}
          >
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex-shrink-0 flex flex-col items-center justify-end gap-1 w-[20%] min-w-[64px] max-w-[80px] snap-center rounded-md py-2 px-1 min-h-[44px] cursor-pointer touch-manipulation',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  item.isCurrent && 'bg-muted/60'
                )}
                role="button"
                tabIndex={0}
                aria-label={`${item.month}: ${formatCurrency(item.amount)}`}
                onClick={() => setOpenMonthKey((prev) => (prev === item.monthKey ? null : item.monthKey))}
              >
                <span
                  className={cn(
                    'text-xs font-medium uppercase tracking-tight truncate w-full text-center',
                    item.isCurrent
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.month.slice(0, 3)}
                </span>
                {/* Área da barra com min-height para toque no mobile; clique/touch abre o valor */}
                <div
                  className="w-full max-w-[90%] min-h-[32px] flex flex-col justify-end items-center flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMonthKey((prev) => (prev === item.monthKey ? null : item.monthKey))
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  role="presentation"
                >
                  <div
                    className="w-full rounded-t-md min-h-[4px] transition-all touch-manipulation"
                    style={{
                      height: Math.max(4, (item.amount / maxAmount) * BAR_MAX_HEIGHT),
                      background: item.isCurrent
                        ? 'linear-gradient(180deg, var(--chart-2), var(--chart-1))'
                        : 'var(--chart-1)',
                      opacity: item.amount === 0 ? 0.35 : 1,
                    }}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8} className="flex flex-col gap-0.5">
              <span className="capitalize font-medium">{item.month}</span>
              <span className="opacity-90">{formatCurrency(item.amount)}</span>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

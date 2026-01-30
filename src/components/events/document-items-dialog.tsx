'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getDocumentItems, type DocumentItemRow } from '@/app/events/actions'
import { formatCurrency } from '@/utils/format'
import { FileText, Loader2 } from 'lucide-react'

interface DocumentItemsDialogProps {
  financialEventId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentItemsDialog({
  financialEventId,
  open,
  onOpenChange,
}: DocumentItemsDialogProps) {
  const [items, setItems] = useState<DocumentItemRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !financialEventId) return
    setLoading(true)
    setError(null)
    getDocumentItems(financialEventId).then((result) => {
      setLoading(false)
      if (result.success) {
        setItems(result.items)
      } else {
        setError(result.error)
      }
    })
  }, [open, financialEventId])

  const total = items.reduce((acc, i) => acc + (i.total_price ?? 0), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5 text-zinc-500" />
            Itens da Nota
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 py-4">{error}</p>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Nenhum item encontrado nesta nota.
            </p>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="space-y-4">
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-900/50"
                  >
                    <div className="font-medium text-sm">{item.description}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      {item.quantity != null && (
                        <span>Qtde.: {String(item.quantity)}</span>
                      )}
                      {item.unit && <span>UN: {item.unit}</span>}
                      {item.sku && <span>Código: {item.sku}</span>}
                    </div>
                    <div className="flex justify-between items-baseline mt-2 text-sm">
                      {item.unit_price != null && (
                        <span className="text-muted-foreground">
                          Unit.: {formatCurrency(item.unit_price)}
                        </span>
                      )}
                      {item.total_price != null && (
                        <span className="font-semibold">
                          {formatCurrency(item.total_price)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-end">
                <span className="text-base font-bold">
                  Total: {formatCurrency(total)}
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

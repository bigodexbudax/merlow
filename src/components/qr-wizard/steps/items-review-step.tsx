'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { DocumentItem } from '@/types/qr-code'
import { ArrowLeft, Edit, Trash2, Package } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

interface ItemsReviewStepProps {
  items: DocumentItem[]
  onNext: (items: DocumentItem[]) => void
  onBack: () => void
}

export function ItemsReviewStep({ items, onNext, onBack }: ItemsReviewStepProps) {
  const [editableItems, setEditableItems] = useState<DocumentItem[]>([...items])
  const [editingItem, setEditingItem] = useState<DocumentItem | null>(null)
  const [editDialog, setEditDialog] = useState(false)

  // Form state para edição
  const [editDescription, setEditDescription] = useState('')
  const [editQuantity, setEditQuantity] = useState('')
  const [editUnitPrice, setEditUnitPrice] = useState('')
  const [editUnit, setEditUnit] = useState('')

  const handleEditClick = (item: DocumentItem) => {
    setEditingItem(item)
    setEditDescription(item.description)
    setEditQuantity(item.quantity?.toString() || '')
    setEditUnitPrice(item.unitPrice?.toString() || '')
    setEditUnit(item.unit || '')
    setEditDialog(true)
  }

  const handleSaveEdit = () => {
    if (!editingItem) return

    const updatedItems = editableItems.map(item => {
      if (item === editingItem) {
        const qty = parseFloat(editQuantity) || null
        const price = parseFloat(editUnitPrice) || null
        const total = qty && price ? qty * price : null

        return {
          ...item,
          description: editDescription,
          quantity: qty,
          unitPrice: price,
          totalPrice: total,
          unit: editUnit || null
        }
      }
      return item
    })

    setEditableItems(updatedItems)
    setEditDialog(false)
    setEditingItem(null)
  }

  const handleRemoveItem = (item: DocumentItem) => {
    setEditableItems(prev => prev.filter(i => i !== item))
  }

  const handleSubmit = () => {
    onNext(editableItems)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Itens da Nota</h2>
        <p className="text-muted-foreground mt-1">
          Revise os itens da nota fiscal. Você pode editar ou remover itens antes de salvar.
        </p>
      </div>

      {editableItems.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Nenhum item na lista. Você pode prosseguir sem itens ou voltar para ler a nota novamente.
          </p>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{item.description}</span>
                      {item.sku && (
                        <span className="text-xs text-muted-foreground">
                          Cód: {item.sku}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity ? `${item.quantity} ${item.unit || ''}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.unitPrice ? formatCurrency(item.unitPrice) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.totalPrice ? formatCurrency(item.totalPrice) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(item)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog de Edição */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantidade</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  step="0.001"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unidade</Label>
                <Input
                  id="edit-unit"
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  placeholder="kg, un, lt..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Preço Unitário</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={editUnitPrice}
                onChange={(e) => setEditUnitPrice(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Botões de Navegação */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button type="button" onClick={handleSubmit} className="flex-1">
          Salvar Lançamento
        </Button>
      </div>

      {editableItems.length > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          {editableItems.length} {editableItems.length === 1 ? 'item' : 'itens'} será salvo
        </p>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InlineCombobox } from '@/components/ui/inline-combobox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { quickCreateCategory, quickCreateEntity } from '@/app/events/actions'
import { ParsedDocumentData, EventData } from '@/types/qr-code'
import { AlertCircle, CreditCard, Wallet, QrCode, Banknote, FileText, MoreHorizontal, ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventSummaryStepProps {
  parsedDocument: ParsedDocumentData
  categories: Array<{ id: string; name: string }>
  entities: Array<{ id: string; name: string }>
  initialData?: EventData | null
  onNext: (data: EventData) => void
  onBack: () => void
}

const PAYMENT_METHODS = [
  { id: 'credito', label: 'Crédito', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50/50' },
  { id: 'debito', label: 'Débito', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
  { id: 'pix', label: 'Pix', icon: QrCode, color: 'text-cyan-600', bg: 'bg-cyan-50/50' },
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: 'text-amber-600', bg: 'bg-amber-50/50' },
  { id: 'boleto', label: 'Boleto', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50/50' },
  { id: 'outro', label: 'Outro', icon: MoreHorizontal, color: 'text-zinc-600', bg: 'bg-zinc-50/50' },
]

export function EventSummaryStep({ 
  parsedDocument, 
  categories, 
  entities, 
  initialData,
  onNext, 
  onBack 
}: EventSummaryStepProps) {
  // Se tem initialData, usar esses valores, senão usar do parsedDocument
  const [eventDate, setEventDate] = useState(
    initialData?.event_date || parsedDocument.dataCompra || new Date().toISOString().split('T')[0]
  )
  const [amountStr, setAmountStr] = useState('')
  const [description, setDescription] = useState(
    initialData?.description || parsedDocument.estabelecimento || ''
  )
  const [categoryId, setCategoryId] = useState<string>(initialData?.category_id || '')
  const [entityId, setEntityId] = useState<string>(initialData?.entity_id || '')
  const [paymentMethod, setPaymentMethod] = useState<string>(
    initialData?.payment_method || parsedDocument.formaPagamento || ''
  )
  const [error, setError] = useState<string | null>(null)

  // Formatar valor inicial
  useEffect(() => {
    const valorInicial = initialData?.amount || parsedDocument.valorAPagar
    if (valorInicial !== null && valorInicial !== undefined) {
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valorInicial)
      setAmountStr(formatted)
    }
  }, [initialData, parsedDocument.valorAPagar])

  // Currency Formatter
  const formatCurrency = (value: string) => {
    const numeric = value.replace(/\D/g, '')
    const floatVal = Number(numeric) / 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(floatVal)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountStr(formatCurrency(e.target.value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validações
    const amount = Number(amountStr.replace(/[^\d]/g, '')) / 100
    if (!amount || amount <= 0) {
      setError('Valor deve ser maior que zero')
      return
    }

    if (!eventDate) {
      setError('Data é obrigatória')
      return
    }

    if (!paymentMethod) {
      setError('Selecione um método de pagamento')
      return
    }

    // Montar dados do evento
    const eventData: EventData = {
      amount,
      event_date: eventDate,
      description: description || null,
      category_id: categoryId || null,
      entity_id: entityId || null,
      payment_method: paymentMethod as any
    }

    onNext(eventData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Revisar Lançamento</h2>
        <p className="text-muted-foreground mt-1">
          Confirme e edite os dados do evento financeiro
        </p>
      </div>

      {/* Data e Valor */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event_date">Data</Label>
          <Input
            id="event_date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            type="text"
            value={amountStr}
            onChange={handleAmountChange}
            placeholder="R$ 0,00"
            required
          />
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição do lançamento"
        />
      </div>

      {/* Método de Pagamento */}
      <div className="space-y-2">
        <Label>Método de Pagamento *</Label>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon
            const isSelected = paymentMethod === method.id
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <Icon className={cn('h-5 w-5', isSelected ? 'text-primary' : method.color)} />
                <span className={cn('text-xs font-medium', isSelected && 'text-primary')}>
                  {method.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <Label>Categoria</Label>
        <InlineCombobox
          options={categories}
          value={categoryId}
          onChange={setCategoryId}
          placeholder="Selecione ou crie uma categoria"
          onAdd={async (name) => {
            const id = await quickCreateCategory(name)
            if (id) {
              setCategoryId(id)
              return id
            }
            return null
          }}
        />
      </div>

      {/* Entidade */}
      <div className="space-y-2">
        <Label>Empresa / Entidade</Label>
        <InlineCombobox
          options={entities}
          value={entityId}
          onChange={setEntityId}
          placeholder="Selecione ou crie uma entidade"
          onAdd={async (name) => {
            const id = await quickCreateEntity(name)
            if (id) {
              setEntityId(id)
              return id
            }
            return null
          }}
        />
        {parsedDocument.estabelecimento && !entityId && (
          <p className="text-xs text-muted-foreground">
            Sugestão: {parsedDocument.estabelecimento}
          </p>
        )}
      </div>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Botões */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button type="submit" className="flex-1">
          Próximo: Revisar Itens
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}

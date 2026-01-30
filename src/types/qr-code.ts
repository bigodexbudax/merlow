// Item individual da nota fiscal
export interface DocumentItem {
  description: string
  sku: string | null
  quantity: number | null
  unit: string | null
  unitPrice: number | null
  totalPrice: number | null
  rawData: string // HTML original do bloco
}

// Dados extraídos do HTML da nota
export interface ParsedDocumentData {
  chaveAcesso: string | null // 44 dígitos
  estabelecimento: string | null
  cnpj: string | null
  dataCompra: string | null // YYYY-MM-DD
  valorAPagar: number | null // com desconto aplicado
  formaPagamento: 'credito' | 'debito' | 'pix' | 'dinheiro' | 'boleto' | 'outro' | null
  items: DocumentItem[]
  rawHtml: string // HTML completo
  rawUrl: string // URL original do QR
}

// Dados do evento financeiro (Step 2)
export interface EventData {
  amount: number
  event_date: string // YYYY-MM-DD
  description: string | null
  category_id: string | null
  entity_id: string | null
  payment_method: 'credito' | 'debito' | 'pix' | 'dinheiro' | 'boleto' | 'outro'
}

// Estado completo do wizard
export interface WizardState {
  parsedDocument: ParsedDocumentData | null
  eventData: EventData | null
  items: DocumentItem[] // itens mantidos após edição no Step 3
}

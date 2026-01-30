import { DocumentItem, ParsedDocumentData } from '@/types/qr-code'

/**
 * Converte data DD/MM/YYYY para YYYY-MM-DD
 */
function convertDate(dateStr: string): string | null {
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (!match) return null
  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

/**
 * Converte string monetária brasileira para número
 * Ex: "1.234,56" → 1234.56
 */
function parseMoneyValue(value: string): number | null {
  if (!value) return null
  try {
    // Remove pontos de milhar e substitui vírgula por ponto
    const cleaned = value.replace(/\./g, '').replace(',', '.')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  } catch {
    return null
  }
}

/**
 * Mapeia forma de pagamento do texto para enum
 */
function mapPaymentMethod(texto: string | null): 'credito' | 'debito' | 'pix' | 'dinheiro' | 'boleto' | 'outro' | null {
  if (!texto) return null
  const lower = texto.toLowerCase()
  if (lower.includes('crédito') || lower.includes('credito')) return 'credito'
  if (lower.includes('débito') || lower.includes('debito')) return 'debito'
  if (lower.includes('pix')) return 'pix'
  if (lower.includes('dinheiro')) return 'dinheiro'
  if (lower.includes('boleto')) return 'boleto'
  return 'outro'
}

/**
 * Extrai itens da nota fiscal do HTML
 * Usa estrutura específica do HTML da NFC-e do PR com classes CSS
 */
function extractItems(html: string): DocumentItem[] {
  const items: DocumentItem[] = []
  
  // Encontrar cada <tr id="Item + X">
  const trPattern = /<tr id="Item \+ \d+">([\s\S]*?)<\/tr>/gi
  
  let match
  while ((match = trPattern.exec(html)) !== null) {
    const trContent = match[1]
    
    // Extrair nome do produto: <span class="txtTit2">NOME</span>
    const nameMatch = trContent.match(/<span class="txtTit2">([^<]+)<\/span>/)
    const description = nameMatch ? nameMatch[1].trim() : ''
    
    // Extrair código: <span class="RCod">(Código: XXX)</span>
    const skuMatch = trContent.match(/<span class="RCod">\(C[óo]digo:\s*(\d+)\)<\/span>/)
    const sku = skuMatch ? skuMatch[1] : null
    
    // Extrair quantidade: <strong>Qtde.:</strong>0,384
    const qtyMatch = trContent.match(/<strong>Qtde\.:<\/strong>([\d,]+)/)
    const quantity = qtyMatch ? parseMoneyValue(qtyMatch[1]) : null
    
    // Extrair unidade: <strong>UN: </strong>kg
    const unitMatch = trContent.match(/<strong>UN:\s*<\/strong>(\w+)/)
    const unit = unitMatch ? unitMatch[1].toLowerCase() : null
    
    // Extrair preço unitário: <strong>Vl. Unit.:</strong> 59,98
    const unitPriceMatch = trContent.match(/<strong>Vl\.\s*Unit\.:<\/strong>\s*([\d,]+)/)
    const unitPrice = unitPriceMatch ? parseMoneyValue(unitPriceMatch[1]) : null
    
    // Extrair valor total: <span class="valor">23,03</span>
    const totalPriceMatch = trContent.match(/<span class="valor">([\d,]+)<\/span>/)
    const totalPrice = totalPriceMatch ? parseMoneyValue(totalPriceMatch[1]) : null
    
    if (description) {
      items.push({
        description,
        sku,
        quantity,
        unit,
        unitPrice,
        totalPrice,
        rawData: trContent.slice(0, 300).trim()
      })
    }
  }
  
  return items
}

/**
 * Faz parse do HTML da NFC-e/NF-e
 * Extração heurística (best-effort) - campos faltantes retornam null
 */
export function parseNfceHtml(html: string, rawUrl: string): ParsedDocumentData {
  // 1. Chave de acesso (44 dígitos)
  const chaveMatch = html.match(/(\d[\d\s]{42,})/)
  const chaveAcesso = chaveMatch ? chaveMatch[1].replace(/\s/g, '') : null
  
  // 2. Estabelecimento (nome do comerciante)
  // HTML específico: <div id="u20" class="txtTopo">FESTVAL</div>
  let estabelecimento: string | null = null
  const estabMatch = html.match(/<div[^>]*class="txtTopo"[^>]*>([^<]+)<\/div>/)
  if (estabMatch) {
    estabelecimento = estabMatch[1].trim()
  }
  
  // Fallback: pegar antes do CNPJ
  if (!estabelecimento) {
    const estabMatch2 = html.match(/\n\s*([A-Z\s]{3,50})\s*CNPJ/)
    if (estabMatch2) {
      estabelecimento = estabMatch2[1].trim()
    }
  }
  
  // 3. CNPJ
  const cnpjMatch = html.match(/CNPJ:?\s*([\d.\/\-]+)/)
  const cnpj = cnpjMatch ? cnpjMatch[1] : null
  
  // 4. Data da compra
  // Busca específica: <strong> Emissão: </strong>28/01/2026
  const dataMatch = html.match(/<strong>\s*Emiss[ãa]o:\s*<\/strong>\s*(\d{2}\/\d{2}\/\d{4})/i)
  const dataCompra = dataMatch ? convertDate(dataMatch[1]) : null
  
  // 5. Valores financeiros
  // ⚠️ Usar sempre "Valor a pagar" (com desconto aplicado)
  // Busca específica: <span class="totalNumb txtMax">383,06</span>
  const valorPagarMatch = html.match(/<label>Valor\s+a\s+pagar\s+R\$:<\/label>[\s\S]{0,100}?<span[^>]*class="totalNumb[^"]*"[^>]*>([\d,]+)<\/span>/i)
  const valorAPagar = valorPagarMatch ? parseMoneyValue(valorPagarMatch[1]) : null
  
  // 6. Forma de pagamento
  // Busca específica: <label class="tx">Cartão de Crédito</label>
  const pagamentoMatch = html.match(/<label\s+class="tx">([^<]+)<\/label>/)
  const formaPagamento = pagamentoMatch ? mapPaymentMethod(pagamentoMatch[1].trim()) : null
  
  // 7. Extrair itens
  const items = extractItems(html)
  
  return {
    chaveAcesso,
    estabelecimento,
    cnpj,
    dataCompra,
    valorAPagar,
    formaPagamento,
    items,
    rawHtml: html,
    rawUrl
  }
}

/**
 * Valida se uma URL é um QR Code fiscal válido
 */
export function isValidFiscalQrUrl(url: string): boolean {
  if (!url) return false
  
  // Padrões conhecidos de URL fiscal
  const patterns = [
    /fazenda\.(pr|sp|mg|rj|rs|sc|ba|pe|ce|go|df|es|pa|am|ma|pb|rn|pi|al|se|to|ac|ap|ro|rr|mt|ms)\.gov\.br/i,
    /nfe\.fazenda\.gov\.br/i,
    /nfce/i,
  ]
  
  return patterns.some(pattern => pattern.test(url))
}

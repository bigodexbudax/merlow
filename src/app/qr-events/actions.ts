'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { parseNfceHtml } from '@/utils/qr-parser'
import { WizardState } from '@/types/qr-code'

/** Log enviado pelo cliente: aparece no console do servidor (útil para debug no mobile). */
export async function logFromClient(
  level: 'log' | 'warn' | 'error',
  message: string,
  detail?: string
) {
  const fn = console[level]
  if (detail != null) fn(`[QR] ${message}`, detail)
  else fn(`[QR] ${message}`)
}

/**
 * Faz fetch do HTML da nota fiscal e retorna dados parseados
 */
function normalizeQrUrl(url: string): string {
  return url.trim().replace(/\s+/g, '')
}

const SERVER_FETCH_TIMEOUT_MS = 10_000

export async function fetchNfceHtml(qrUrl: string) {
  try {
    const url = normalizeQrUrl(qrUrl)
    // Validação básica
    if (!url || !url.startsWith('http')) {
      return { error: 'URL inválida' }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), SERVER_FETCH_TIMEOUT_MS)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return { error: 'Erro ao buscar nota fiscal. Verifique a URL.' }
    }

    const html = await response.text()
    
    // Parse do HTML
    const parsed = parseNfceHtml(html, url)
    
    // Validação mínima: deve ter pelo menos chave de acesso ou valor
    if (!parsed.chaveAcesso && !parsed.valorAPagar) {
      return { error: 'Não foi possível extrair dados da nota fiscal' }
    }

    return { success: true, data: parsed }
  } catch (error) {
    console.error('Erro ao buscar NFC-e:', error)
    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      return { error: 'Tempo esgotado ao buscar nota fiscal' }
    }
    return { error: 'Falha ao buscar dados da nota fiscal' }
  }
}

/**
 * Salva evento financeiro + documento + itens de forma atômica
 * ⚠️ Faz rollback manual se qualquer etapa falhar
 */
export async function saveQrCodeEvent(state: WizardState) {
  const supabase = await createClient()
  
  // Autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Validações finais
  if (!state.eventData) {
    return { error: 'Dados do evento incompletos' }
  }
  if (!state.parsedDocument) {
    return { error: 'Dados da nota fiscal não encontrados' }
  }

  // 1️⃣ Criar financial_event
  const { data: event, error: eventError } = await supabase
    .from('financial_events')
    .insert({
      user_id: user.id,
      amount: state.eventData.amount, // "Valor a pagar" (com desconto)
      event_date: state.eventData.event_date, // YYYY-MM-DD
      description: state.eventData.description, // Nome do estabelecimento
      category_id: state.eventData.category_id,
      entity_id: state.eventData.entity_id,
      payment_method: state.eventData.payment_method,
      source_type: 'qrcode', // ⚠️ tipo 'qrcode'
      status: 'confirmado'
    })
    .select('id')
    .single()

  if (eventError || !event) {
    console.error('Erro ao criar evento:', eventError)
    return { error: 'Falha ao criar evento financeiro', details: eventError?.message }
  }

  // 2️⃣ Criar document
  const { data: document, error: docError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      financial_event_id: event.id, // ⚠️ FK obrigatória
      type: 'link', // documento obtido via link (QR Code)
      external_id: state.parsedDocument.chaveAcesso, // 44 dígitos
      raw_text: state.parsedDocument.rawUrl, // URL original do QR
      raw_payload: { html: state.parsedDocument.rawHtml }, // ⚠️ HTML completo em JSONB
      source: 'nfce-html',
      processing_status: 'processado'
    })
    .select('id')
    .single()

  if (docError || !document) {
    console.error('Erro ao criar documento:', docError)
    // ⚠️ ROLLBACK: deletar evento criado
    await supabase.from('financial_events').delete().eq('id', event.id)
    return { error: 'Falha ao criar documento', details: docError?.message }
  }

  // 3️⃣ Criar document_items (se houver)
  if (state.items && state.items.length > 0) {
    const itemsToInsert = state.items.map(item => ({
      user_id: user.id,
      document_id: document.id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      sku: item.sku,
      raw_data: { original: item.rawData } // JSONB original
    }))

    const { error: itemsError } = await supabase
      .from('document_items')
      .insert(itemsToInsert)

    if (itemsError) {
      console.error('Erro ao criar itens:', itemsError)
      // ⚠️ ROLLBACK: deletar documento (CASCADE deleta evento)
      await supabase.from('documents').delete().eq('id', document.id)
      return { error: 'Falha ao criar itens da nota', details: itemsError.message }
    }
  }

  // ✅ Sucesso
  revalidatePath('/')
  return { success: true, eventId: event.id }
}

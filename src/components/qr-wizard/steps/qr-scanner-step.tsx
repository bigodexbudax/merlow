'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QrScanner } from '../components/qr-scanner'
import { fetchNfceHtml, logFromClient } from '@/app/qr-events/actions'
import { parseNfceHtml } from '@/utils/qr-parser'
import { ParsedDocumentData } from '@/types/qr-code'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

interface QrScannerStepProps {
  onNext: (data: ParsedDocumentData) => void
}

export function QrScannerStep({ onNext }: QrScannerStepProps) {
  const [manualUrl, setManualUrl] = useState('')
  const [showManualUrl, setShowManualUrl] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<ParsedDocumentData | null>(null)
  const isProcessingRef = useRef(false)

  const normalizeUrl = (raw: string) => raw.trim().replace(/\s+/g, '')

  const handleProcessUrl = async (url: string) => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    setError(null)
    setIsLoading(true)
    setPreviewData(null)

    const normalizedUrl = normalizeUrl(url)
    if (!normalizedUrl) {
      setError('URL inválida')
      setIsLoading(false)
      return
    }

    try {
      // 1) Tentar carregar a página no cliente (GET sai do IP do usuário, como abrir a URL numa aba)
      let parsed: ParsedDocumentData | null = null
      try {
        const response = await fetch(normalizedUrl, {
          headers: {
            Accept: 'text/html',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          mode: 'cors'
        })
        if (response.ok) {
          const html = await response.text()
          parsed = parseNfceHtml(html, normalizedUrl)
        }
      } catch {
        // CORS ou rede: fallback para server action
      }

      // 2) Fallback: se o fetch no cliente falhou, usar server action
      if (!parsed) {
        const result = await fetchNfceHtml(normalizedUrl)
        if (result.error) {
          setError(result.error)
          logFromClient('error', 'QrScannerStep: erro da server action', result.error)
          return
        }
        if (result.success && result.data) {
          parsed = result.data
        }
      }

      if (parsed) {
        if (!parsed.chaveAcesso && !parsed.valorAPagar) {
          setError('Não foi possível extrair dados da nota fiscal')
          return
        }
        setPreviewData(parsed)
      } else {
        setError('Não foi possível carregar a página da nota. Verifique a URL ou tente abrir o link em outra aba.')
      }
    } catch (err) {
      setError('Erro ao processar QR Code')
      const detail = err instanceof Error ? err.message : String(err)
      logFromClient('error', 'QrScannerStep: erro ao processar', detail)
    } finally {
      setIsLoading(false)
      isProcessingRef.current = false
    }
  }

  const handleScanSuccess = (decodedUrl: string) => {
    setScanError(null)
    handleProcessUrl(decodedUrl.trim().replace(/\s+/g, ''))
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualUrl.trim()) {
      setError('Digite ou cole a URL do QR Code')
      return
    }
    handleProcessUrl(manualUrl.trim())
  }

  const handleConfirm = () => {
    if (previewData) {
      onNext(previewData)
    }
  }

  const foundData = !!previewData

  return (
    <div className="space-y-4">
      {/* Só mostra título + câmera + colar URL quando ainda não encontrou os dados */}
      {!foundData && (
        <>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Ler QR Code da Nota</h2>
            <p className="text-muted-foreground mt-1">
              Escaneie o QR Code da nota fiscal com a câmera
            </p>
          </div>

          <Card className="p-5">
            <QrScanner 
              onScan={handleScanSuccess}
              onError={setScanError}
            />
            {scanError && (
              <Alert variant="destructive" className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{scanError}</AlertDescription>
              </Alert>
            )}
          </Card>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowManualUrl((v) => !v)}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              {showManualUrl
                ? 'Ocultar opção de colar URL'
                : 'Não conseguiu ler o QR Code? Cole o link aqui'}
            </button>

            {showManualUrl && (
              <Card className="p-3">
                <form onSubmit={handleManualSubmit} className="space-y-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="qr-url" className="text-sm">URL da Nota Fiscal</Label>
                    <Input
                      id="qr-url"
                      type="url"
                      placeholder="http://www.fazenda.pr.gov.br/nfce/qrcode?p=..."
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      disabled={isLoading}
                      className="text-sm"
                    />
                  </div>
                  <Button type="submit" size="sm" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Analisar
                  </Button>
                </form>
              </Card>
            )}
          </div>
        </>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quando encontrou os dados: só o card de resultado (câmera/colar já sumiram) */}
      {previewData && (
        <Card className="p-5 bg-primary/5 border-2 border-primary shadow-lg ring-2 ring-primary/20 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Nota fiscal encontrada!</h3>
              <p className="text-xs text-muted-foreground">Dados extraídos com sucesso — confira abaixo</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 mb-3">
            {previewData.valorAPagar !== null && (
              <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5">Valor total</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {formatCurrency(previewData.valorAPagar)}
                </p>
              </div>
            )}
            {previewData.estabelecimento && (
              <div className="rounded-lg bg-primary/10 border border-primary/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5">Estabelecimento</p>
                <p className="text-base font-bold truncate" title={previewData.estabelecimento}>
                  {previewData.estabelecimento}
                </p>
              </div>
            )}
          </div>

          <Separator className="my-3" />

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Demais dados</p>
          <div className="space-y-2 text-sm">
            {previewData.dataCompra && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Data da compra</span>
                <span className="font-medium">
                  {new Date(previewData.dataCompra).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            {previewData.cnpj && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">CNPJ</span>
                <span className="font-mono text-xs">{previewData.cnpj}</span>
              </div>
            )}
            {previewData.items.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Itens na nota</span>
                <span className="font-medium">{previewData.items.length} produtos</span>
              </div>
            )}
          </div>

          <Button 
            onClick={handleConfirm} 
            className="w-full mt-4"
            size="lg"
          >
            Próximo: Revisar Lançamento
          </Button>
        </Card>
      )}
    </div>
  )
}

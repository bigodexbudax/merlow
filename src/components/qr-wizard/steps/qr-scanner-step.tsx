'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QrScanner } from '../components/qr-scanner'
import { fetchNfceHtml } from '@/app/qr-events/actions'
import { parseNfceHtml } from '@/utils/qr-parser'
import { ParsedDocumentData } from '@/types/qr-code'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

interface QrScannerStepProps {
  onNext: (data: ParsedDocumentData) => void
}

export function QrScannerStep({ onNext }: QrScannerStepProps) {
  const [manualUrl, setManualUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<ParsedDocumentData | null>(null)

  const normalizeUrl = (raw: string) => raw.trim().replace(/\s+/g, '')

  const handleProcessUrl = async (url: string) => {
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
    } finally {
      setIsLoading(false)
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ler QR Code da Nota</h2>
        <p className="text-muted-foreground mt-1">
          Escaneie o QR Code da nota fiscal ou cole a URL manualmente
        </p>
      </div>

      {/* Scanner de câmera */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Opção 1: Usar Câmera</h3>
        <QrScanner 
          onScan={handleScanSuccess}
          onError={setScanError}
        />
        {scanError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{scanError}</AlertDescription>
          </Alert>
        )}
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            ou
          </span>
        </div>
      </div>

      {/* Input manual */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Opção 2: Colar URL</h3>
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr-url">URL da Nota Fiscal</Label>
            <Input
              id="qr-url"
              type="url"
              placeholder="http://www.fazenda.pr.gov.br/nfce/qrcode?p=..."
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Cole a URL completa do QR Code da nota fiscal
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analisar
          </Button>
        </form>
      </Card>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Preview dos dados */}
      {previewData && (
        <Card className="p-6 bg-primary/5 border-primary">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">Nota fiscal encontrada!</h3>
              <p className="text-sm text-muted-foreground">
                Dados extraídos com sucesso
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3 text-sm">
            {previewData.estabelecimento && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estabelecimento:</span>
                <span className="font-medium">{previewData.estabelecimento}</span>
              </div>
            )}
            {previewData.cnpj && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">CNPJ:</span>
                <span className="font-mono text-xs">{previewData.cnpj}</span>
              </div>
            )}
            {previewData.dataCompra && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span className="font-medium">
                  {new Date(previewData.dataCompra).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            {previewData.valorAPagar !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(previewData.valorAPagar)}
                </span>
              </div>
            )}
            {previewData.items.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Itens:</span>
                <span className="font-medium">{previewData.items.length} produtos</span>
              </div>
            )}
          </div>

          <Button 
            onClick={handleConfirm} 
            className="w-full mt-6"
            size="lg"
          >
            Próximo: Revisar Lançamento
          </Button>
        </Card>
      )}
    </div>
  )
}

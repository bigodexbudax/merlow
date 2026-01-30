'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Camera, Loader2, X } from 'lucide-react'

interface QrScannerProps {
  onScan: (url: string) => void
  onError?: (error: string) => void
}

export function QrScanner({ onScan, onError }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const elementId = 'qr-reader'

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        console.error('Erro ao parar scanner:', err)
      }
    }
    setIsScanning(false)
  }

  const startScanning = async () => {
    try {
      setIsScanning(true)
      
      // Criar nova instância do scanner
      const html5QrCode = new Html5Qrcode(elementId)
      scannerRef.current = html5QrCode

      // Configurações do scanner
      const config = {
        fps: 10, // Frames por segundo
        qrbox: { width: 250, height: 250 }, // Área de scan
        aspectRatio: 1.0
      }

      // Iniciar scanner
      await html5QrCode.start(
        { facingMode: 'environment' }, // Câmera traseira em mobile
        config,
        (decodedText) => {
          // QR Code detectado!
          stopScanning()
          onScan(decodedText)
        },
        (errorMessage) => {
          // Ignorar erros de scan contínuo (são normais)
          // console.log('Scanning...', errorMessage)
        }
      )

      setHasPermission(true)
    } catch (err) {
      console.error('Erro ao iniciar scanner:', err)
      setIsScanning(false)
      setHasPermission(false)
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
          onError?.('Permissão de câmera negada')
        } else {
          onError?.('Erro ao acessar câmera')
        }
      }
    }
  }

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Área do scanner */}
      <div 
        id={elementId} 
        className={`${isScanning ? 'block' : 'hidden'} rounded-lg overflow-hidden border-2 border-primary`}
      />

      {/* Controles */}
      {!isScanning ? (
        <Button
          onClick={startScanning}
          size="lg"
          className="w-full"
        >
          <Camera className="mr-2 h-5 w-5" />
          Abrir Câmera
        </Button>
      ) : (
        <Button
          onClick={stopScanning}
          size="lg"
          variant="outline"
          className="w-full"
        >
          <X className="mr-2 h-5 w-5" />
          Cancelar
        </Button>
      )}

      {/* Mensagens de erro */}
      {hasPermission === false && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <p className="font-medium">Não foi possível acessar a câmera</p>
          <p className="mt-1">Verifique as permissões do navegador ou use o campo de texto abaixo.</p>
        </div>
      )}
    </div>
  )
}

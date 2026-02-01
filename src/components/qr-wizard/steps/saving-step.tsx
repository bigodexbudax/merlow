'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { saveQrCodeEvent, logFromClient } from '@/app/qr-events/actions'
import { WizardState } from '@/types/qr-code'
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'

interface SavingStepProps {
  state: WizardState
  onSuccess: () => void
  onBack: () => void
}

export function SavingStep({ state, onSuccess, onBack }: SavingStepProps) {
  const [status, setStatus] = useState<'saving' | 'success' | 'error'>('saving')
  const [error, setError] = useState<string | null>(null)
  const hasExecuted = useRef(false)

  useEffect(() => {
    // ✅ Garantir execução única, mesmo em React Strict Mode
    if (hasExecuted.current) return
    
    hasExecuted.current = true

    const save = async () => {
      try {
        const result = await saveQrCodeEvent(state)

        if (result.error) {
          setStatus('error')
          const msg = result.error + (result.details ? `: ${result.details}` : '')
          setError(msg)
          logFromClient('error', 'SavingStep: falha ao salvar (reportado ao usuário)', msg)
        } else if (result.success) {
          setStatus('success')
          // Aguardar um pouco para mostrar o sucesso antes de fechar
          setTimeout(() => {
            onSuccess()
          }, 1500)
        }
      } catch (err) {
        setStatus('error')
        setError('Erro inesperado ao salvar lançamento')
        const detail = err instanceof Error ? err.message : String(err)
        logFromClient('error', 'SavingStep: erro inesperado ao salvar', detail)
      }
    }

    save()
  }, []) // ✅ Array vazio = executa apenas na montagem do componente

  return (
    <div className="space-y-6">
      {status === 'saving' && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Salvando lançamento...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Criando evento financeiro, documento e itens
              </p>
            </div>
          </div>
        </Card>
      )}

      {status === 'success' && (
        <Card className="p-12 bg-emerald-50/50 border-emerald-200">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            <div>
              <h3 className="text-lg font-semibold text-emerald-900">
                Lançamento salvo com sucesso!
              </h3>
              <p className="text-sm text-emerald-700 mt-1">
                Redirecionando para o dashboard...
              </p>
            </div>
          </div>
        </Card>
      )}

      {status === 'error' && (
        <>
          <Card className="p-12 bg-destructive/5 border-destructive/20">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">Erro ao salvar</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Não foi possível completar o lançamento
                </p>
              </div>
            </div>
          </Card>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar e Corrigir
            </Button>
            <Button
              onClick={() => {
                // ✅ Resetar flag para permitir nova tentativa
                hasExecuted.current = false
                setStatus('saving')
                setError(null)
                
                // Marcar como executado novamente
                hasExecuted.current = true
                
                // Tentar novamente
                saveQrCodeEvent(state).then(result => {
                  if (result.error) {
                    setStatus('error')
                    const msg = result.error + (result.details ? `: ${result.details}` : '')
                    setError(msg)
                    logFromClient('error', 'SavingStep: falha ao salvar (reportado ao usuário)', msg)
                  } else if (result.success) {
                    setStatus('success')
                    setTimeout(onSuccess, 1500)
                  }
                })
              }}
              className="flex-1"
            >
              Tentar Novamente
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

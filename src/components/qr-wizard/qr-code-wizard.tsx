'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QrScannerStep } from './steps/qr-scanner-step'
import { EventSummaryStep } from './steps/event-summary-step'
import { ItemsReviewStep } from './steps/items-review-step'
import { SavingStep } from './steps/saving-step'
import { WizardState, ParsedDocumentData, EventData, DocumentItem } from '@/types/qr-code'
import { QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QrCodeWizardProps {
  categories: Array<{ id: string; name: string }>
  entities: Array<{ id: string; name: string }>
  children: React.ReactNode
}

export function QrCodeWizard({ categories, entities, children }: QrCodeWizardProps) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardState, setWizardState] = useState<WizardState>({
    parsedDocument: null,
    eventData: null,
    items: []
  })

  const handleStep1Complete = (data: ParsedDocumentData) => {
    setWizardState(prev => ({
      ...prev,
      parsedDocument: data,
      items: data.items
    }))
    setCurrentStep(2)
  }

  const handleStep2Complete = (eventData: EventData) => {
    setWizardState(prev => ({
      ...prev,
      eventData
    }))
    setCurrentStep(3)
  }

  const handleStep3Complete = (items: DocumentItem[]) => {
    setWizardState(prev => ({
      ...prev,
      items
    }))
    setCurrentStep(4)
  }

  const handleSaveSuccess = () => {
    // Fechar dialog e resetar wizard
    setOpen(false)
    setTimeout(() => {
      setCurrentStep(1)
      setWizardState({
        parsedDocument: null,
        eventData: null,
        items: []
      })
    }, 300)
  }

  const handleBack = (step: number) => {
    setCurrentStep(step)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">Lançamento via QR Code</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Passo {currentStep} de 4
              </p>
            </div>
          </div>

          {/* Stepper visual */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={cn(
                    'h-2 rounded-full flex-1 transition-colors',
                    step <= currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="mt-6">
          {currentStep === 1 && (
            <QrScannerStep onNext={handleStep1Complete} />
          )}

          {currentStep === 2 && wizardState.parsedDocument && (
            <EventSummaryStep
              parsedDocument={wizardState.parsedDocument}
              categories={categories}
              entities={entities}
              initialData={wizardState.eventData}
              onNext={handleStep2Complete}
              onBack={() => handleBack(1)}
            />
          )}

          {currentStep === 3 && (
            <ItemsReviewStep
              items={wizardState.items}
              onNext={handleStep3Complete}
              onBack={() => handleBack(2)}
            />
          )}

          {currentStep === 4 && (
            <SavingStep
              state={wizardState}
              onSuccess={handleSaveSuccess}
              onBack={() => handleBack(3)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

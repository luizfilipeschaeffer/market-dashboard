import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { processCsvFile, validateProcessedData, generateProcessingReport, ProcessedClient } from '@/lib/csvProcessor'
import { apiService } from '@/services/api'

interface BatchUploadModalProps {
  onUploadComplete?: (success: boolean, message: string) => void
}

interface UploadState {
  isUploading: boolean
  progress: number
  stage: 'idle' | 'processing' | 'uploading' | 'completed' | 'error'
  message: string
  details?: string
}

interface UploadResult {
  success: boolean
  totalClients: number
  totalBackups: number
  clientsResult: any
  backupsResult: any
  errors: string[]
}

export function BatchUploadModal({ onUploadComplete }: BatchUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    stage: 'idle',
    message: 'Selecione um arquivo CSV para fazer upload'
  })
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [processedData, setProcessedData] = useState<ProcessedClient[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadState({
        isUploading: false,
        progress: 0,
        stage: 'error',
        message: 'Por favor, selecione um arquivo CSV válido'
      })
      return
    }

    setUploadState({
      isUploading: true,
      progress: 10,
      stage: 'processing',
      message: 'Processando arquivo CSV...'
    })

    try {
      // Processar arquivo CSV
      const processed = await processCsvFile(file)
      setProcessedData(processed)

      // Validar dados
      const errors = validateProcessedData(processed)
      setValidationErrors(errors)

      if (errors.length > 0) {
        setUploadState({
          isUploading: false,
          progress: 0,
          stage: 'error',
          message: `Encontrados ${errors.length} erros de validação`,
          details: errors.slice(0, 5).join(', ') + (errors.length > 5 ? '...' : '')
        })
        return
      }

      // Gerar relatório de processamento
      const report = generateProcessingReport(
        processed.length,
        processed,
        errors
      )

      setUploadState({
        isUploading: false,
        progress: 100,
        stage: 'completed',
        message: `Arquivo processado com sucesso! ${report.processedClients} clientes e ${report.totalBackups} backups encontrados`
      })

    } catch (error) {
      console.error('Erro ao processar arquivo:', error)
      setUploadState({
        isUploading: false,
        progress: 0,
        stage: 'error',
        message: 'Erro ao processar arquivo CSV',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }, [])

  const handleUpload = useCallback(async () => {
    if (processedData.length === 0) return

    setUploadState({
      isUploading: true,
      progress: 0,
      stage: 'uploading',
      message: 'Iniciando upload para a API...'
    })

    try {
      const result = await apiService.uploadCsvData(processedData)
      setUploadResult(result)

      if (result.success) {
        setUploadState({
          isUploading: false,
          progress: 100,
          stage: 'completed',
          message: `Upload concluído com sucesso! ${result.clientsResult.successful} clientes e ${result.backupsResult.successful} backups criados`
        })
        onUploadComplete?.(true, 'Upload realizado com sucesso')
      } else {
        setUploadState({
          isUploading: false,
          progress: 0,
          stage: 'error',
          message: `Upload concluído com erros. ${result.clientsResult.successful} clientes e ${result.backupsResult.successful} backups criados`,
          details: result.errors.join(', ')
        })
        onUploadComplete?.(false, 'Upload concluído com erros')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      setUploadState({
        isUploading: false,
        progress: 0,
        stage: 'error',
        message: 'Erro durante o upload',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      })
      onUploadComplete?.(false, 'Erro durante o upload')
    }
  }, [processedData, onUploadComplete])

  const handleReset = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      stage: 'idle',
      message: 'Selecione um arquivo CSV para fazer upload'
    })
    setUploadResult(null)
    setProcessedData([])
    setValidationErrors([])
  }, [])

  const getStageIcon = () => {
    switch (uploadState.stage) {
      case 'idle':
        return <Upload className="h-5 w-5" />
      case 'processing':
      case 'uploading':
        return <Loader2 className="h-5 w-5 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getStageColor = () => {
    switch (uploadState.stage) {
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'processing':
      case 'uploading':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload em Lote
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload de Dados em Lote</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV com dados de clientes e backups para criar registros na API.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getStageIcon()}
                <span className={getStageColor()}>
                  {uploadState.stage === 'idle' && 'Selecionar Arquivo'}
                  {uploadState.stage === 'processing' && 'Processando'}
                  {uploadState.stage === 'uploading' && 'Fazendo Upload'}
                  {uploadState.stage === 'completed' && 'Concluído'}
                  {uploadState.stage === 'error' && 'Erro'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{uploadState.message}</p>
              
              {uploadState.details && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {uploadState.details}
                  </AlertDescription>
                </Alert>
              )}

              {(uploadState.stage === 'processing' || uploadState.stage === 'uploading') && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{uploadState.progress}%</span>
                  </div>
                  <Progress value={uploadState.progress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Input */}
          {uploadState.stage === 'idle' && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Selecione um arquivo CSV com dados de clientes
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="csv-file-input"
                    />
                    <Button asChild>
                      <label htmlFor="csv-file-input" className="cursor-pointer">
                        Selecionar Arquivo
                      </label>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Erros de Validação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Button */}
          {uploadState.stage === 'completed' && !uploadResult && (
            <div className="flex justify-center">
              <Button onClick={handleUpload} className="gap-2">
                <Upload className="h-4 w-4" />
                Fazer Upload para API
              </Button>
            </div>
          )}

          {/* Results */}
          {uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {uploadResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Resultado do Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {uploadResult.clientsResult.successful}
                    </div>
                    <div className="text-sm text-gray-600">Clientes Criados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadResult.backupsResult.successful}
                    </div>
                    <div className="text-sm text-gray-600">Backups Criados</div>
                  </div>
                </div>

                {uploadResult.clientsResult.failed > 0 && (
                  <div className="text-center">
                    <Badge variant="destructive">
                      {uploadResult.clientsResult.failed} clientes falharam
                    </Badge>
                  </div>
                )}

                {uploadResult.backupsResult.failed > 0 && (
                  <div className="text-center">
                    <Badge variant="destructive">
                      {uploadResult.backupsResult.failed} backups falharam
                    </Badge>
                  </div>
                )}

                {uploadResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Erros:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {uploadResult.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            {uploadState.stage === 'completed' || uploadState.stage === 'error' ? (
              <Button onClick={handleReset} variant="outline">
                Novo Upload
              </Button>
            ) : (
              <Button onClick={() => setIsOpen(false)} variant="outline">
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

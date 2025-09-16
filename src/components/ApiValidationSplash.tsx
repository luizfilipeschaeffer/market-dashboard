import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { LogoProgress } from './LogoProgress'
import { useApiValidation } from '@/hooks/useApiValidation'
import { CheckCircle, XCircle, Wifi, Loader2 } from 'lucide-react'

interface ApiValidationSplashProps {
  onComplete: (isApiAvailable: boolean) => void
  pageName?: string
}

export function ApiValidationSplash({ onComplete, pageName = 'página' }: ApiValidationSplashProps) {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState(`Carregando ${pageName}...`)
  const [showApiValidation, setShowApiValidation] = useState(false)
  const { actualTheme } = useTheme()
  
  const {
    isValidating,
    isApiAvailable,
    currentAttempt,
    maxAttempts,
    error,
    validateApi
  } = useApiValidation()

  // Efeito para controlar o progresso e transições
  useEffect(() => {
    if (isValidating) {
      setShowApiValidation(true)
      setLoadingText(`Validando API... (Tentativa ${currentAttempt}/${maxAttempts})`)
      
      // Progresso baseado nas tentativas
      const baseProgress = 20
      const attemptProgress = ((currentAttempt - 1) / maxAttempts) * 60
      setProgress(baseProgress + attemptProgress)
    } else if (isApiAvailable === true) {
      setLoadingText('API conectada! Carregando dados...')
      setProgress(80)
      
      // Simular carregamento de dados (otimizado para 200ms)
      setTimeout(() => {
        setProgress(100)
        setLoadingText('Carregamento concluído!')
        
        setTimeout(() => {
          onComplete(true)
        }, 100) // Reduzido para 100ms (igual ao TransitionSplash)
      }, 200) // Reduzido para 200ms
    } else if (isApiAvailable === false) {
      setLoadingText('Falha na conexão com a API')
      setProgress(100)
      
      setTimeout(() => {
        onComplete(false)
      }, 1000) // Reduzido de 2000ms para 1000ms
    }
  }, [isValidating, isApiAvailable, currentAttempt, maxAttempts]) // Removido onComplete das dependências

  // Iniciar validação quando o componente monta
  useEffect(() => {
    validateApi()
  }, [validateApi])

  const getStatusIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-6 w-6 animate-spin text-primary" />
    }
    
    if (isApiAvailable === true) {
      return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
    }
    
    if (isApiAvailable === false) {
      return <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
    }
    
    return <Wifi className="h-6 w-6 text-muted-foreground" />
  }

  const getStatusMessage = () => {
    if (isValidating) {
      return `Validando API... (Tentativa ${currentAttempt}/${maxAttempts})`
    }
    
    if (isApiAvailable === true) {
      return 'API conectada com sucesso!'
    }
    
    if (isApiAvailable === false) {
      return 'Falha ao conectar com a API'
    }
    
    return `Carregando ${pageName}...`
  }

  const getStatusDescription = () => {
    if (isValidating) {
      return 'Verificando disponibilidade da API. Aguarde...'
    }
    
    if (isApiAvailable === true) {
      return 'A API está respondendo normalmente. Carregando dados...'
    }
    
    if (isApiAvailable === false) {
      return error || 'Não foi possível conectar com a API após múltiplas tentativas.'
    }
    
    return 'Preparando para validar a conexão com a API...'
  }

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-8">
        {/* Logo Principal com Animação */}
        <div className="flex items-center justify-center">
          <div className="w-96 h-24">
            <LogoProgress
              progress={progress}
              size="xl"
              color={actualTheme === 'dark' ? '#ffffff' : '#2B6198'}
              animated={true}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Texto do Dashboard */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Dashboard de Gestão</p>
        </div>

        {/* Status da API */}
        {showApiValidation && (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-sm font-medium text-foreground">
                {getStatusMessage()}
              </span>
            </div>
            
            <div className="text-center max-w-md">
              <p className="text-xs text-muted-foreground">
                {getStatusDescription()}
              </p>
            </div>

            {/* Barra de progresso das tentativas */}
            {isValidating && (
              <div className="space-y-2">
                <div className="flex justify-center space-x-2">
                  {Array.from({ length: maxAttempts }, (_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index < currentAttempt
                          ? 'bg-red-500'
                          : index === currentAttempt - 1
                          ? 'bg-primary animate-pulse'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tentativa {currentAttempt} de {maxAttempts}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Texto de Status principal */}
        <div className="w-80 text-center mt-8">
          <div className="text-sm text-muted-foreground mb-2">
            {loadingText}
          </div>
          <div className="text-xs text-muted-foreground/70">
            {Math.round(progress)}% concluído
          </div>
        </div>

        {/* Indicador de Carregamento */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

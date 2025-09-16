import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

export interface ApiValidationState {
  isValidating: boolean
  isApiAvailable: boolean | null
  currentAttempt: number
  maxAttempts: number
  error: string | null
  lastValidationTime: number | null
}

export interface ApiValidationConfig {
  maxAttempts?: number
  retryDelay?: number
  validationEndpoint?: string
}

const DEFAULT_CONFIG: Required<ApiValidationConfig> = {
  maxAttempts: 3,
  retryDelay: 1500, // 1.5 segundos (reduzido de 2s)
  validationEndpoint: '/api/dashboard/backup/resumo' // Endpoint que sabemos que existe
}

export function useApiValidation(config: ApiValidationConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  const [state, setState] = useState<ApiValidationState>({
    isValidating: false,
    isApiAvailable: null,
    currentAttempt: 0,
    maxAttempts: finalConfig.maxAttempts,
    error: null,
    lastValidationTime: null
  })

  const validateApi = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isValidating: true,
      currentAttempt: 0,
      error: null
    }))

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        setState(prev => ({
          ...prev,
          currentAttempt: attempt
        }))

        // Tentar fazer uma requisição simples para validar a API
        await api.backups.getStats()
        
        // Se chegou aqui, a API está disponível
        setState(prev => ({
          ...prev,
          isValidating: false,
          isApiAvailable: true,
          error: null,
          lastValidationTime: Date.now()
        }))
        return true

      } catch (error) {
        console.warn(`Tentativa ${attempt}/${finalConfig.maxAttempts} falhou:`, error)
        
        // Se não é a última tentativa, aguarda antes de tentar novamente
        if (attempt < finalConfig.maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, finalConfig.retryDelay))
        }
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    setState(prev => ({
      ...prev,
      isValidating: false,
      isApiAvailable: false,
      error: 'API não está respondendo após múltiplas tentativas'
    }))
    return false
  }, [finalConfig.maxAttempts, finalConfig.retryDelay])

  const resetValidation = useCallback(() => {
    setState({
      isValidating: false,
      isApiAvailable: null,
      currentAttempt: 0,
      maxAttempts: finalConfig.maxAttempts,
      error: null,
      lastValidationTime: null
    })
  }, [finalConfig.maxAttempts])

  // Auto-validar quando o hook é montado
  useEffect(() => {
    validateApi()
  }, [validateApi])

  return {
    ...state,
    validateApi,
    resetValidation
  }
}

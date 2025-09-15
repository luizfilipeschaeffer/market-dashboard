import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { LogoProgress } from './LogoProgress'

interface TransitionSplashProps {
  onComplete: () => void
  pageName?: string
  isDataLoading?: boolean
}

export function TransitionSplash({ onComplete, pageName = 'página', isDataLoading = false }: TransitionSplashProps) {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState(`Carregando ${pageName}...`)
  const { actualTheme } = useTheme()

  useEffect(() => {
    const loadingSteps = isDataLoading ? [
      { text: `Carregando ${pageName}...`, duration: 300 },
      { text: 'Conectando com banco de dados...', duration: 400 },
      { text: 'Processando dados...', duration: 500 },
      { text: 'Gerando relatórios...', duration: 400 },
      { text: 'Finalizando...', duration: 200 }
    ] : [
      { text: `Carregando ${pageName}...`, duration: 200 },
      { text: 'Preparando dados...', duration: 200 },
      { text: 'Finalizando...', duration: 200 }
    ]

    let currentProgress = 0
    const totalDuration = isDataLoading ? 1800 : 600 // 1.8s para carregamento de dados, 0.6s para transição

    const interval = setInterval(() => {
      currentProgress += 100 / (totalDuration / 30) // Atualiza a cada 30ms
      
      if (currentProgress >= 100) {
        setProgress(100)
        setLoadingText('Carregamento concluído!')
        clearInterval(interval)
        
        // Aguarda um pouco antes de completar
        setTimeout(() => {
          onComplete()
        }, 100)
        return
      }

      setProgress(Math.min(currentProgress, 100))

      // Atualiza o texto baseado no progresso
      const stepIndex = Math.floor((currentProgress / 100) * loadingSteps.length)
      if (stepIndex < loadingSteps.length) {
        setLoadingText(loadingSteps[stepIndex].text)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [onComplete, pageName, isDataLoading])

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-8">
        {/* Logo Principal com Animação */}
        <div className="flex items-center justify-center">
          <LogoProgress
            progress={progress}
            size="lg"
            color={actualTheme === 'dark' ? '#ffffff' : '#2B6198'}
            animated={true}
          />
        </div>

        {/* Texto de Status com mais espaçamento */}
        <div className="w-64 text-center mt-6">
          <div className="text-sm text-muted-foreground mb-1">
            {loadingText}
          </div>
          <div className="text-xs text-muted-foreground/70">
            {Math.round(progress)}% concluído
          </div>
        </div>

        {/* Indicador de Carregamento mais sutil */}
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

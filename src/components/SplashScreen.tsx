import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { LogoProgress } from './LogoProgress'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Inicializando sistema...')
  const { actualTheme } = useTheme()

  useEffect(() => {
    const loadingSteps = [
      { text: 'Inicializando sistema...', duration: 300 },
      { text: 'Carregando configurações...', duration: 400 },
      { text: 'Conectando com banco de dados...', duration: 500 },
      { text: 'Verificando backups...', duration: 400 },
      { text: 'Carregando dados dos clientes...', duration: 400 }
    ]

    let currentProgress = 0
    const totalDuration = 2000 // 2 segundos total

    const interval = setInterval(() => {
      currentProgress += 100 / (totalDuration / 50) // Atualiza a cada 50ms
      
      if (currentProgress >= 100) {
        setProgress(100)
        setLoadingText('Sistema carregado com sucesso!')
        clearInterval(interval)
        
        // Aguarda um pouco antes de completar
        setTimeout(() => {
          onComplete()
        }, 300)
        return
      }

      setProgress(Math.min(currentProgress, 100))

      // Atualiza o texto baseado no progresso
      const stepIndex = Math.floor((currentProgress / 100) * loadingSteps.length)
      if (stepIndex < loadingSteps.length) {
        setLoadingText(loadingSteps[stepIndex].text)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [onComplete])

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

        {/* Texto de Status com mais espaçamento */}
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

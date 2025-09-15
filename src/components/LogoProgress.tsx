import { useState, useEffect } from 'react'

interface LogoProgressProps {
  progress: number // 0 a 100
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
  animated?: boolean
}

export const LogoProgress: React.FC<LogoProgressProps> = ({
  progress,
  size = 'md',
  color = '#2B6198',
  className = '',
  animated = true
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  const sizeClasses = {
    sm: 'w-32 h-8',
    md: 'w-48 h-12',
    lg: 'w-64 h-16',
    xl: 'w-80 h-20'
  }

  const viewBoxWidth = 600
  const viewBoxHeight = 140

  // Separando os elementos da logo
  const iconPath = "M0 93.6325L62.2996 0L92.0178 44.6726L29.7274 138.302L0 93.6325ZM130.304 93.6325L160.032 48.963L189.759 93.6325L160.032 138.302L130.304 93.6325ZM65.1599 93.6325L127.466 0L157.178 44.6726L94.8873 138.302L65.1599 93.6325Z"
  
  const marketPaths = [
    // M
    "M278.872 85.5614H264.238V62.513L256.658 76.8937C253.608 82.6722 249.89 85.5614 245.504 85.5614C241.119 85.5614 237.401 82.6722 234.35 76.8937L226.771 62.513V85.5614H212.137V30.5012C212.137 27.1852 213.265 24.3123 215.521 21.8827C217.777 19.4531 220.558 18.2383 223.863 18.2383C228.693 18.2383 232.3 20.7336 234.684 25.7241L245.504 48.4771L256.325 25.7241C258.708 20.7336 262.267 18.2383 267.002 18.2383C270.307 18.2383 273.104 19.4531 275.392 21.8827C277.712 24.2795 278.872 27.1523 278.872 30.5012V85.5614Z",
    // A
    "M346.224 85.5614H322.533L319.721 77.3369H294.791L291.978 85.5614H278.917L298.89 27.9896C299.844 25.1331 301.56 22.8184 304.038 21.0455C306.549 19.2397 309.329 18.3368 312.38 18.3368C315.304 18.3368 318.084 19.2068 320.722 20.947C323.36 22.6871 325.155 24.9197 326.109 27.6448L346.224 85.5614ZM315.145 64.2367L307.232 41.533L299.367 64.2367H315.145Z",
    // R
    "M416.008 85.5614H388.17L370.676 64.5322V85.5614H346.27V18.3368H375.586C383.88 18.3368 390.919 19.568 396.703 22.0304C404.838 25.5107 408.906 30.9773 408.906 38.4303C408.906 47.5578 403.138 53.5989 391.602 56.5539L416.008 85.5614ZM384.5 38.4303C384.5 36.329 383.594 34.6381 381.783 33.3577C379.971 32.0772 377.906 31.437 375.586 31.437H370.676V45.3744H375.586C377.906 45.3744 379.971 44.7342 381.783 43.4537C383.594 42.1732 384.5 40.4988 384.5 38.4303Z",
    // K
    "M484.981 85.5614H457.811L441.842 64.7292V85.5614H417.436V18.3368H441.842V43.6014L459.336 18.3368H480.834L458.526 51.038L484.981 85.5614Z",
    // E
    "M536.937 85.5614H499.518C496.563 85.5614 493.83 84.8884 491.319 83.5422C488.11 81.8678 486.505 79.5367 486.505 76.5489V27.3001C486.505 24.3451 488.11 22.0304 491.319 20.356C493.83 19.0098 496.563 18.3368 499.518 18.3368H536.937V31.437H510.911C509.29 31.437 508.48 31.9951 508.48 33.1114V45.3744H536.937V58.4746H508.48V70.7868C508.48 71.9031 509.29 72.4613 510.911 72.4613H536.937V85.5614Z",
    // T
    "M600 31.437H584.127C582.506 31.437 581.696 31.9951 581.696 33.1114V85.5614H559.721V33.1114C559.721 31.9951 558.91 31.437 557.29 31.437H541.512V18.3368H600V31.437Z"
  ]

  // Lógica de animação sequencial: ÍCONE → MARKET → AUTOMAÇÕES
  const showIcon = progress >= 10 // Ícone aparece aos 10%
  const showMarket = progress >= 20 // MARKET aparece aos 20%
  const showAutomacoes = progress >= 40 // AUTOMAÇÕES aparece aos 40%
  
  // Calcular quantas letras do MARKET devem estar preenchidas
  const marketProgress = Math.max(0, (progress - 20) / 20) // 20% a 40% = MARKET
  const marketLettersToShow = Math.floor(marketProgress * marketPaths.length)
  
  // Animação do texto "AUTOMAÇÕES"
  useEffect(() => {
    const text = 'AUTOMAÇÕES'
    
    if (showAutomacoes && !isTyping && displayedText === '') {
      setIsTyping(true)
      let currentIndex = 0
      
      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(typeInterval)
          // Remove o cursor após completar a digitação
          setTimeout(() => setIsTyping(false), 800)
        }
      }, 100) // 100ms por letra
      
      return () => clearInterval(typeInterval)
    } else if (!showAutomacoes) {
      setDisplayedText('')
      setIsTyping(false)
    }
  }, [showAutomacoes, isTyping, displayedText])

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* 1. ÍCONE DA MARCA */}
        {showIcon && (
          <path
            d={iconPath}
            fill={color}
            className={animated ? 'transition-all duration-500 ease-out' : ''}
            style={{
              opacity: 1,
              transform: animated ? 'scale(1)' : 'none',
              transformOrigin: 'center'
            }}
          />
        )}

        {/* 2. MARKET - Preenchimento progressivo */}
        {showMarket && (
          <g>
            {marketPaths.map((path, index) => {
              const isFullyVisible = index < marketLettersToShow
              
              if (!isFullyVisible) return null

              return (
                <path
                  key={`market-${index}`}
                  d={path}
                  fill={color}
                  className={animated ? 'transition-all duration-300 ease-out' : ''}
                  style={{
                    opacity: 1,
                    transform: animated ? 'scale(1)' : 'none',
                    transformOrigin: 'center'
                  }}
                />
              )
            })}
          </g>
        )}

        {/* 3. AUTOMAÇÕES - Texto animado */}
        {displayedText && (
          <text
            x={viewBoxWidth / 2}
            y={viewBoxHeight - 5}
            textAnchor="middle"
            fill={color}
            fontSize="16"
            fontWeight="700"
            className={animated ? 'transition-all duration-300 ease-out' : ''}
            style={{
              opacity: 1,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '1.5px',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {displayedText}
            {isTyping && (
              <tspan 
                className="animate-pulse"
                style={{ opacity: 0.9 }}
              >
                |
              </tspan>
            )}
          </text>
        )}

      </svg>
    </div>
  )
}

export default LogoProgress

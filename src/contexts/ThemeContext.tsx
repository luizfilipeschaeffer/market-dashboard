import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark' // Tema real sendo aplicado
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  // Função para detectar o tema do sistema
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  // Função para aplicar o tema
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    const systemTheme = getSystemTheme()
    
    let resolvedTheme: 'light' | 'dark'
    
    if (newTheme === 'system') {
      resolvedTheme = systemTheme
    } else {
      resolvedTheme = newTheme
    }

    // Remove classes anteriores
    root.classList.remove('light', 'dark')
    // Adiciona a nova classe
    root.classList.add(resolvedTheme)
    
    setActualTheme(resolvedTheme)
  }

  // Efeito para aplicar o tema quando ele muda
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Efeito para detectar mudanças no tema do sistema
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        applyTheme('system')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  // Carregar tema salvo do localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [])

  // Salvar tema no localStorage quando ele muda
  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  const value: ThemeContextType = {
    theme,
    setTheme,
    actualTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

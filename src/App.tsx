import { useState, useEffect } from 'react'
import { HomePage } from '@/pages/HomePage'
import { BackupDashboard } from '@/pages/BackupDashboard'
import { ClientsPage } from '@/pages/ClientsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { FAQPage } from '@/pages/FAQPage'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { SplashScreen } from '@/components/SplashScreen'
import { TransitionSplash } from '@/components/TransitionSplash'

type Page = 'home' | 'backups' | 'clients' | 'settings' | 'faq'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitioningTo, setTransitioningTo] = useState<Page>('home')
  const [pageLoading, setPageLoading] = useState(false)
  const [initialErrorCode, setInitialErrorCode] = useState<string | null>(null)

  const getPageName = (page: Page): string => {
    const pageNames = {
      'home': 'Página Inicial',
      'backups': 'Dashboard de Backups',
      'clients': 'Gestão de Clientes',
      'settings': 'Configurações',
      'faq': 'FAQ - Códigos de Erro'
    }
    return pageNames[page]
  }

  const handlePageLoadStart = () => {
    setPageLoading(true)
  }

  const handlePageLoadComplete = () => {
    setPageLoading(false)
  }

  const handleNavigateToHome = () => {
    if (currentPage === 'home') return
    setTransitioningTo('home')
    setIsTransitioning(true)
    handlePageLoadStart()
  }

  const handleNavigateToBackups = () => {
    if (currentPage === 'backups') return
    setTransitioningTo('backups')
    setIsTransitioning(true)
    handlePageLoadStart()
  }

  const handleNavigateToClients = () => {
    if (currentPage === 'clients') return
    setTransitioningTo('clients')
    setIsTransitioning(true)
    handlePageLoadStart()
  }

  const handleNavigateToSettings = () => {
    if (currentPage === 'settings') return
    setTransitioningTo('settings')
    setIsTransitioning(true)
    handlePageLoadStart()
  }

  const handleNavigateToFAQ = () => {
    if (currentPage === 'faq') return
    setTransitioningTo('faq')
    setIsTransitioning(true)
    handlePageLoadStart()
  }


  const handleTransitionComplete = () => {
    setCurrentPage(transitioningTo)
    setIsTransitioning(false)
  }

  const handleSplashComplete = () => {
    setIsLoading(false)
  }

  // Detectar hash na URL e navegar automaticamente
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash) {
        // Extrair código de erro do hash (ex: #API-001)
        const errorCode = hash.substring(1) // Remove o #
        
        // Verificar se é um código de erro válido
        if (errorCode.match(/^[A-Z]+-\d+$/)) {
          setInitialErrorCode(errorCode)
          setCurrentPage('faq')
        }
      } else {
        // Limpar código de erro se não há hash
        setInitialErrorCode(null)
      }
    }

    // Verificar hash inicial apenas se não estiver carregando
    if (!isLoading) {
      handleHashChange()
    }

    // Escutar mudanças no hash
    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [isLoading])

  // Limpar código de erro inicial após processar
  const handleErrorProcessed = () => {
    setInitialErrorCode(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {isLoading ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <>
          {/* Sidebar */}
          <Sidebar
            currentPage={currentPage}
            onNavigateToHome={handleNavigateToHome}
            onNavigateToBackups={handleNavigateToBackups}
            onNavigateToClients={handleNavigateToClients}
            onNavigateToSettings={handleNavigateToSettings}
            onNavigateToFAQ={handleNavigateToFAQ}
          />
          
          {/* Main Content */}
          <div className="ml-64 flex flex-col min-h-screen">
            {/* Top Bar */}
            <TopBar />
            
            {/* Page Content */}
            <main className="flex-1 overflow-auto">
              {currentPage === 'home' && (
                <HomePage onNavigateToBackups={handleNavigateToBackups} />
              )}
              
              {currentPage === 'backups' && (
                <BackupDashboard 
                  onNavigateToHome={handleNavigateToHome}
                  onLoadStart={handlePageLoadStart}
                  onLoadComplete={handlePageLoadComplete}
                />
              )}

              {currentPage === 'clients' && (
                <ClientsPage 
                  onNavigateToHome={handleNavigateToHome}
                  onLoadStart={handlePageLoadStart}
                  onLoadComplete={handlePageLoadComplete}
                />
              )}

              {currentPage === 'settings' && (
                <SettingsPage 
                  onNavigateToHome={handleNavigateToHome}
                  onLoadStart={handlePageLoadStart}
                  onLoadComplete={handlePageLoadComplete}
                />
              )}

              {currentPage === 'faq' && (
                <FAQPage 
                  onNavigateToHome={handleNavigateToHome}
                  onLoadComplete={handlePageLoadComplete}
                  initialErrorCode={initialErrorCode}
                  onErrorProcessed={handleErrorProcessed}
                />
              )}

            </main>
          </div>
        </>
      )}
      
      {/* Splash Screen para Transições e Carregamento */}
      {(isTransitioning || pageLoading) && (
        <TransitionSplash 
          onComplete={handleTransitionComplete}
          pageName={getPageName(transitioningTo)}
          isDataLoading={pageLoading}
        />
      )}
    </div>
  )
}

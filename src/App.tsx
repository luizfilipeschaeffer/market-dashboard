import { useState } from 'react'
import { HomePage } from '@/pages/HomePage'
import { BackupDashboard } from '@/pages/BackupDashboard'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'

type Page = 'home' | 'backups'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  const handleNavigateToHome = () => {
    setCurrentPage('home')
  }

  const handleNavigateToBackups = () => {
    setCurrentPage('backups')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigateToHome={handleNavigateToHome}
        onNavigateToBackups={handleNavigateToBackups}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {currentPage === 'home' && (
            <HomePage onNavigateToBackups={handleNavigateToBackups} />
          )}
          
          {currentPage === 'backups' && (
            <BackupDashboard onNavigateToHome={handleNavigateToHome} />
          )}
        </main>
      </div>
    </div>
  )
}

import { Button } from '@/components/ui/button'
import { ThemeToggle, ThemeSelect } from '@/components/ThemeToggle'
import { Home, BarChart3, ArrowLeft } from 'lucide-react'

interface NavigationProps {
  currentPage: 'home' | 'backups'
  onNavigateToHome: () => void
  onNavigateToBackups: () => void
}

export function Navigation({ currentPage, onNavigateToHome, onNavigateToBackups }: NavigationProps) {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">Market - Automações Dashboard</h1>
            {currentPage === 'backups' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onNavigateToHome}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                size="sm"
                onClick={onNavigateToHome}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Início
              </Button>
              <Button
                variant={currentPage === 'backups' ? 'default' : 'ghost'}
                size="sm"
                onClick={onNavigateToBackups}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Backups
              </Button>
            </div>

            {/* Theme Controls */}
            <div className="flex items-center gap-2">
              <ThemeSelect />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

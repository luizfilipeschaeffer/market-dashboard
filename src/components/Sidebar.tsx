import { Home, HardDrive, Settings, Users, HelpCircle } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface SidebarProps {
  currentPage: 'home' | 'backups' | 'clients' | 'settings' | 'faq'
  onNavigateToHome: () => void
  onNavigateToBackups: () => void
  onNavigateToClients: () => void
  onNavigateToSettings: () => void
  onNavigateToFAQ: () => void
}

export function Sidebar({ currentPage, onNavigateToHome, onNavigateToBackups, onNavigateToClients, onNavigateToSettings, onNavigateToFAQ }: SidebarProps) {
  const { actualTheme } = useTheme()
  const menuItems = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: Home,
      onClick: onNavigateToHome
    },
    {
      id: 'backups',
      label: 'Backups',
      icon: HardDrive,
      onClick: onNavigateToBackups
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
      onClick: onNavigateToClients
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      onClick: onNavigateToSettings
    },
    {
      id: 'faq',
      label: 'FAQ - Erros',
      icon: HelpCircle,
      onClick: onNavigateToFAQ
    }
    // Temporariamente oculto
    // {
    //   id: 'test',
    //   label: 'Teste da Logo',
    //   icon: TestTube,
    //   onClick: onNavigateToTest
    // }
  ]

  return (
    <aside className="w-64 bg-card h-screen flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img 
            src={actualTheme === 'dark' ? '/logo-white.svg' : '/logo.svg'} 
            alt="Market Automações" 
            className="h-12 w-auto"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          
          return (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={item.onClick}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground">
          </div>
          <div className="text-xs text-muted-foreground pl-11">
            <p>Market Automações</p>
            <p>Versão 0.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

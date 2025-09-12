import { Home, HardDrive, Settings, Users } from 'lucide-react'

interface SidebarProps {
  currentPage: 'home' | 'backups'
  onNavigateToHome: () => void
  onNavigateToBackups: () => void
}

export function Sidebar({ currentPage, onNavigateToHome, onNavigateToBackups }: SidebarProps) {
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
      onClick: () => {} // Placeholder
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      onClick: () => {} // Placeholder
    }
  ]

  return (
    <aside className="w-64 bg-white h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">MARKET</h1>
            <p className="text-sm text-muted-foreground">AUTOMAÇÕES</p>
          </div>
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
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
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
          <div className="flex items-center gap-3 px-3 py-2 text-gray-600">
            <Settings className="h-5 w-5" />
            <span className="font-medium">Configurações</span>
          </div>
          <div className="text-xs text-gray-500 pl-11">
            <p>Market Automações</p>
            <p>Versão 0.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

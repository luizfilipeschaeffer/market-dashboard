import { Button } from '@/components/ui/button'
import { Search, Menu } from 'lucide-react'

interface TopBarProps {
  onToggleSidebar?: () => void
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  return (
    <header className="h-16 bg-background flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="lg"
          onClick={onToggleSidebar}
          className="flex items-center gap-2"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar"
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Espaço reservado para futuras funcionalidades */}
      </div>
    </header>
  )
}

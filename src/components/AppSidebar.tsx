import { Home, BarChart3, Users, Settings, HelpCircle, Sun, Moon, Monitor, ChevronDown } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AppSidebarProps {
  currentPage: 'home' | 'backups' | 'clients' | 'settings' | 'faq'
  onNavigateToHome: () => void
  onNavigateToBackups: () => void
  onNavigateToClients: () => void
  onNavigateToSettings: () => void
  onNavigateToFAQ: () => void
}

export function AppSidebar({
  currentPage,
  onNavigateToHome,
  onNavigateToBackups,
  onNavigateToClients,
  onNavigateToSettings,
  onNavigateToFAQ,
}: AppSidebarProps) {
  const { actualTheme, theme, setTheme } = useTheme()
  
  // Determinar o ícone baseado no tema atual
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return Sun
      case 'dark':
        return Moon
      case 'system':
        return Monitor
      default:
        return Sun
    }
  }
  
  const ThemeIcon = getThemeIcon()

  // Opções de tema para o dropdown
  const themeOptions = [
    {
      value: 'light',
      label: 'Claro',
      icon: Sun,
      description: 'Tema claro'
    },
    {
      value: 'dark',
      label: 'Escuro',
      icon: Moon,
      description: 'Tema escuro'
    },
    {
      value: 'system',
      label: 'Sistema',
      icon: Monitor,
      description: 'Seguir preferência do sistema'
    }
  ]

  // Menu items principais
  const mainMenuItems = [
    {
      title: "Página Inicial",
      url: "#",
      icon: Home,
      onClick: onNavigateToHome,
      isActive: currentPage === 'home'
    },
    {
      title: "Dashboard de Backups",
      url: "#",
      icon: BarChart3,
      onClick: onNavigateToBackups,
      isActive: currentPage === 'backups'
    },
    {
      title: "Gestão de Clientes",
      url: "#",
      icon: Users,
      onClick: onNavigateToClients,
      isActive: currentPage === 'clients'
    },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="pointer-events-none">
                <div className={`flex aspect-square size-8 items-center justify-center rounded-lg ${
                  actualTheme === 'dark' 
                    ? 'bg-sidebar border border-sidebar-border' 
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                  <img 
                    src={actualTheme === 'dark' ? '/icon-mkt-w.svg' : '/icon-mkt.svg'} 
                    alt="Market Dashboard Icon" 
                    className="h-6 w-6"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Market Dashboard</span>
                  <span className="truncate text-xs">Sistema de Gestão</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.isActive}
                    onClick={item.onClick}
                    tooltip={item.title}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={currentPage === 'settings'}
              onClick={onNavigateToSettings}
              tooltip="Configurações"
            >
              <a href="#">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="Alternar Tema">
                  <ThemeIcon className="h-4 w-4" />
                  <span>Alternar Tema</span>
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                {themeOptions.map((option) => {
                  const OptionIcon = option.icon
                  return (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <OptionIcon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                      {theme === option.value && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={currentPage === 'faq'}
              onClick={onNavigateToFAQ}
              tooltip="FAQ - Códigos de Erro"
            >
              <a href="#">
                <HelpCircle className="h-4 w-4" />
                <span>FAQ - Códigos de Erro</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {/* Espaçamento entre o botão de tema e o footer */}
        <div className="h-4" />
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm" asChild>
              <a href="#" className="pointer-events-none">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-xs font-semibold">MD</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">v1.0</span>
                  <span className="truncate text-xs">Market Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

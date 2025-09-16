import { Card, CardContent } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  className?: string
  pageTitle?: string
  headerControls?: ReactNode
}

export function PageWrapper({ children, className = '', pageTitle, headerControls }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen pt-6 pl-3 pr-0 pb-0 overflow-hidden">
        <Card className={`min-h-screen rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none border-t border-l border-b-0 border-r-0 shadow-[0_0_20px_rgba(0,0,0,0.08)] dark:shadow-[0_0_30px_rgba(0,0,0,0.3)] bg-slate-50 dark:bg-slate-900/50 pt-0 pb-4 ${className}`}>
          <CardContent className="p-0 min-h-screen">
            {/* Header com SidebarTrigger, Título e Controles */}
            <div className="flex h-16 shrink-0 items-center justify-between gap-4 px-6 border-b border-border">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold">{pageTitle}</h1>
                </div>
              </div>
              
              {/* Controles customizados do header */}
              {headerControls && (
                <div className="flex items-center gap-2">
                  {headerControls}
                </div>
              )}
            </div>
            
            {/* Conteúdo da página */}
            <div className="flex-1 p-5">
              {children}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 

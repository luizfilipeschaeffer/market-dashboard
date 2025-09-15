import { Card, CardContent } from '@/components/ui/card'
import { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen pt-6 pl-6 pr-0 pb-0 overflow-hidden">
        <Card className={`min-h-screen rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none border-t border-l border-b-0 border-r-0 shadow-[0_0_20px_rgba(0,0,0,0.08)] dark:shadow-[0_0_30px_rgba(0,0,0,0.3)] ${className}`}>
          <CardContent className="p-6 min-h-screen">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

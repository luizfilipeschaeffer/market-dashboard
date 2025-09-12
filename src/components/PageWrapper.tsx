import { Card, CardContent } from '@/components/ui/card'
import { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className="h-full bg-white">
      <div className="h-full pt-6 pl-6">
        <Card className={`h-full rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none border border-gray-200 shadow-sm ${className}`}>
          <CardContent className="p-6 h-full">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

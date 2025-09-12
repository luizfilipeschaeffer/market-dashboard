import { Card, CardContent } from '@/components/ui/card'
import { PageWrapper } from '@/components/PageWrapper'
import { HardDrive, CheckCircle, XCircle } from 'lucide-react'

interface HomePageProps {
  onNavigateToBackups: () => void
}

export function HomePage({ onNavigateToBackups }: HomePageProps) {
  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-primary">Ações rápidas</h1>
        </div>

        {/* Backups Card - Card menor abaixo do título */}
        <div className="max-w-md">
          <Card 
            onClick={onNavigateToBackups}
            className="bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors shadow-lg rounded-lg"
          >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <HardDrive className="h-8 w-8 text-white" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Backups</h3>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-300" />
                    <span className="text-white">Sucesso: 280</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-300" />
                    <span className="text-white">Falhou: 4</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </PageWrapper>
  )
}

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { HardDrive, CheckCircle, XCircle, ArrowRight, TrendingUp, Loader2 } from 'lucide-react'
import { api } from '@/services/api'
import type { BackupStatsUI } from '@/types/api'

interface HomePageProps {
  onNavigateToBackups: () => void
  onLoadComplete?: () => void
}

export function HomePage({ onNavigateToBackups, onLoadComplete }: HomePageProps) {
  const [backupStats, setBackupStats] = useState<BackupStatsUI>({
    total: 0,
    successful: 0,
    failed: 0,
    successRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Usar o endpoint de resumo diretamente para dados gerais da página inicial
        const resumo = await api.backups.getResumoBackups()
        
        // Mapear os dados do resumo para o formato esperado
        const stats: BackupStatsUI = {
          successful: resumo.sucessos,
          failed: resumo.falhas,
          total: resumo.total,
          successRate: resumo.percentualSucesso
        }
        
        setBackupStats(stats)
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
        // Em caso de erro, manter os valores padrão (0)
      } finally {
        setLoading(false)
        onLoadComplete?.()
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <PageWrapper pageTitle="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando dados...</span>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper pageTitle="Dashboard">
      <div className="space-y-3">
        {/* Subtitle */}
        <div>
          <p className="text-muted-foreground">Visão geral dos backups e automações</p>
        </div>

        {/* Backups Card - Card melhorado e padronizado */}
        <div className="max-w-2xl">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <HardDrive className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Sistema de Backups</CardTitle>
                    <CardDescription>Monitoramento em tempo real dos backups das bases de dados</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {backupStats.successRate.toFixed(1)}% sucesso
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-muted-foreground">Sucessos</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{backupStats.successful}</div>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-muted-foreground">Falhas</span>
                  </div>
                  <div className="text-2xl font-bold text-destructive">{backupStats.failed}</div>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <HardDrive className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Total</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{backupStats.total}</div>
                </div>
              </div>

              {/* Ação */}
              <div className="pt-2">
                <Button 
                  onClick={onNavigateToBackups}
                  className="w-full"
                  size="lg"
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  Ver Detalhes dos Backups
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}

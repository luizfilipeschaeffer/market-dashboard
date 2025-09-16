import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ClientBackupModal } from '@/components/modals/ClientBackupModal'
import { ApiValidationSplash } from '@/components/ApiValidationSplash'
import { CheckCircle, XCircle, Clock, TrendingUp, Loader2 } from 'lucide-react'
import { PieChart as MuiPieChart } from '@mui/x-charts/PieChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { api } from '@/services/api'
import type { BackupStatsUI, ClientUI } from '@/types/api'
import { formatDateTime, formatWeekday } from '@/lib/dateUtils'
import { ColumnDef } from '@tanstack/react-table'

interface BackupDashboardProps {
  onNavigateToHome: () => void
  onLoadComplete?: () => void
}

interface BackupClient extends ClientUI {
  lastBackup: string
  successRate: number
  dataInicio?: string
  dataFim?: string
}

interface ClientWithOptionalBackup extends ClientUI {
  lastBackup?: string
  successRate?: number
  dataInicio?: string
  dataFim?: string
}

interface TimeSeriesData {
  date: string
  successful: number
  failed: number
}

interface BarChartData {
  group: string
  successful: number
  failed: number
}


export function BackupDashboard({ onLoadComplete }: BackupDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [statusFilter, setStatusFilter] = useState('all')
  const [backupStats, setBackupStats] = useState<BackupStatsUI>({
    successful: 0,
    failed: 0,
    total: 0,
    successRate: 0
  })
  const [clients, setClients] = useState<BackupClient[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [barChartData, setBarChartData] = useState<BarChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasData, setHasData] = useState(false)
  const [selectedClient, setSelectedClient] = useState<BackupClient | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isApiValidating, setIsApiValidating] = useState(true)
  const [isApiAvailable, setIsApiAvailable] = useState<boolean | null>(null)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [isManualRefresh, setIsManualRefresh] = useState(false)
  const [isLoadingBackupData, setIsLoadingBackupData] = useState(false)
  const [isLoadingPeriod, setIsLoadingPeriod] = useState(false)
  const [clientsBasic, setClientsBasic] = useState<ClientWithOptionalBackup[]>([])
  // const [loadBackupDataFn, setLoadBackupDataFn] = useState<(() => Promise<BackupClient[]>) | null>(null)

  // Callbacks para validação da API
  const handleApiValidationComplete = (isAvailable: boolean) => {
    setIsApiAvailable(isAvailable)
    setIsApiValidating(false)
    
    if (isAvailable) {
      // Se a API está disponível, carregar os dados
      loadData()
    }
  }

  // Função para processar dados do timeline em grupos para o BarChart
  const processTimelineData = (data: TimeSeriesData[], period: string): BarChartData[] => {
    if (!data || data.length === 0) return []

    const isMonthlyGrouping = period === '90' || period === '365' // 3 meses ou 1 ano
    
    if (isMonthlyGrouping) {
      // Agrupar por mês
      const monthlyGroups = new Map<string, { successful: number; failed: number }>()
      
      data.forEach(item => {
        const date = new Date(item.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthlyGroups.has(monthKey)) {
          monthlyGroups.set(monthKey, { successful: 0, failed: 0 })
        }
        
        const group = monthlyGroups.get(monthKey)!
        group.successful += item.successful
        group.failed += item.failed
      })
      
      return Array.from(monthlyGroups.entries())
        .map(([month, stats]) => {
          const [year, monthNum] = month.split('-')
          const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('pt-BR', { 
            month: 'short' 
          })
          return {
            group: `${monthName}/${year}`,
            successful: stats.successful,
            failed: stats.failed
          }
        })
        .sort((a, b) => a.group.localeCompare(b.group))
    } else {
      // Agrupar por dia (últimos 30 dias)
      return data.map(item => ({
        group: new Date(item.date).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        successful: item.successful,
        failed: item.failed
      }))
    }
  }

  const loadData = async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setIsAutoRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    
    try {
      // PRIMEIRA ETAPA: Carregar apenas lista de clientes para liberar o splash rapidamente
      const progressiveData = await api.backups.getClientsWithBackupStatusProgressive(parseInt(selectedPeriod))
      
      // Verificar se há clientes válidos
      const hasValidClients = progressiveData.clients && progressiveData.clients.length > 0
      
      if (!hasValidClients) {
        setError('Nenhum cliente encontrado. Verifique se a API está funcionando corretamente.')
        setHasData(false)
      } else {
        setError(null)
        setHasData(true)
      }
      
      // Configurar dados básicos dos clientes e LIBERAR O SPLASH
      setClientsBasic(progressiveData.clients.map(client => ({
        ...client,
        lastBackup: 'N/A',
        successRate: 0,
        dataInicio: undefined,
        dataFim: undefined
      })))
      
      // Iniciar carregamento de dados de backup (mostrar skeletons)
      setIsLoadingBackupData(true)
      
      // LIBERAR O SPLASH AQUI - primeira solicitação concluída
      if (isAutoRefresh) {
        setIsAutoRefreshing(false)
      } else {
        setLoading(false)
        onLoadComplete?.()
      }
      
      // SEGUNDA ETAPA: Carregar dados restantes em background (stats, timeline, dados de backup)
      // Carregar stats e timeline em paralelo
      const [stats, timelineData] = await Promise.all([
        api.backups.getStats(parseInt(selectedPeriod)),
        api.backups.getTimeline(parseInt(selectedPeriod))
      ])
      
      console.log('Stats carregados:', stats)
      console.log('Timeline carregado:', timelineData)
      
      setBackupStats(stats)
      setTimeSeriesData(timelineData)
      setBarChartData(processTimelineData(timelineData, selectedPeriod))
      
      // TERCEIRA ETAPA: Carregar dados de backup dos clientes
      try {
        const clientsWithBackupData = await progressiveData.loadBackupData()
        setClients(clientsWithBackupData as BackupClient[])
      } catch (backupError) {
        console.error('Erro ao carregar dados de backup:', backupError)
        // Em caso de erro, usar dados básicos dos clientes
        const clientsWithBasicData = progressiveData.clients.map(client => ({
          ...client,
          lastBackup: 'N/A',
          successRate: 0,
          dataInicio: undefined,
          dataFim: undefined
        }))
        setClients(clientsWithBasicData as BackupClient[])
      } finally {
        setIsLoadingBackupData(false)
      }
      
    } catch (error) {
      console.error('Erro ao recarregar dados do dashboard:', error)
      setError('Erro ao conectar com a API. Verifique sua conexão e tente novamente.')
      setHasData(false)
      
      // Garantir que o splash seja liberado mesmo em caso de erro
      if (isAutoRefresh) {
        setIsAutoRefreshing(false)
      } else {
        setLoading(false)
        onLoadComplete?.()
      }
    }
  }

  const handleRetry = async () => {
    await loadData()
  }

  const handleManualRefresh = async () => {
    setIsManualRefresh(true)
    setCountdown(30) // Reset da contagem
    await loadData()
    setIsManualRefresh(false)
  }

  // useEffect removido - loadData agora é chamado apenas após validação da API

  // Recarregar dados quando o período mudar
  useEffect(() => {
    if (isApiAvailable && !isApiValidating) {
      setIsLoadingPeriod(true)
      loadData().finally(() => {
        setIsLoadingPeriod(false)
      })
    }
  }, [selectedPeriod])

  // Atualizar dados do BarChart quando o período mudar
  useEffect(() => {
    if (timeSeriesData.length > 0) {
      setBarChartData(processTimelineData(timeSeriesData, selectedPeriod))
    }
  }, [selectedPeriod, timeSeriesData])

  // Contagem regressiva para o botão de atualizar
  useEffect(() => {
    if (!isApiAvailable) return

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 30 // Reset para 30 segundos
        }
        return prev - 1
      })
    }, 1000) // Atualizar a cada segundo

    return () => {
      clearInterval(countdownInterval)
    }
  }, [isApiAvailable])

  // Auto carregamento a cada 30 segundos quando a API estiver disponível
  useEffect(() => {
    if (!isApiAvailable) return

    const interval = setInterval(() => {
      loadData(true) // true indica que é auto refresh
      setCountdown(30) // Reset da contagem após auto refresh
    }, 30000) // 30 segundos

    // Limpar intervalo quando o componente for desmontado ou API não estiver disponível
    return () => {
      clearInterval(interval)
    }
  }, [isApiAvailable, selectedPeriod]) // Incluir selectedPeriod para recarregar quando mudar

  // Mostrar splash com validação da API se ainda estiver validando
  if (isApiValidating) {
    return (
      <ApiValidationSplash 
        onComplete={handleApiValidationComplete}
        pageName="Dashboard de Backups"
      />
    )
  }

  // Mostrar erro se a API não estiver disponível
  if (isApiAvailable === false) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 mx-auto bg-destructive/10 dark:bg-destructive/20 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                API não disponível
              </h3>
              <p className="text-muted-foreground mb-4">
                Não foi possível conectar com a API após múltiplas tentativas.
              </p>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Possíveis causas:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Servidor da API está offline</li>
                  <li>Problema de conectividade de rede</li>
                  <li>Firewall bloqueando a conexão</li>
                  <li>URL da API incorreta</li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={() => {
                setIsApiValidating(true)
                setIsApiAvailable(null)
              }} 
              variant="outline"
              className="mt-4"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando dashboard...</span>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Exibir mensagem de erro ou dados vazios
  if (error || !hasData) {
    
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 mx-auto bg-destructive/10 dark:bg-destructive/20 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {error ? 'Erro ao carregar dados' : 'Nenhum dado encontrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {error || 'Não há dados de backup disponíveis no momento.'}
              </p>
              
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Possíveis causas:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>API não está respondendo</li>
                  <li>Não há backups cadastrados</li>
                  <li>Problema de conectividade</li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={handleRetry} 
              variant="outline"
              className="mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Tentar novamente'
              )}
            </Button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Dados para o novo gráfico Material-UI
  const muiPieData = [
    { label: 'Sucesso', value: backupStats.successful, color: '#22c55e' },
    { label: 'Falha', value: backupStats.failed, color: '#ef4444' }
  ]
  
  // Se não há dados, mostrar dados de exemplo para o gráfico
  const hasBackupData = backupStats.total > 0
  const displayData = hasBackupData ? muiPieData : [
    { label: 'Sem dados', value: 1, color: '#6b7280' }
  ]

  // Calcular percentuais
  const successPercentage = backupStats.total > 0 ? Math.round((backupStats.successful / backupStats.total) * 100) : 0
  const failurePercentage = backupStats.total > 0 ? Math.round((backupStats.failed / backupStats.total) * 100) : 0

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (successRate: number | undefined) => {
    let variant = ''
    let label = ''
    let icon = null

    const rate = successRate || 0

    if (rate >= 95) {
      variant = 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      label = 'Excelente'
      icon = <CheckCircle className="h-3 w-3" />
    } else if (rate >= 85) {
      variant = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      label = 'Muito Bom'
      icon = <CheckCircle className="h-3 w-3" />
    } else if (rate >= 70) {
      variant = 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      label = 'Bom'
      icon = <Clock className="h-3 w-3" />
    } else if (rate >= 50) {
      variant = 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
      label = 'Regular'
      icon = <Clock className="h-3 w-3" />
    } else if (rate >= 25) {
      variant = 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      label = 'Ruim'
      icon = <XCircle className="h-3 w-3" />
    } else {
      variant = 'bg-red-200 text-red-900 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700'
      label = 'Péssimo'
      icon = <XCircle className="h-3 w-3" />
    }

    return (
      <Badge className={`${variant} flex items-center gap-1`}>
        {icon}
        {label}
      </Badge>
    )
  }

  // Função para renderizar skeleton ou dados reais
  const renderDateField = (date: string | undefined, isLoading: boolean) => {
    if (isLoading || !date || date === 'N/A' || date === undefined) {
      return (
        <div className="text-sm space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      )
    }
    
    return (
      <div className="text-sm">
        <div className="font-medium">{formatDateTime(date)}</div>
        <div className="text-muted-foreground text-xs">
          {formatWeekday(date)}
        </div>
      </div>
    )
  }

  // Função para renderizar skeleton ou duração real
  const renderDurationField = (dataInicio: string | undefined, dataFim: string | undefined, isLoading: boolean) => {
    if (isLoading || !dataInicio || !dataFim || dataInicio === 'N/A' || dataFim === 'N/A') {
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-4 w-16" />
        </div>
      )
    }
    
    const duration = calculateDuration(dataInicio, dataFim)
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{duration}</span>
      </div>
    )
  }

  // Função para renderizar skeleton ou classificação real
  const renderClassificationField = (client: any, isLoading: boolean) => {
    if (isLoading || !client.successRate || client.successRate === 0) {
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      )
    }
    
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon(client.status)}
        {getStatusBadge(client.successRate)}
      </div>
    )
  }

  // Função para renderizar skeleton ou valor real nos cartões de métricas
  const renderMetricValue = (value: number, isLoading: boolean) => {
    if (isLoading) {
      return <Skeleton className="h-8 w-16" />
    }
    return <div className="text-2xl font-bold">{value}</div>
  }


  // Função para renderizar skeleton ou gráfico
  const renderChartSkeleton = (isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-80 space-y-4">
          <Skeleton className="h-64 w-64 rounded-full" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
            <div className="text-muted-foreground">|</div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Função para renderizar skeleton do gráfico de barras
  const renderBarChartSkeleton = (isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="h-[300px] w-full flex items-center justify-center">
          <div className="space-y-4 w-full">
            <div className="flex justify-between items-end h-48 space-x-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-2 flex-1">
                  <Skeleton className="w-full h-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const handleClientClick = (client: BackupClient) => {
    setSelectedClient(client)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedClient(null)
  }

  const handleRowClick = (client: BackupClient) => {
    handleClientClick(client)
  }

  // Função para exportar dados em CSV
  const handleExportData = () => {
    if (filteredClients.length === 0) {
      alert('Não há dados para exportar.')
      return
    }

    // Preparar dados para exportação
    const exportData = filteredClients.map(client => ({
      'Cliente': client.name,
      'CNPJ': client.cnpj,
      'Email': client.email,
      'Data Início': (client as any).dataInicio ? formatDateTime((client as any).dataInicio) : 'N/A',
      'Data Fim': (client as any).dataFim ? formatDateTime((client as any).dataFim) : 'N/A',
      'Duração': (client as any).dataInicio && (client as any).dataFim 
        ? calculateDuration((client as any).dataInicio, (client as any).dataFim) 
        : 'N/A',
      'Taxa de Sucesso': (client as any).successRate ? `${(client as any).successRate.toFixed(1)}%` : 'N/A',
      'Classificação': (client as any).successRate ? getClassification((client as any).successRate) : 'N/A'
    }))

    // Converter para CSV
    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          // Escapar vírgulas e aspas no valor
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        }).join(',')
      )
    ].join('\n')

    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `backup-dashboard-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Função para calcular duração entre duas datas
  const calculateDuration = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate || startDate === 'N/A' || endDate === 'N/A') {
      return 'N/A'
    }
    
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffMs = end.getTime() - start.getTime()
      
      if (diffMs < 0) return 'N/A'
      
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffDays > 0) {
        return `${diffDays}d ${diffHours % 24}h ${diffMinutes % 60}m`
      } else if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes % 60}m`
      } else {
        return `${diffMinutes}m`
      }
    } catch (error) {
      console.error('Erro ao calcular duração:', error)
      return 'N/A'
    }
  }

  const columns: ColumnDef<BackupClient | ClientWithOptionalBackup>[] = [
    {
      accessorKey: "name",
      header: "Cliente",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={client.logo} alt={client.name} />
              <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{client.name}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "dataInicio",
      header: "Data Início",
      cell: ({ row }) => {
        const client = row.original
        return renderDateField((client as any).dataInicio, isLoadingBackupData)
      },
    },
    {
      accessorKey: "dataFim",
      header: "Data Fim",
      cell: ({ row }) => {
        const client = row.original
        return renderDateField((client as any).dataFim, isLoadingBackupData)
      },
    },
    {
      accessorKey: "duration",
      header: "Duração",
      cell: ({ row }) => {
        const client = row.original
        return renderDurationField((client as any).dataInicio, (client as any).dataFim, isLoadingBackupData)
      },
    },
    {
      accessorKey: "successRate",
      header: "Classificação",
      cell: ({ row }) => {
        const client = row.original
        return renderClassificationField(client, isLoadingBackupData)
      },
    },
  ]

  const getClassification = (successRate: number | undefined) => {
    const rate = successRate || 0
    if (rate >= 95) return 'excellent'
    if (rate >= 85) return 'very-good'
    if (rate >= 70) return 'good'
    if (rate >= 50) return 'regular'
    if (rate >= 25) return 'bad'
    return 'terrible'
  }

  // Usar dados básicos se ainda estiver carregando dados de backup
  const clientsToDisplay: (BackupClient | ClientWithOptionalBackup)[] = isLoadingBackupData ? clientsBasic : clients
  
  
  const filteredClients = clientsToDisplay.filter(client => {
    // Durante o carregamento dos dados de backup, não aplicar filtros de classificação
    // pois todos os clientes têm successRate: 0 temporariamente
    const matchesStatus = isLoadingBackupData 
      ? statusFilter === 'all' 
      : statusFilter === 'all' || getClassification((client as any).successRate) === statusFilter
    
    return matchesStatus
  })

  // Controles de período para o header
  const periodControls = (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Período:</span>
      <Button
        variant={selectedPeriod === '90' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSelectedPeriod('90')}
        className="text-xs h-8 px-3"
        disabled={isLoadingPeriod}
      >
        {isLoadingPeriod && selectedPeriod === '90' ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Carregando...
          </>
        ) : (
          'Últimos 3 meses'
        )}
      </Button>
      <Button
        variant={selectedPeriod === '30' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSelectedPeriod('30')}
        className="text-xs h-8 px-3"
        disabled={isLoadingPeriod}
      >
        {isLoadingPeriod && selectedPeriod === '30' ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Carregando...
          </>
        ) : (
          'Últimos 30 dias'
        )}
      </Button>
      <Button
        variant={selectedPeriod === '7' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSelectedPeriod('7')}
        className="text-xs h-8 px-3"
        disabled={isLoadingPeriod}
      >
        {isLoadingPeriod && selectedPeriod === '7' ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Carregando...
          </>
        ) : (
          'Últimos 7 dias'
        )}
      </Button>
    </div>
  )

  return (
    <PageWrapper 
      pageTitle="Dashboard de Backup de Bases de Dados"
      headerControls={periodControls}
    >
      <div className="space-y-4">
        {/* Subtitle with Refresh Button */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Monitoramento em tempo real dos backups das bases de dados dos clientes</p>
          <div className="flex items-center gap-3">
            {/* Status de carregamento de dados de backup ao lado do botão */}
            {isLoadingBackupData && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando dados de backup...</span>
              </div>
            )}
            <Button
              onClick={handleManualRefresh}
              disabled={isManualRefresh || loading || !isApiAvailable}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-32 justify-center"
            >
              {isManualRefresh ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Atualizando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Atualizar ({countdown}s)</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Status Indicators - apenas quando há auto-refresh */}
        {isAutoRefreshing && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Atualizando dados...</span>
            </div>
          </div>
        )}


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderMetricValue(clients.length, isLoadingBackupData)}
            <p className="text-xs text-muted-foreground">Clientes ativos no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backups de BD Bem-sucedidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            {isLoadingBackupData ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-chart-3">{backupStats.successful}</div>
            )}
            <div className="text-xs text-muted-foreground">
              {isLoadingBackupData ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                `${backupStats.total > 0 ? ((backupStats.successful / backupStats.total) * 100).toFixed(1) : 0}% do total`
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas de Backup de BD</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoadingBackupData ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-destructive">{backupStats.failed}</div>
            )}
            <div className="text-xs text-muted-foreground">
              {isLoadingBackupData ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                `${backupStats.total > 0 ? ((backupStats.failed / backupStats.total) * 100).toFixed(1) : 0}% do total`
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingBackupData ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {backupStats.successRate.toFixed(1)}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">Baseado em todos os backups</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Status de Backup de BD</CardTitle>
            <CardDescription>Visão geral do status atual dos backups das bases de dados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center relative h-80 pt-8">
              {isLoadingBackupData ? (
                renderChartSkeleton(true)
              ) : (
                <>
                  <MuiPieChart
                    series={[
                      {
                        startAngle: -90,
                        endAngle: 90,
                        paddingAngle: 5,
                        innerRadius: 80,
                        outerRadius: 120,
                        cy: '50%',
                        data: displayData,
                        cornerRadius: 8,
                      },
                    ]}
                    width={400}
                    height={280}
                    hideLegend
                  />
                  {/* Labels abaixo do gráfico */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
                    <div className="text-center">
                      {hasBackupData ? (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-muted-foreground">Sucesso:</span>
                            <div className="text-2xl font-bold text-green-500">
                              {successPercentage}%
                            </div>
                          </div>
                          <div className="text-muted-foreground">|</div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm text-muted-foreground">Falha:</span>
                            <div className="text-2xl font-bold text-red-500">
                              {failurePercentage}%
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-lg font-medium text-muted-foreground">
                            Nenhum dado disponível
                          </div>
                          <div className="text-sm text-muted-foreground">
                            para o período selecionado
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Area Chart - Estilo da imagem de referência */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Total de Backups</CardTitle>
            <CardDescription>
              {selectedPeriod === '7' 
                ? 'Total dos últimos 7 dias' 
                : selectedPeriod === '30'
                ? 'Total dos últimos 30 dias'
                : 'Total dos últimos 3 meses'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full relative">
              {isLoadingBackupData ? (
                renderBarChartSkeleton(true)
              ) : barChartData.length > 0 ? (
                <div className="relative">
                  <LineChart
                  xAxis={[{ 
                    data: barChartData.map(item => item.group),
                    scaleType: 'band'
                  }]}
                  series={[
                    { 
                      data: barChartData.map(item => item.successful), 
                      label: 'Backups Bem-sucedidos',
                      color: '#22c55e',
                      area: true,
                      curve: 'monotoneX',
                      showMark: false
                    },
                    { 
                      data: barChartData.map(item => item.failed), 
                      label: 'Backups com Falha',
                      color: '#ef4444',
                      area: true,
                      curve: 'monotoneX',
                      showMark: false
                    }
                  ]}
                  height={300}
                  width={undefined}
                  margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
                  grid={{ horizontal: true, vertical: false }}
                  colors={['#22c55e', '#ef4444']}
                />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <p className="text-lg font-medium">Nenhum dado disponível</p>
                    <p className="text-sm">para o período selecionado</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Detalhes dos Clientes</CardTitle>
              <CardDescription>Lista completa dos clientes e status de backup das bases de dados</CardDescription>
            </div>
          </div>
          
          {/* Loading Status */}
          <div className="mt-4">
            {isLoadingBackupData && (
              <div className="mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando dados de backup... Filtros de classificação temporariamente desabilitados.</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns as any} 
            data={filteredClients as any} 
            onRowClick={handleRowClick}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            isStatusFilterDisabled={isLoadingBackupData}
            onExport={handleExportData}
            isExportDisabled={isLoadingBackupData || filteredClients.length === 0}
          />
        </CardContent>
      </Card>
      </div>

      {/* Client Backup Modal */}
      <ClientBackupModal
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </PageWrapper>
  )
}

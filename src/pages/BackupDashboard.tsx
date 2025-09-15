import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageWrapper } from '@/components/PageWrapper'
import { ClientBackupModal } from '@/components/ClientBackupModal'
import { CheckCircle, XCircle, Clock, TrendingUp, Download, Filter, Loader2, Search } from 'lucide-react'
import { PieChart as MuiPieChart } from '@mui/x-charts/PieChart'
import { BarChart } from '@mui/x-charts/BarChart'
import { api } from '@/services/api'
import type { BackupStatsUI, ClientUI } from '@/types/api'
import { formatDateTime, formatWeekday } from '@/lib/dateUtils'
import { ColumnDef } from '@tanstack/react-table'

interface BackupDashboardProps {
  onNavigateToHome: () => void
  onLoadStart?: () => void
  onLoadComplete?: () => void
}

interface BackupClient extends ClientUI {
  lastBackup: string
  successRate: number
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


export function BackupDashboard({ onLoadStart, onLoadComplete }: BackupDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
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

  const handleRetry = async () => {
    setLoading(true)
    setError(null)
    try {
      onLoadStart?.()
      
      const [stats, clientsData, timelineData] = await Promise.all([
        api.backups.getStats(),
        api.backups.getClientsWithBackupStatus(),
        api.backups.getTimeline(parseInt(selectedPeriod))
      ])
      
      // Verificar se há dados válidos
      const hasValidStats = stats && (stats.total > 0 || stats.successful > 0 || stats.failed > 0)
      const hasValidClients = clientsData && clientsData.length > 0
      const hasValidTimeline = timelineData && timelineData.length > 0
      
      if (!hasValidStats && !hasValidClients && !hasValidTimeline) {
        setError('Nenhum dado encontrado. Verifique se a API está funcionando corretamente.')
        setHasData(false)
      } else {
        setError(null)
        setHasData(true)
      }
      
      console.log('BackupDashboard: Dados recebidos:', { stats, clientsData, timelineData })
      console.log('BackupDashboard: Quantidade de clientes:', clientsData?.length)
      
      setBackupStats(stats)
      setClients(clientsData as BackupClient[])
      setTimeSeriesData(timelineData)
      setBarChartData(processTimelineData(timelineData, selectedPeriod))
    } catch (error) {
      console.error('Erro ao recarregar dados do dashboard:', error)
      setError('Erro ao conectar com a API. Verifique sua conexão e tente novamente.')
      setHasData(false)
    } finally {
      setLoading(false)
      onLoadComplete?.()
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null)
        onLoadStart?.()
        
        const [stats, clientsData, timelineData] = await Promise.all([
          api.backups.getStats(),
          api.backups.getClientsWithBackupStatus(),
          api.backups.getTimeline(parseInt(selectedPeriod))
        ])
        
        // Verificar se há dados válidos
        const hasValidStats = stats && (stats.total > 0 || stats.successful > 0 || stats.failed > 0)
        const hasValidClients = clientsData && clientsData.length > 0
        const hasValidTimeline = timelineData && timelineData.length > 0
        
        if (!hasValidStats && !hasValidClients && !hasValidTimeline) {
          setError('Nenhum dado encontrado. Verifique se a API está funcionando corretamente.')
          setHasData(false)
        } else {
          setError(null)
          setHasData(true)
        }
        
        console.log('BackupDashboard: Dados recebidos (loadData):', { stats, clientsData, timelineData })
        console.log('BackupDashboard: Quantidade de clientes (loadData):', clientsData?.length)
        
        setBackupStats(stats)
        setClients(clientsData as BackupClient[])
        setTimeSeriesData(timelineData)
        setBarChartData(processTimelineData(timelineData, selectedPeriod))
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        setError('Erro ao conectar com a API. Verifique sua conexão e tente novamente.')
        setHasData(false)
      } finally {
        setLoading(false)
        onLoadComplete?.()
      }
    }

    loadData()
  }, [selectedPeriod, onLoadStart, onLoadComplete])

  // Atualizar dados do BarChart quando o período mudar
  useEffect(() => {
    if (timeSeriesData.length > 0) {
      setBarChartData(processTimelineData(timeSeriesData, selectedPeriod))
    }
  }, [selectedPeriod, timeSeriesData])

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
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error ? 'Erro ao carregar dados' : 'Nenhum dado encontrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {error || 'Não há dados de backup disponíveis no momento.'}
              </p>
              
              
              <div className="space-y-2 text-sm text-gray-500">
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
  ].filter(item => item.value > 0)

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

  const getStatusBadge = (successRate: number) => {
    let variant = ''
    let label = ''
    let icon = null

    if (successRate >= 95) {
      variant = 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      label = 'Excelente'
      icon = <CheckCircle className="h-3 w-3" />
    } else if (successRate >= 85) {
      variant = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      label = 'Muito Bom'
      icon = <CheckCircle className="h-3 w-3" />
    } else if (successRate >= 70) {
      variant = 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      label = 'Bom'
      icon = <Clock className="h-3 w-3" />
    } else if (successRate >= 50) {
      variant = 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
      label = 'Regular'
      icon = <Clock className="h-3 w-3" />
    } else if (successRate >= 25) {
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

  const handleClientClick = (client: BackupClient) => {
    console.log('BackupDashboard: Cliente clicado:', client)
    console.log('BackupDashboard: Client ID:', client.client_id)
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

  const columns: ColumnDef<BackupClient>[] = [
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
        return (
          <div className="text-sm">
            <div className="font-medium">{formatDateTime((client as any).dataInicio || 'N/A')}</div>
            {(client as any).dataInicio && (client as any).dataInicio !== 'N/A' && (
              <div className="text-muted-foreground text-xs">
                {formatWeekday((client as any).dataInicio)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "dataFim",
      header: "Data Fim",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="text-sm">
            <div className="font-medium">{formatDateTime((client as any).dataFim || 'N/A')}</div>
            {(client as any).dataFim && (client as any).dataFim !== 'N/A' && (
              <div className="text-muted-foreground text-xs">
                {formatWeekday((client as any).dataFim)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "duration",
      header: "Duração",
      cell: ({ row }) => {
        const client = row.original
        const duration = calculateDuration((client as any).dataInicio || '', (client as any).dataFim || '')
        
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{duration}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "successRate",
      header: "Classificação",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(client.status)}
            {getStatusBadge(client.successRate)}
          </div>
        )
      },
    },
  ]

  const getClassification = (successRate: number) => {
    if (successRate >= 95) return 'excellent'
    if (successRate >= 85) return 'very-good'
    if (successRate >= 70) return 'good'
    if (successRate >= 50) return 'regular'
    if (successRate >= 25) return 'bad'
    return 'terrible'
  }

  const filteredClients = clients.filter(client => {
    const clientClassification = getClassification(client.successRate)
    const matchesStatus = statusFilter === 'all' || clientClassification === statusFilter
    const matchesSearch = searchQuery === '' || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.cnpj.includes(searchQuery) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Dashboard de Backup de Bases de Dados</h1>
          <p className="text-muted-foreground">Monitoramento em tempo real dos backups das bases de dados dos clientes</p>
        </div>

      {/* Period Filter */}
      <div className="flex items-center gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 3 meses</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">Clientes ativos no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backups de BD Bem-sucedidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{backupStats.successful}</div>
            <p className="text-xs text-muted-foreground">
              {backupStats.total > 0 ? ((backupStats.successful / backupStats.total) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas de Backup de BD</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{backupStats.failed}</div>
            <p className="text-xs text-muted-foreground">
              {backupStats.total > 0 ? ((backupStats.failed / backupStats.total) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backupStats.successRate.toFixed(1)}%
            </div>
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
              <MuiPieChart
                series={[
                  {
                    startAngle: -90,
                    endAngle: 90,
                    paddingAngle: 5,
                    innerRadius: 80,
                    outerRadius: 120,
                    cy: '50%',
                    data: muiPieData,
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução dos Backups de BD</CardTitle>
            <CardDescription>
              {selectedPeriod === '7' || selectedPeriod === '30' 
                ? 'Status dos backups por dia' 
                : 'Status dos backups por mês'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {barChartData.length > 0 ? (
                <BarChart
                  xAxis={[{ 
                    data: barChartData.map(item => item.group),
                    scaleType: 'band'
                  }]}
                  series={[
                    { 
                      data: barChartData.map(item => item.successful), 
                      label: 'Sucesso',
                      color: '#22c55e'
                    },
                    { 
                      data: barChartData.map(item => item.failed), 
                      label: 'Falha',
                      color: '#ef4444'
                    }
                  ]}
                  height={300}
                  width={undefined}
                  margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
                />
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
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar classificação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="excellent">Excelente (95%+)</SelectItem>
                  <SelectItem value="very-good">Muito Bom (85-94%)</SelectItem>
                  <SelectItem value="good">Bom (70-84%)</SelectItem>
                  <SelectItem value="regular">Regular (50-69%)</SelectItem>
                  <SelectItem value="bad">Ruim (25-49%)</SelectItem>
                  <SelectItem value="terrible">Péssimo (&lt;25%)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, CNPJ ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-muted-foreground">
                  {filteredClients.length} cliente(s) encontrado(s) para "{searchQuery}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Limpar busca
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={filteredClients} 
            onRowClick={handleRowClick}
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

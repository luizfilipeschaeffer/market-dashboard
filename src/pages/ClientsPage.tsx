import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ClientFormPage } from '@/pages/ClientFormPage'
import { ApiValidationSplash } from '@/components/ApiValidationSplash'
import { 
  Plus, 
  Download, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Eye,
  XCircle
} from 'lucide-react'
import { api } from '@/services/api'
import type { ClientUI, ClientStatsUI } from '@/types/api'
import { ColumnDef } from '@tanstack/react-table'
import { formatDateTime, formatWeekday } from '@/lib/dateUtils'
import { generateErrorCode, getErrorCode, getErrorSeverityColor, getErrorCategoryColor } from '@/lib/errorCodes'

interface ClientsPageProps {
  onNavigateToHome: () => void
  onLoadStart?: () => void
  onLoadComplete?: () => void
}

interface ClientWithBackup extends ClientUI {
  lastBackup: string
  totalBackups: number
  successRate: number
}


export function ClientsPage({ onLoadStart, onLoadComplete }: ClientsPageProps) {
  const [clients, setClients] = useState<ClientWithBackup[]>([])
  const [stats, setStats] = useState<ClientStatsUI>({
    totalClients: 0,
    activeClients: 0,
    pendingClients: 0,
    inactiveClients: 0,
    averageSuccessRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [hasData, setHasData] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined)
  const [isApiValidating, setIsApiValidating] = useState(true)
  const [isApiAvailable, setIsApiAvailable] = useState<boolean | null>(null)

  // Callbacks para validação da API
  const handleApiValidationComplete = (isAvailable: boolean) => {
    setIsApiAvailable(isAvailable)
    setIsApiValidating(false)
    
    if (isAvailable) {
      // Se a API está disponível, carregar os dados
      loadData()
    }
  }

  // handleApiRetry removido - agora é gerenciado pelo splash

  const loadData = async () => {
    try {
      setError(null)
      // Não chamar onLoadStart aqui para evitar TransitionSplash duplicado
      // onLoadStart?.()
      const [clientsWithBackupData, statsData] = await Promise.all([
        api.backups.getClientsWithBackupStatus(),
        api.clients.getStats()
      ])
      
      // Verificar se há dados válidos
      const hasValidClients = clientsWithBackupData && clientsWithBackupData.length > 0
      const hasValidStats = statsData && statsData.totalClients > 0
      
      if (!hasValidClients && !hasValidStats) {
        setError('Nenhum dado encontrado. Verifique se a API está funcionando corretamente.')
        setHasData(false)
      } else {
        setError(null)
        setHasData(true)
      }
      
      // Mapear dados para o formato esperado pela interface
      const clientsWithBackup: ClientWithBackup[] = clientsWithBackupData.map(client => ({
        ...client,
        totalBackups: 0, // Será calculado se necessário
        successRate: client.successRate || 0
      }))
      
      setClients(clientsWithBackup)
      setStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar dados dos clientes:', error)
      const errorCode = generateErrorCode(error as Error)
      setErrorCode(errorCode)
      setError('Erro ao conectar com a API. Verifique sua conexão e tente novamente.')
      setHasData(false)
    } finally {
      setLoading(false)
      onLoadComplete?.()
    }
  }

  // useEffect removido - loadData agora é chamado apenas após validação da API

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      inactive: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente'
    }
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleClientAction = (action: string, client: ClientWithBackup) => {
    switch (action) {
      case 'view':
        setSelectedClientId(client.client_id)
        setShowForm(true)
        break
      case 'edit':
        setSelectedClientId(client.client_id)
        setShowForm(true)
        break
      case 'activate':
        // Implementar ativação do cliente
        break
      case 'deactivate':
        // Implementar desativação do cliente
        break
      case 'settings':
        // Implementar configurações do cliente
        break
      case 'copy':
        navigator.clipboard.writeText(client.client_id)
        // Implementar notificação de cópia
        break
      case 'delete':
        // Implementar exclusão do cliente
        break
      default:
        break
    }
  }

  const handleNavigateBack = () => {
    setShowForm(false)
    setSelectedClientId(undefined)
  }

  const handleNewClient = () => {
    setSelectedClientId(undefined)
    setShowForm(true)
  }

  const handleRowClick = (client: ClientWithBackup) => {
    setSelectedClientId(client.client_id)
    setShowForm(true)
  }

  const columns: ColumnDef<ClientWithBackup>[] = [
    {
      accessorKey: "name",
      header: "Cliente",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={client.logo} alt={client.name} />
              <AvatarFallback>
                <Building2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{client.name}</div>
              <div className="text-sm text-muted-foreground font-mono">{client.cnpj}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Contato",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{client.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{client.address}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(client.status)}
            {getStatusBadge(client.status)}
          </div>
        )
      },
    },
    {
      accessorKey: "lastBackup",
      header: "Último Backup",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">{formatDateTime(client.lastBackup)}</div>
            {client.lastBackup !== 'N/A' && (
              <div className="text-xs text-muted-foreground">
                {formatWeekday(client.lastBackup)}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {client.totalBackups} backups totais
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const client = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Opções
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 z-[9999]">
              <DropdownMenuLabel>Ações do Cliente</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleClientAction('view', client)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleClientAction('edit', client)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Cliente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Mostrar splash com validação da API se ainda estiver validando
  if (isApiValidating) {
    return (
      <ApiValidationSplash 
        onComplete={handleApiValidationComplete}
        pageName="Gestão de Clientes"
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
            <span>Carregando clientes...</span>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Exibir mensagem de erro ou dados vazios
  if (error || !hasData) {
    const errorInfo = errorCode ? getErrorCode(errorCode) : null
    
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 mx-auto bg-destructive/10 dark:bg-destructive/20 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {error ? 'Erro ao carregar clientes' : 'Nenhum cliente encontrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {error || 'Não há clientes cadastrados no momento.'}
              </p>
              
              {errorCode && errorInfo && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Badge className={getErrorSeverityColor(errorInfo.severity)}>
                      {errorInfo.severity.toUpperCase()}
                    </Badge>
                    <Badge className={getErrorCategoryColor(errorInfo.category)}>
                      {errorInfo.category.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="font-mono">
                      {errorCode}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {errorInfo.description}
                  </p>
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => window.open(`/faq#${errorCode}`, '_blank')}
                    className="text-primary hover:text-primary/80"
                  >
                    Ver soluções detalhadas →
                  </Button>
                </div>
              )}
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Possíveis causas:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>API não está respondendo</li>
                  <li>Não há clientes cadastrados</li>
                  <li>Problema de conectividade</li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="mt-4"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (showForm) {
    return (
      <ClientFormPage
        clientId={selectedClientId}
        onNavigateBack={handleNavigateBack}
        onLoadStart={onLoadStart}
        onLoadComplete={onLoadComplete}
      />
    )
  }

  return (
    <PageWrapper pageTitle="Gestão de Clientes">
      <div className="space-y-6">
        {/* Subtitle */}
        <div className="space-y-2">
          <p className="text-muted-foreground">Gerencie informações e status dos clientes do sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeClients}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalClients > 0 ? ((stats.activeClients / stats.totalClients) * 100).toFixed(1) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Inativos</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactiveClients}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalClients > 0 ? ((stats.inactiveClients / stats.totalClients) * 100).toFixed(1) : 0}% do total
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Lista de Clientes</CardTitle>
                <CardDescription>Gerencie e visualize informações dos clientes</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm" onClick={handleNewClient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-visible">

            {/* Clients DataTable */}
            <DataTable columns={columns} data={clients} onRowClick={handleRowClick} />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

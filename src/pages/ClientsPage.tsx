import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import { PageWrapper } from '@/components/PageWrapper'
import { ClientFormPage } from '@/pages/ClientFormPage'
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null)
        onLoadStart?.()
        const [clientsData, statsData, backupData] = await Promise.all([
          api.clients.getAll(),
          api.clients.getStats(),
          api.backups.getAll()
        ])
        
        // Verificar se há dados válidos
        const hasValidClients = clientsData && clientsData.length > 0
        const hasValidStats = statsData && statsData.totalClients > 0
        const hasValidBackups = backupData && backupData.length > 0
        
        if (!hasValidClients && !hasValidStats && !hasValidBackups) {
          setError('Nenhum dado encontrado. Verifique se a API está funcionando corretamente.')
          setHasData(false)
        } else {
          setError(null)
          setHasData(true)
        }
        
        // Adicionar informações de backup aos clientes
        const clientsWithBackup: ClientWithBackup[] = clientsData.map(client => {
          const clientBackups = backupData.filter(b => b.client_id === client.client_id)
          const lastBackup = clientBackups.length > 0 
            ? clientBackups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
            : 'N/A'
          
          const totalBackups = clientBackups.length
          const successfulBackups = clientBackups.filter(b => b.status === 'success').length
          const successRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0
          
          return {
          ...client,
            lastBackup,
            totalBackups,
            successRate: Math.round(successRate * 10) / 10
          }
        })
        
        setClients(clientsWithBackup)
        setStats(statsData)
      } catch (error) {
        console.error('Erro ao carregar dados dos clientes:', error)
        const code = generateErrorCode(error as Error)
        const errorInfo = getErrorCode(code)
        setErrorCode(code)
        setError(errorInfo?.title || 'Erro ao conectar com a API. Verifique sua conexão e tente novamente.')
        setHasData(false)
      } finally {
        setLoading(false)
        onLoadComplete?.()
      }
    }

    loadData()
  }, [onLoadStart, onLoadComplete])

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200',
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
        return <CheckCircle className="h-4 w-4 text-green-600" />
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
        console.log('Ativar cliente:', client.name)
        // Implementar ativação do cliente
        break
      case 'deactivate':
        console.log('Desativar cliente:', client.name)
        // Implementar desativação do cliente
        break
      case 'settings':
        console.log('Configurações do cliente:', client.name)
        // Implementar configurações do cliente
        break
      case 'copy':
        navigator.clipboard.writeText(client.client_id)
        console.log('ID copiado:', client.client_id)
        // Implementar notificação de cópia
        break
      case 'delete':
        console.log('Excluir cliente:', client.name)
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
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error ? 'Erro ao carregar clientes' : 'Nenhum cliente encontrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {error || 'Não há clientes cadastrados no momento.'}
              </p>
              
              {errorCode && errorInfo && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
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
                  <p className="text-sm text-gray-600 mb-2">
                    {errorInfo.description}
                  </p>
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => window.open(`/faq#${errorCode}`, '_blank')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Ver soluções detalhadas →
                  </Button>
                </div>
              )}
              
              <div className="space-y-2 text-sm text-gray-500">
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
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Gerencie informações e status dos clientes do sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeClients}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalClients > 0 ? ((stats.activeClients / stats.totalClients) * 100).toFixed(1) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingClients}</div>
              <p className="text-xs text-muted-foreground">Aguardando ativação</p>
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

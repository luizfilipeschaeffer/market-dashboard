import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { PageWrapper } from '@/components/PageWrapper'
import { CheckCircle, XCircle, Clock, TrendingUp, Download, Filter } from 'lucide-react'
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts'

interface BackupDashboardProps {
  onNavigateToHome: () => void
}

interface BackupClient {
  id: string
  name: string
  cnpj: string
  logo: string
  lastBackup: string
  status: 'success' | 'failed' | 'in-progress' | 'pending'
  successRate: number
}

interface BackupStats {
  successful: number
  failed: number
  inProgress: number
  pending: number
}

interface TimeSeriesData {
  date: string
  successful: number
  failed: number
  inProgress: number
}

export function BackupDashboard({}: BackupDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [statusFilter, setStatusFilter] = useState('all')

  // Mock data
  const backupStats: BackupStats = {
    successful: 45,
    failed: 8,
    inProgress: 3,
    pending: 2
  }

  const timeSeriesData: TimeSeriesData[] = [
    { date: '2024-01-01', successful: 42, failed: 5, inProgress: 2 },
    { date: '2024-01-02', successful: 44, failed: 4, inProgress: 1 },
    { date: '2024-01-03', successful: 43, failed: 6, inProgress: 3 },
    { date: '2024-01-04', successful: 45, failed: 3, inProgress: 2 },
    { date: '2024-01-05', successful: 46, failed: 2, inProgress: 1 },
    { date: '2024-01-06', successful: 44, failed: 7, inProgress: 2 },
    { date: '2024-01-07', successful: 45, failed: 8, inProgress: 3 }
  ]

  const clients: BackupClient[] = [
    {
      id: '1',
      name: 'Empresa Alpha Ltda',
      cnpj: '12.345.678/0001-90',
      logo: '/api/placeholder/40/40',
      lastBackup: '2024-01-07 23:30:00',
      status: 'success',
      successRate: 95.2
    },
    {
      id: '2',
      name: 'Beta Corporação',
      cnpj: '98.765.432/0001-10',
      logo: '/api/placeholder/40/40',
      lastBackup: '2024-01-07 22:15:00',
      status: 'failed',
      successRate: 78.5
    },
    {
      id: '3',
      name: 'Gamma Solutions',
      cnpj: '11.222.333/0001-44',
      logo: '/api/placeholder/40/40',
      lastBackup: '2024-01-07 23:45:00',
      status: 'in-progress',
      successRate: 92.1
    },
    {
      id: '4',
      name: 'Delta Tech',
      cnpj: '55.666.777/0001-88',
      logo: '/api/placeholder/40/40',
      lastBackup: '2024-01-06 21:30:00',
      status: 'success',
      successRate: 98.7
    },
    {
      id: '5',
      name: 'Epsilon Industries',
      cnpj: '99.888.777/0001-66',
      logo: '/api/placeholder/40/40',
      lastBackup: '2024-01-07 20:00:00',
      status: 'pending',
      successRate: 85.3
    }
  ]

  const pieData = [
    { name: 'Sucesso', value: backupStats.successful, color: 'hsl(150, 50%, 40%)' },
    { name: 'Falha', value: backupStats.failed, color: 'hsl(0, 70%, 50%)' },
    { name: 'Em Progresso', value: backupStats.inProgress, color: 'hsl(30, 80%, 55%)' },
    { name: 'Pendente', value: backupStats.pending, color: 'hsl(210, 20%, 45%)' }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-chart-3" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'in-progress':
        return <Clock className="h-4 w-4 text-chart-4" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      failed: 'bg-destructive/10 text-destructive border-destructive/20',
      'in-progress': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      pending: 'bg-muted text-muted-foreground border-muted-foreground/20'
    }
    const labels = {
      success: 'Sucesso',
      failed: 'Falha',
      'in-progress': 'Em Progresso',
      pending: 'Pendente'
    }
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const filteredClients = statusFilter === 'all' 
    ? clients 
    : clients.filter(client => client.status === statusFilter)

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
            <div className="text-2xl font-bold">{Object.values(backupStats).reduce((a, b) => a + b, 0)}</div>
            <p className="text-xs text-muted-foreground">+2.1% desde o último período</p>
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
              {((backupStats.successful / Object.values(backupStats).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}% do total
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
              {((backupStats.failed / Object.values(backupStats).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}% do total
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
              {(clients.reduce((acc, client) => acc + client.successRate, 0) / clients.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Baseado em todos os clientes</p>
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--chart-1))"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução dos Backups de BD</CardTitle>
            <CardDescription>Tendência dos status de backup das bases de dados ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="successful" stroke="hsl(150, 50%, 40%)" strokeWidth={2} name="Sucesso" />
                <Line type="monotone" dataKey="failed" stroke="hsl(0, 70%, 50%)" strokeWidth={2} name="Falha" />
                <Line type="monotone" dataKey="inProgress" stroke="hsl(30, 80%, 55%)" strokeWidth={2} name="Em Progresso" />
              </LineChart>
            </ResponsiveContainer>
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
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="failed">Falha</SelectItem>
                  <SelectItem value="in-progress">Em Progresso</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Último Backup de BD</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Taxa de Sucesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={client.logo} alt={client.name} />
                        <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{client.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{client.cnpj}</TableCell>
                  <TableCell>{client.lastBackup}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(client.status)}
                      {getStatusBadge(client.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={client.successRate} className="w-16" />
                      <span className="text-sm font-medium">{client.successRate}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </PageWrapper>
  )
}

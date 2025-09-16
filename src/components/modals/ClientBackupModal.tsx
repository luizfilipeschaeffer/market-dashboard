import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, XCircle, Clock, TrendingUp, Download, Filter, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts'
import { api } from '../../services/api'
import type { ClientUI } from '@/types/api'

interface ClientBackupModalProps {
  client: ClientUI | null
  isOpen: boolean
  onClose: () => void
}

interface ClientBackupStats {
  successful: number
  failed: number
  total: number
  successRate: number
}

interface BackupRecord {
  backup_id: string
  client_id: string
  client_name: string
  date: string
  status: string
  duration: string
  size: string
  vacuumExecutado: boolean
  mensagem: string
}

interface TimeSeriesData {
  date: string
  successful: number
  failed: number
}

export function ClientBackupModal({ client, isOpen, onClose }: ClientBackupModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [statusFilter, setStatusFilter] = useState('all')
  const [backupStats, setBackupStats] = useState<ClientBackupStats>({
    successful: 0,
    failed: 0,
    total: 0,
    successRate: 0
  })
  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(50)

  useEffect(() => {
    if (client && isOpen) {
      loadClientData()
    }
  }, [client, isOpen, selectedPeriod])

  const loadClientData = async () => {
    if (!client) return
    
    setLoading(true)
    try {
      
      // Usar diretamente o endpoint /api/dashboard/backup/cliente/{id}
      let allClientBackups: any[] = []
      let timelineData: any[] = []
      
      try {
        const [apiBackups, apiTimeline] = await Promise.all([
          api.backups.getByClientId(client.client_id), // Este método já chama listarBackupsPorCliente
          api.backups.getTimeline(parseInt(selectedPeriod))
        ])
        allClientBackups = apiBackups
        timelineData = apiTimeline
      } catch (apiError) {
        console.error('Erro na API real:', apiError)
        // Não usar dados mock, apenas definir arrays vazios
        allClientBackups = []
        timelineData = []
      }
      
      // Filtrar backups pelo período selecionado
      const days = parseInt(selectedPeriod)
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))
      
      // Ajustar para incluir o dia inteiro (início do dia para startDate, fim do dia para endDate)
      startDate.setHours(0, 0, 0, 0) // 00:00:00
      endDate.setHours(23, 59, 59, 999) // 23:59:59.999
      
      
      const clientBackups = allClientBackups.filter((backup: any) => {
        const backupDate = new Date(backup.date)
        const isInRange = backupDate >= startDate && backupDate <= endDate
        return isInRange
      })
      
      
      // Calcular estatísticas reais baseadas no período filtrado
      const successful = clientBackups.filter((b: any) => b.status === 'success').length
      const failed = clientBackups.filter((b: any) => b.status === 'failed').length
      const total = clientBackups.length
      const successRate = total > 0 ? (successful / total) * 100 : 0
      
      
      setBackupStats({
        successful,
        failed,
        total,
        successRate: Math.round(successRate * 10) / 10
      })
      
      // Converter backups para formato do modal
      const backupRecords: BackupRecord[] = clientBackups.map((backup: any) => ({
        backup_id: backup.backup_id,
        client_id: backup.client_id,
        client_name: backup.client_name,
        date: new Date(backup.date).toLocaleString('pt-BR'),
        status: backup.status,
        duration: backup.duration,
        size: backup.size,
        vacuumExecutado: backup.vacuumExecutado,
        mensagem: backup.mensagem || 'N/A'
      }))
      
      setBackupRecords(backupRecords)
      setTimeSeriesData(timelineData || [])
      
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error)
      console.error('Cliente ID:', client.client_id)
      console.error('Erro detalhado:', error)
      
      // Definir dados vazios em caso de erro
      setBackupStats({
        successful: 0,
        failed: 0,
        total: 0,
        successRate: 0
      })
      setBackupRecords([])
      setTimeSeriesData([])
    } finally {
      setLoading(false)
    }
  }


  const pieData = [
    { name: 'Sucesso', value: backupStats.successful, color: 'hsl(150, 50%, 40%)' },
    { name: 'Falha', value: backupStats.failed, color: 'hsl(0, 70%, 50%)' }
  ].filter(item => item.value > 0)

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

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      failed: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
    }
    const labels = {
      success: 'Sucesso',
      failed: 'Falha'
    }
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const filteredRecords = statusFilter === 'all' 
    ? backupRecords 
    : backupRecords.filter(record => record.status === statusFilter)

  // Lógica de paginação
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const endIndex = startIndex + recordsPerPage
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

  // Resetar página quando filtro mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter])

  if (!client) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div>
            <DialogTitle className="text-2xl font-bold">
              Detalhes de Backup - {client.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              CNPJ: {client.cnpj} | Status: {client.status}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{backupStats.total}</div>
                <p className="text-xs text-muted-foreground">No período selecionado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Backups Bem-sucedidos</CardTitle>
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
                <CardTitle className="text-sm font-medium">Falhas de Backup</CardTitle>
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
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
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
                <CardTitle>Distribuição de Status de Backup</CardTitle>
                <CardDescription>Visão geral do status dos backups do cliente</CardDescription>
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
                <CardTitle>Evolução dos Backups</CardTitle>
                <CardDescription>Tendência dos status de backup ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {backupStats.successful > 0 && (
                      <Line type="monotone" dataKey="successful" stroke="hsl(150, 50%, 40%)" strokeWidth={2} name="Sucesso" />
                    )}
                    {backupStats.failed > 0 && (
                      <Line type="monotone" dataKey="failed" stroke="hsl(0, 70%, 50%)" strokeWidth={2} name="Falha" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Backup Records Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Registros de Backup</CardTitle>
                  <CardDescription>Histórico detalhado dos backups do cliente</CardDescription>
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
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Carregando registros...</span>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Vacuum</TableHead>
                      <TableHead>Mensagem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record) => (
                      <TableRow key={record.backup_id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            {getStatusBadge(record.status)}
                          </div>
                        </TableCell>
                        <TableCell>{record.duration}</TableCell>
                        <TableCell>{record.size}</TableCell>
                        <TableCell>
                          <Badge className={record.vacuumExecutado 
                            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                            : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                          }>
                            {record.vacuumExecutado ? "Sim" : "Não"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={record.mensagem}>
                            {record.mensagem}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {/* Controles de Paginação */}
              {!loading && filteredRecords.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredRecords.length)} de {filteredRecords.length} registros
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber: number
                        if (totalPages <= 5) {
                          pageNumber = i + 1
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i
                        } else {
                          pageNumber = currentPage - 2 + i
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        )
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { 
  Cliente, 
  Backup, 
  BackupRequestDTO, 
  BackupDashboardDTO, 
  BackupDashboardIndicadoresDTO, 
  ClienteBackupStatusDTO, 
  BackupHistoricoDTO,
  IndicadoresParams,
  ClientesStatusParams,
  AtualizarDataFimParams,
  ApiError,
  ApiConfig,
  DEFAULT_API_CONFIG,
  ClientUI,
  BackupUI,
  BackupStatsUI,
  ClientStatsUI
} from '@/types/api'

// ===== CONFIGURAÇÃO E UTILITÁRIOS =====

class ApiService {
  private config: ApiConfig
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key)
  if (!cached) return false
    return Date.now() - cached.timestamp < this.CACHE_DURATION
  }

  private async getCachedData<T>(key: string, loader: () => Promise<T>): Promise<T> {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)!.data
  }
  
  const data = await loader()
    this.cache.set(key, { data, timestamp: Date.now() })
  return data
}

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, defaultOptions)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API: Erro na resposta:', errorData)
        throw new ApiError({
          message: errorData.message || `HTTP ${response.status}`,
          status: response.status,
          details: errorData
        })
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API: Erro na requisição:', error)
      if (error instanceof ApiError) {
        throw error
      }
      
      throw new ApiError({
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 0,
        details: error
      })
    }
  }

  // ===== ENDPOINTS DA API =====


  // GET /api/clientes
  async listarClientes(): Promise<Cliente[]> {
    return this.getCachedData('clientes-lista', () =>
      this.makeRequest<Cliente[]>('/api/clientes')
    )
  }

  // POST /api/clientes
  async criarCliente(cliente: Omit<Cliente, 'id' | 'dataInclusao' | 'backups'>): Promise<Cliente> {
    return this.makeRequest<Cliente>('/api/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente)
    })
  }

  // POST /api/backups
  async criarBackup(backup: BackupRequestDTO): Promise<Backup> {
    return this.makeRequest<Backup>('/api/backups', {
      method: 'POST',
      body: JSON.stringify(backup)
    })
  }

  // GET /api/dashboard/backup/resumo
  async getResumoBackups(): Promise<BackupDashboardDTO> {
    return this.getCachedData('backup-resumo', () =>
      this.makeRequest<BackupDashboardDTO>('/api/dashboard/backup/resumo')
    )
  }

  // GET /api/dashboard/backup/indicadores
  async getIndicadores(params: IndicadoresParams = {}): Promise<BackupDashboardIndicadoresDTO> {
    const queryParams = new URLSearchParams()
    if (params.dias) queryParams.append('dias', params.dias.toString())
    
    const endpoint = `/api/dashboard/backup/indicadores${queryParams.toString() ? `?${queryParams}` : ''}`
    
    return this.getCachedData(`indicadores-${params.dias || 30}`, () =>
      this.makeRequest<BackupDashboardIndicadoresDTO>(endpoint)
    )
  }

  // GET /api/dashboard/backup/clientes
  async listarStatusClientes(params: ClientesStatusParams = {}): Promise<ClienteBackupStatusDTO[]> {
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.dias) queryParams.append('dias', params.dias.toString())
    
    const endpoint = `/api/dashboard/backup/clientes${queryParams.toString() ? `?${queryParams}` : ''}`
    
    return this.getCachedData(`clientes-status-${params.status || 'all'}-${params.dias || 30}`, () =>
      this.makeRequest<ClienteBackupStatusDTO[]>(endpoint)
    )
  }

  // GET /api/dashboard/backup/cliente/{id}
  async listarBackupsPorCliente(id: number): Promise<BackupHistoricoDTO[]> {
    return this.getCachedData(`backups-cliente-${id}`, async () => {
      try {
        const result = await this.makeRequest<BackupHistoricoDTO[]>(`/api/dashboard/backup/cliente/${id}`)
        return result
      } catch (error) {
        console.error('API: Erro na requisição listarBackupsPorCliente:', error)
        throw error
      }
    })
  }

  // PUT /api/backups/{id}
  async atualizarInformacoesBackup(id: number, backup: BackupRequestDTO): Promise<void> {
    await this.makeRequest(`/api/backups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backup)
    })
    
    // Invalidar cache relacionado
    this.clearCache()
  }

  // PUT /api/backups/{id}/data-fim
  async atualizarDataFim(params: AtualizarDataFimParams): Promise<void> {
    const queryParams = new URLSearchParams()
    queryParams.append('novaDataFim', params.novaDataFim)
    
    await this.makeRequest(`/api/backups/${params.id}/data-fim?${queryParams}`, {
      method: 'PUT'
    })
    
    // Invalidar cache relacionado
    this.clearCache()
  }

  // ===== MÉTODOS DE COMPATIBILIDADE COM UI EXISTENTE =====

  // Mapear Cliente (do endpoint /api/clientes) para ClientUI
  private mapClienteFromAPI(cliente: Cliente): ClientUI {
    return {
      client_id: cliente.id.toString(),
      name: cliente.nome,
      cnpj: cliente.cnpj,
      email: cliente.email,
      phone: '', // Não disponível na API
      address: '', // Não disponível na API
      status: cliente.ativo ? 'active' : 'inactive',
      join_date: cliente.dataInclusao,
      logo: '' // Não disponível na API
    }
  }


  // Mapear BackupHistoricoDTO para BackupUI
  private mapBackupToUI(backup: BackupHistoricoDTO, clientId: number, clientName: string): BackupUI {
    // Usar dataFim se disponível, senão usar dataInicio
    const backupDate = backup.dataFim || backup.dataInicio
    
    const mappedBackup: BackupUI = {
      backup_id: backup.id.toString(),
      client_id: clientId.toString(),
      client_name: clientName,
      date: backupDate, // Usar dataFim se disponível, senão dataInicio
      status: backup.status === 'SUCESSO' ? 'success' : 'failed',
      duration: this.calculateDuration(backup.dataInicio, backup.dataFim),
      size: backup.tamanhoEmMb ? `${backup.tamanhoEmMb.toFixed(2)} MB` : 'N/A',
      vacuumExecutado: backup.vacuumExecutado || false,
      mensagem: backup.mensagem || 'N/A',
      databaseBackup: backup.databaseBackup || 'N/A',
      caminhoBackup: backup.caminhoBackup || 'N/A',
      ipBackup: backup.ipBackup || 'N/A'
    }
    
    return mappedBackup
  }

  // Calcular duração entre dataInicio e dataFim
  private calculateDuration(dataInicio: string, dataFim: string): string {
    try {
      const inicio = new Date(dataInicio)
      const fim = new Date(dataFim)
      const diffMs = fim.getTime() - inicio.getTime()
      
      if (diffMs < 0) return '0s'
      
      const diffSeconds = Math.floor(diffMs / 1000)
      const diffMinutes = Math.floor(diffSeconds / 60)
      const diffHours = Math.floor(diffMinutes / 60)
      
      if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes % 60}m`
      } else if (diffMinutes > 0) {
        return `${diffMinutes}m ${diffSeconds % 60}s`
      } else {
        return `${diffSeconds}s`
      }
    } catch {
      return 'N/A'
    }
  }

  // ===== APIS COMPATÍVEIS COM UI EXISTENTE =====

  async getAllClients(): Promise<ClientUI[]> {
    const clientes = await this.listarClientes()
    return clientes.map(cliente => this.mapClienteFromAPI(cliente))
  }

  async getClientById(id: string): Promise<ClientUI | null> {
    const clientes = await this.getAllClients()
    return clientes.find(client => client.client_id === id) || null
  }

  async getClientStats(): Promise<ClientStatsUI> {
    const indicadores = await this.getIndicadores()
    const clientes = await this.listarClientes()

    return {
      totalClients: indicadores.totalClientes,
      activeClients: clientes.filter(c => c.ativo).length,
      pendingClients: 0, // Não disponível na API
      inactiveClients: clientes.filter(c => !c.ativo).length,
      averageSuccessRate: indicadores.taxaSucesso
    }
  }

  async getAllBackups(): Promise<BackupUI[]> {
    const clientes = await this.listarStatusClientes()
    const allBackups: BackupUI[] = []
    
    for (const cliente of clientes) {
      const backups = await this.listarBackupsPorCliente(cliente.id)
      const mappedBackups = backups.map(backup => 
        this.mapBackupToUI(backup, cliente.id, cliente.nome)
      )
      allBackups.push(...mappedBackups)
    }
    
    return allBackups
  }

  async getBackupsByClientId(clientId: string): Promise<BackupUI[]> {
    const id = parseInt(clientId)
    
    try {
      const backups = await this.listarBackupsPorCliente(id)
      
      const cliente = await this.listarStatusClientes().then(clientes => 
        clientes.find(c => c.id === id)
      )
      
      if (!cliente) {
        return []
      }
      
      const mappedBackups = backups.map(backup => 
        this.mapBackupToUI(backup, id, cliente.nome)
      )
      
      return mappedBackups
    } catch (error) {
      console.error('API: Erro em getBackupsByClientId:', error)
      throw error
    }
  }

  async getBackupStats(days: number = 30): Promise<BackupStatsUI> {
    try {
      // Usar indicadores com período específico
      const indicadores = await this.getIndicadores({ dias: days })
      
      console.log('Indicadores da API:', indicadores)
      
      return {
        successful: indicadores.backupsSucesso || 0,
        failed: indicadores.backupsFalha || 0,
        total: (indicadores.backupsSucesso || 0) + (indicadores.backupsFalha || 0),
        successRate: indicadores.taxaSucesso || 0
      }
    } catch (error) {
      console.error('Erro ao carregar stats, usando fallback:', error)
      // Fallback: usar dados do resumo geral
      try {
        const resumo = await this.getResumoBackups()
        return {
          successful: resumo.sucessos || 0,
          failed: resumo.falhas || 0,
          total: resumo.total || 0,
          successRate: resumo.percentualSucesso || 0
        }
      } catch (fallbackError) {
        console.error('Erro no fallback, usando dados padrão:', fallbackError)
        return {
          successful: 0,
          failed: 0,
          total: 0,
          successRate: 0
        }
      }
    }
  }

  async getBackupTimeline(days: number = 30): Promise<{ date: string; successful: number; failed: number }[]> {
    try {
      // Obter todos os backups dos últimos N dias
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - days)
      
      const backups = await this.getAllBackups()
      
      // Filtrar backups do período especificado
      const recentBackups = backups.filter((backup: BackupUI) => {
        const backupDate = new Date(backup.date)
        return backupDate >= startDate && backupDate <= endDate
      })
      
      // Agrupar por data e contar sucessos/falhas
      const timelineMap = new Map<string, { successful: number; failed: number }>()
      
      recentBackups.forEach((backup: BackupUI) => {
        const dateKey = backup.date.split('T')[0] // YYYY-MM-DD
        const status = backup.status === 'success' ? 'successful' : 'failed'
        
        if (!timelineMap.has(dateKey)) {
          timelineMap.set(dateKey, { successful: 0, failed: 0 })
        }
        
        const current = timelineMap.get(dateKey)!
        current[status]++
      })
      
      // Converter para array e ordenar por data
      const timelineData = Array.from(timelineMap.entries())
        .map(([date, counts]) => ({
          date,
          successful: counts.successful,
          failed: counts.failed
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      // Retornar dados reais ou array vazio se não há dados
      if (timelineData.length === 0) {
        return []
      }
      
      return timelineData
    } catch (error) {
      console.error('Erro ao gerar timeline de backups:', error)
      return []
    }
  }

  async getClientsWithBackupStatus(): Promise<Array<ClientUI & { lastBackup: string; successRate: number; dataInicio?: string; dataFim?: string; databaseBackup: string }>> {
    // Primeira requisição: buscar lista de clientes do endpoint /api/clientes
    const clientes = await this.listarClientes()
    
    // Segunda requisição: buscar status de backup dos clientes do endpoint /api/dashboard/backup/clientes
    const clientesBackupStatus = await this.listarStatusClientes()
    
    // Combinar dados dos dois endpoints
    const clientesComDetalhes = clientes.map((cliente) => {
      // Encontrar o status de backup correspondente
      const backupStatus = clientesBackupStatus.find(bs => bs.id === cliente.id)
      
        if (backupStatus) {
          return {
            ...this.mapClienteFromAPI(cliente),
            lastBackup: backupStatus.dataFim || 'N/A',
            successRate: backupStatus.taxaSucesso,
            dataInicio: backupStatus.dataInicio,
            dataFim: backupStatus.dataFim,
            databaseBackup: backupStatus.databaseBackup || 'N/A'
          }
        } else {
          // Se não encontrar status de backup, usar dados básicos do cliente
          return {
            ...this.mapClienteFromAPI(cliente),
            lastBackup: 'N/A',
            successRate: 0,
            dataInicio: undefined,
            dataFim: undefined,
            databaseBackup: 'N/A'
          }
        }
    })
    
    return clientesComDetalhes
  }

  // Nova função para carregar dados em etapas
  async getClientsWithBackupStatusProgressive(days: number = 30): Promise<{
    clients: ClientUI[],
    loadBackupData: () => Promise<Array<ClientUI & { lastBackup: string; successRate: number; dataInicio?: string; dataFim?: string; databaseBackup: string }>>
  }> {
    // Primeira requisição: buscar lista de clientes do endpoint /api/clientes
    const clientes = await this.listarClientes()
    
    const clientsUI = clientes.map(cliente => this.mapClienteFromAPI(cliente))
    
    // Retornar função para carregar dados de backup
    const loadBackupData = async (): Promise<Array<ClientUI & { lastBackup: string; successRate: number; dataInicio?: string; dataFim?: string; databaseBackup: string }>> => {
      // Segunda requisição: buscar status de backup dos clientes do endpoint /api/dashboard/backup/clientes com período
      const clientesBackupStatus = await this.listarStatusClientes({ dias: days })
      
      // Combinar dados dos dois endpoints
      const clientesComDetalhes = clientsUI.map((cliente) => {
        // Encontrar o status de backup correspondente
        const backupStatus = clientesBackupStatus.find(bs => bs.id === parseInt(cliente.client_id))
        
        
        if (backupStatus) {
          // TEMPORÁRIO: Forçar alguns clientes a terem successRate baixo para testar o filtro
          let testSuccessRate = backupStatus.taxaSucesso
          if (cliente.name.includes('Cloud') || cliente.name.includes('Tech')) {
            testSuccessRate = Math.random() * 20 // 0-20% para testar filtro "Péssimo"
          }
          
          return {
            ...cliente,
            lastBackup: backupStatus.dataFim || 'N/A',
            successRate: testSuccessRate,
            dataInicio: backupStatus.dataInicio,
            dataFim: backupStatus.dataFim,
            databaseBackup: backupStatus.databaseBackup || 'N/A'
          }
        } else {
          // Se não encontrar status de backup, usar dados básicos do cliente
          return {
            ...cliente,
            lastBackup: 'N/A',
            successRate: 0,
            dataInicio: undefined,
            dataFim: undefined,
            databaseBackup: 'N/A'
          }
        }
      })
      
      return clientesComDetalhes
    }
    
    return {
      clients: clientsUI,
      loadBackupData
    }
  }

  // ===== MÉTODOS DE POST EM LOTE =====

  // POST /api/clientes (em lote)
  async criarClientesEmLote(clientes: Array<Omit<Cliente, 'id' | 'dataInclusao' | 'backups'>>): Promise<{
    success: boolean
    totalProcessed: number
    successful: number
    failed: number
    results: Array<{
      index: number
      success: boolean
      clientId?: number
      error?: string
    }>
  }> {
    const results: Array<{
      index: number
      success: boolean
      clientId?: number
      error?: string
    }> = []
    
    let successful = 0
    let failed = 0


    // Processar clientes em lotes de 10 para evitar sobrecarga
    const batchSize = 10
    for (let i = 0; i < clientes.length; i += batchSize) {
      const batch = clientes.slice(i, i + batchSize)
      
      // Processar lote em paralelo
      const batchPromises = batch.map(async (cliente, batchIndex) => {
        const globalIndex = i + batchIndex
        try {
          const createdClient = await this.criarCliente(cliente)
          
          return {
            index: globalIndex,
            success: true,
            clientId: createdClient.id
          }
        } catch (error) {
          console.error(`API: Erro ao criar cliente ${globalIndex + 1}:`, error)
          return {
            index: globalIndex,
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // Contar sucessos e falhas
      batchResults.forEach(result => {
        if (result.success) {
          successful++
        } else {
          failed++
        }
      })

      // Pequena pausa entre lotes para não sobrecarregar a API
      if (i + batchSize < clientes.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }


    return {
      success: failed === 0,
      totalProcessed: clientes.length,
      successful,
      failed,
      results
    }
  }

  // POST /api/backups (em lote)
  async criarBackupsEmLote(backups: BackupRequestDTO[]): Promise<{
    success: boolean
    totalProcessed: number
    successful: number
    failed: number
    results: Array<{
      index: number
      success: boolean
      backupId?: number
      error?: string
    }>
  }> {
    const results: Array<{
      index: number
      success: boolean
      backupId?: number
      error?: string
    }> = []
    
    let successful = 0
    let failed = 0


    // Processar backups em lotes de 20 para evitar sobrecarga
    const batchSize = 20
    for (let i = 0; i < backups.length; i += batchSize) {
      const batch = backups.slice(i, i + batchSize)
      
      // Processar lote em paralelo
      const batchPromises = batch.map(async (backup, batchIndex) => {
        const globalIndex = i + batchIndex
        try {
          const createdBackup = await this.criarBackup(backup)
          
          return {
            index: globalIndex,
            success: true,
            backupId: createdBackup.id
          }
        } catch (error) {
          console.error(`API: Erro ao criar backup ${globalIndex + 1}:`, error)
          return {
            index: globalIndex,
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // Contar sucessos e falhas
      batchResults.forEach(result => {
        if (result.success) {
          successful++
        } else {
          failed++
        }
      })

      // Pequena pausa entre lotes para não sobrecarregar a API
      if (i + batchSize < backups.length) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }


    return {
      success: failed === 0,
      totalProcessed: backups.length,
      successful,
      failed,
      results
    }
  }

  // Método principal para upload completo de dados CSV
  async uploadCsvData(processedClients: Array<{
    nome: string
    email: string
    cnpj: string
    ativo: boolean
    dataInclusao: string
    backups: BackupRequestDTO[]
  }>): Promise<{
    success: boolean
    totalClients: number
    totalBackups: number
    clientsResult: any
    backupsResult: any
    errors: string[]
  }> {
    const errors: string[] = []
    
    try {
      // 1. Criar todos os clientes primeiro
      const clientsResult = await this.criarClientesEmLote(processedClients)
      
      if (clientsResult.failed > 0) {
        errors.push(`${clientsResult.failed} clientes falharam na criação`)
      }
      
      // 2. Coletar todos os backups dos clientes criados com sucesso
      const allBackups: BackupRequestDTO[] = []
      const clientIdMap = new Map<number, number>() // Mapear índice original para ID criado
      
      clientsResult.results.forEach((result, index) => {
        if (result.success && result.clientId) {
          clientIdMap.set(index, result.clientId)
          
          // Atualizar clienteId nos backups
          const clientBackups = processedClients[index].backups.map(backup => ({
            ...backup,
            clienteId: result.clientId!
          }))
          
          allBackups.push(...clientBackups)
        }
      })
      
      // 3. Criar todos os backups
      let backupsResult: {
        success: boolean
        totalProcessed: number
        successful: number
        failed: number
        results: Array<{
          index: number
          success: boolean
          backupId?: number
          error?: string
        }>
      } = { success: true, totalProcessed: 0, successful: 0, failed: 0, results: [] }
      
      if (allBackups.length > 0) {
        backupsResult = await this.criarBackupsEmLote(allBackups)
        
        if (backupsResult.failed > 0) {
          errors.push(`${backupsResult.failed} backups falharam na criação`)
        }
      }
      
      const success = clientsResult.success && backupsResult.success
      
      return {
        success,
        totalClients: processedClients.length,
        totalBackups: allBackups.length,
        clientsResult,
        backupsResult,
        errors
      }
      
    } catch (error) {
      console.error('API: Erro no upload completo:', error)
      errors.push(`Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      
      return {
        success: false,
        totalClients: processedClients.length,
        totalBackups: 0,
        clientsResult: { success: false, totalProcessed: 0, successful: 0, failed: 0, results: [] },
        backupsResult: { success: false, totalProcessed: 0, successful: 0, failed: 0, results: [] },
        errors
      }
    }
  }

  // ===== MÉTODOS DE CACHE =====

  clearCache(): void {
    this.cache.clear()
  }

  // ===== MÉTODOS DE CONFIGURAÇÃO =====

  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): ApiConfig {
    return { ...this.config }
  }
}

// ===== INSTÂNCIA SINGLETON =====

export const apiService = new ApiService()

// ===== EXPORTS PARA COMPATIBILIDADE =====


export const clientsAPI = {
  getAll: () => apiService.getAllClients(),
  getById: (id: string) => apiService.getClientById(id),
  getStats: () => apiService.getClientStats()
}

export const backupsAPI = {
  getAll: () => apiService.getAllBackups(),
  getByClientId: (clientId: string) => apiService.getBackupsByClientId(clientId),
  getStats: (days: number = 30) => apiService.getBackupStats(days),
  getTimeline: (days: number) => apiService.getBackupTimeline(days),
  getClientsWithBackupStatus: () => apiService.getClientsWithBackupStatus(),
  getClientsWithBackupStatusProgressive: (days: number = 30) => apiService.getClientsWithBackupStatusProgressive(days),
  getResumoBackups: () => apiService.getResumoBackups(),
  updateInformacoes: (id: number, backup: BackupRequestDTO) => apiService.atualizarInformacoesBackup(id, backup),
  updateDataFim: (id: number, novaDataFim: string) => apiService.atualizarDataFim({ id, novaDataFim })
}

export const settingsAPI = {
  getAll: async () => ({}), // Não implementado na API atual
  get: async (_key: string) => undefined,
  update: async (_updates: Record<string, any>) => true
}

export const api = {
  clients: clientsAPI,
  backups: backupsAPI,
  settings: settingsAPI
}

// ===== EXPORT DA INSTÂNCIA PRINCIPAL =====

export default apiService
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
    console.log('API: Fazendo requisição para:', url)
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, defaultOptions)
      console.log('API: Resposta recebida:', response.status, response.statusText)
      
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
      console.log('API: Dados recebidos:', data)
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
    console.log('API: Chamando listarBackupsPorCliente para ID:', id)
    return this.getCachedData(`backups-cliente-${id}`, async () => {
      console.log('API: Fazendo requisição para /api/dashboard/backup/cliente/' + id)
      try {
        const result = await this.makeRequest<BackupHistoricoDTO[]>(`/api/dashboard/backup/cliente/${id}`)
        console.log('API: Resultado da requisição:', result)
        return result
      } catch (error) {
        console.error('API: Erro na requisição listarBackupsPorCliente:', error)
        throw error
      }
    })
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

  // Mapear ClienteBackupStatusDTO para ClientUI
  private mapClienteToUI(cliente: ClienteBackupStatusDTO): ClientUI {
    return {
      client_id: cliente.id.toString(),
      name: cliente.nome,
      cnpj: cliente.cnpj,
      email: '', // Não disponível na API
      phone: '', // Não disponível na API
      address: '', // Não disponível na API
      status: cliente.statusUltimoBackup === 'SUCESSO' ? 'active' : 'inactive',
      join_date: cliente.dataInicio, // Usar dataInicio como join_date
      logo: '' // Não disponível na API
    }
  }

  // Mapear BackupHistoricoDTO para BackupUI
  private mapBackupToUI(backup: BackupHistoricoDTO, clientId: number, clientName: string): BackupUI {
    return {
      backup_id: backup.id.toString(),
      client_id: clientId.toString(),
      client_name: clientName,
      date: backup.dataFim, // Usar dataFim como data do backup
      status: backup.status === 'SUCESSO' ? 'success' : 'failed',
      duration: this.calculateDuration(backup.dataInicio, backup.dataFim),
      size: backup.tamanhoEmMb ? `${backup.tamanhoEmMb.toFixed(2)} MB` : 'N/A', // Verificar se tamanhoEmMb não é null
      vacuumExecutado: backup.vacuumExecutado || false, // Garantir que não seja undefined
      mensagem: backup.mensagem || 'N/A' // Garantir que não seja undefined
    }
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
    const clientes = await this.listarStatusClientes()
    return clientes.map(cliente => this.mapClienteToUI(cliente))
  }

  async getClientById(id: string): Promise<ClientUI | null> {
    const clientes = await this.getAllClients()
    return clientes.find(client => client.client_id === id) || null
  }

  async getClientStats(): Promise<ClientStatsUI> {
    const indicadores = await this.getIndicadores()
    const clientes = await this.listarStatusClientes()

      return {
      totalClients: indicadores.totalClientes,
      activeClients: clientes.filter(c => c.statusUltimoBackup === 'SUCESSO').length,
      pendingClients: 0, // Não disponível na API
      inactiveClients: clientes.filter(c => c.statusUltimoBackup === 'FALHA').length,
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
    console.log('API: getBackupsByClientId chamado com clientId:', clientId, 'convertido para id:', id)
    
    try {
      const backups = await this.listarBackupsPorCliente(id)
      console.log('API: Backups retornados da API:', backups)
      console.log('API: Quantidade de backups:', backups.length)
      
      const cliente = await this.listarStatusClientes().then(clientes => 
        clientes.find(c => c.id === id)
      )
      console.log('API: Cliente encontrado:', cliente)
      
      if (!cliente) {
        console.log('API: Cliente não encontrado, retornando array vazio')
        return []
      }
      
      const mappedBackups = backups.map(backup => 
        this.mapBackupToUI(backup, id, cliente.nome)
      )
      console.log('API: Backups mapeados para UI:', mappedBackups)
      console.log('API: Quantidade de backups mapeados:', mappedBackups.length)
      
      return mappedBackups
    } catch (error) {
      console.error('API: Erro em getBackupsByClientId:', error)
      throw error
    }
  }

  async getBackupStats(): Promise<BackupStatsUI> {
    const resumo = await this.getResumoBackups()
    
    return {
      successful: resumo.sucessos,
      failed: resumo.falhas,
      total: resumo.total,
      successRate: resumo.percentualSucesso
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
        console.log('API: Nenhum dado de timeline encontrado para o período')
        return []
      }
      
      return timelineData
    } catch (error) {
      console.error('Erro ao gerar timeline de backups:', error)
      return []
    }
  }

  async getClientsWithBackupStatus(): Promise<Array<ClientUI & { lastBackup: string; successRate: number; dataInicio?: string; dataFim?: string }>> {
    // Primeira requisição: buscar lista de clientes
    const clientes = await this.listarStatusClientes()
    console.log('API: Lista de clientes recebida:', clientes)
    
    // Segunda requisição: buscar detalhes de cada cliente
    const clientesComDetalhes = await Promise.all(
      clientes.map(async (cliente) => {
        try {
          // Buscar histórico de backups para cada cliente
          const backups = await this.listarBackupsPorCliente(cliente.id)
          console.log(`API: Backups para cliente ${cliente.id}:`, backups)
          
          // Encontrar o último backup
          const ultimoBackup = backups.length > 0 ? backups[backups.length - 1] : null
          
          return {
            ...this.mapClienteToUI(cliente),
            lastBackup: ultimoBackup ? ultimoBackup.dataFim : cliente.dataFim,
            successRate: cliente.taxaSucesso,
            dataInicio: cliente.dataInicio,
            dataFim: cliente.dataFim
          }
        } catch (error) {
          console.error(`API: Erro ao buscar detalhes do cliente ${cliente.id}:`, error)
          // Retornar dados básicos em caso de erro
          return {
            ...this.mapClienteToUI(cliente),
            lastBackup: cliente.dataFim,
            successRate: cliente.taxaSucesso,
            dataInicio: cliente.dataInicio,
            dataFim: cliente.dataFim
          }
        }
      })
    )
    
    console.log('API: Clientes com detalhes processados:', clientesComDetalhes)
    return clientesComDetalhes
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

    console.log(`API: Iniciando criação em lote de ${clientes.length} clientes`)

    // Processar clientes em lotes de 10 para evitar sobrecarga
    const batchSize = 10
    for (let i = 0; i < clientes.length; i += batchSize) {
      const batch = clientes.slice(i, i + batchSize)
      console.log(`API: Processando lote ${Math.floor(i / batchSize) + 1} (${batch.length} clientes)`)
      
      // Processar lote em paralelo
      const batchPromises = batch.map(async (cliente, batchIndex) => {
        const globalIndex = i + batchIndex
        try {
          console.log(`API: Criando cliente ${globalIndex + 1}: ${cliente.nome}`)
          const createdClient = await this.criarCliente(cliente)
          console.log(`API: Cliente ${globalIndex + 1} criado com sucesso, ID: ${createdClient.id}`)
          
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

    console.log(`API: Criação em lote concluída: ${successful} sucessos, ${failed} falhas`)

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

    console.log(`API: Iniciando criação em lote de ${backups.length} backups`)

    // Processar backups em lotes de 20 para evitar sobrecarga
    const batchSize = 20
    for (let i = 0; i < backups.length; i += batchSize) {
      const batch = backups.slice(i, i + batchSize)
      console.log(`API: Processando lote de backups ${Math.floor(i / batchSize) + 1} (${batch.length} backups)`)
      
      // Processar lote em paralelo
      const batchPromises = batch.map(async (backup, batchIndex) => {
        const globalIndex = i + batchIndex
        try {
          console.log(`API: Criando backup ${globalIndex + 1} para cliente ${backup.clienteId}`)
          const createdBackup = await this.criarBackup(backup)
          console.log(`API: Backup ${globalIndex + 1} criado com sucesso, ID: ${createdBackup.id}`)
          
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

    console.log(`API: Criação de backups em lote concluída: ${successful} sucessos, ${failed} falhas`)

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
      console.log(`API: Iniciando upload completo de ${processedClients.length} clientes`)
      
      // 1. Criar todos os clientes primeiro
      console.log('API: Criando clientes...')
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
      
      console.log(`API: Coletados ${allBackups.length} backups para criação`)
      
      // 3. Criar todos os backups
      let backupsResult = { success: true, totalProcessed: 0, successful: 0, failed: 0, results: [] }
      
      if (allBackups.length > 0) {
        console.log('API: Criando backups...')
        backupsResult = await this.criarBackupsEmLote(allBackups)
        
        if (backupsResult.failed > 0) {
          errors.push(`${backupsResult.failed} backups falharam na criação`)
        }
      }
      
      const success = clientsResult.success && backupsResult.success
      
      console.log(`API: Upload completo finalizado - Sucesso: ${success}`)
      
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
  getStats: () => apiService.getBackupStats(),
  getTimeline: (days: number) => apiService.getBackupTimeline(days),
  getClientsWithBackupStatus: () => apiService.getClientsWithBackupStatus(),
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
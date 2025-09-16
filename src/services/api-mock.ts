// Importar a API real
import { api as apiReal } from './api'

// Cache de dados (fallback para dados locais)
const dataCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Função para verificar se o cache é válido
function isCacheValid(key: string): boolean {
  const cached = dataCache.get(key)
  if (!cached) return false
  return Date.now() - cached.timestamp < CACHE_DURATION
}

// Função para obter dados do cache ou carregar
async function getCachedData<T>(key: string, loader: () => Promise<T>): Promise<T> {
  if (isCacheValid(key)) {
    return dataCache.get(key)!.data
  }
  
  const data = await loader()
  dataCache.set(key, { data, timestamp: Date.now() })
  return data
}

// Função para limpar cache
export function clearCache() {
  dataCache.clear()
  // A API real tem seu próprio sistema de cache
}

// Tipos de dados
export interface Client {
  client_id: string
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  status: 'active' | 'inactive' | 'pending'
  join_date: string
  logo: string
}

export interface Backup {
  backup_id: string
  client_id: string
  client_name: string
  date: string
  status: 'success' | 'failed'
  duration: string
  size: string
}

export interface Setting {
  key: string
  value: string
  type: 'string' | 'number' | 'boolean'
  description: string
}

export interface BackupStats {
  successful: number
  failed: number
  total: number
  successRate: number
}

export interface ClientStats {
  totalClients: number
  activeClients: number
  pendingClients: number
  inactiveClients: number
  averageSuccessRate: number
}

// Função para ler arquivos CSV com otimizações
async function readCSV<T>(filePath: string): Promise<T[]> {
  try {
    const response = await fetch(filePath)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const csvText = await response.text()
    const lines = csvText.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.trim())
    const result: T[] = []
    
    // Processar linhas em chunks para melhor performance
    const chunkSize = 1000
    for (let i = 1; i < lines.length; i += chunkSize) {
      const chunk = lines.slice(i, i + chunkSize)
      const chunkData = chunk.map(line => {
        const values = line.split(',')
        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = values[index]?.trim() || ''
        })
        return obj as T
      })
      result.push(...chunkData)
    }
    
    return result
  } catch (error) {
    console.error(`Erro ao ler arquivo CSV ${filePath}:`, error)
    return []
  }
}

// Função para converter string para tipo correto
function convertValue(value: string, type: 'string' | 'number' | 'boolean'): any {
  switch (type) {
    case 'number':
      return Number(value)
    case 'boolean':
      return value.toLowerCase() === 'true'
    default:
      return value
  }
}

// API de Clientes
export const clientsAPI = {
  async getAll(): Promise<Client[]> {
    try {
      // Tentar usar a API real primeiro
      return await apiReal.clients.getAll()
    } catch (error) {
      console.warn('Erro ao conectar com API real, usando dados locais:', error)
      // Fallback para dados locais
      return getCachedData('clients', () => readCSV<Client>('/data/clients.csv'))
    }
  },

  async getById(id: string): Promise<Client | null> {
    try {
      // Tentar usar a API real primeiro
      return await apiReal.clients.getById(id)
    } catch (error) {
      console.warn('Erro ao conectar com API real, usando dados locais:', error)
      // Fallback para dados locais
      const clients = await this.getAll()
      return clients.find(client => client.client_id === id) || null
    }
  },

  async getStats(): Promise<ClientStats> {
    try {
      // Tentar usar a API real primeiro
      return await apiReal.clients.getStats()
    } catch (error) {
      console.warn('Erro ao conectar com API real, usando dados locais:', error)
      // Fallback para dados locais
      return getCachedData('client-stats', async () => {
        const clients = await this.getAll()
        const totalClients = clients.length
        const activeClients = clients.filter(c => c.status === 'active').length
        const pendingClients = clients.filter(c => c.status === 'pending').length
        const inactiveClients = clients.filter(c => c.status === 'inactive').length
        
        // Calcular taxa de sucesso média baseada nos backups
        const backupStats = await backupsAPI.getStats()
        const averageSuccessRate = backupStats.successRate

        return {
          totalClients,
          activeClients,
          pendingClients,
          inactiveClients,
          averageSuccessRate
        }
      })
    }
  }
}

// API de Backups
export const backupsAPI = {
  async getAll(): Promise<Backup[]> {
    try {
      // Tentar usar a API real primeiro
      return await apiReal.backups.getAll()
    } catch (error) {
      console.warn('Erro ao conectar com API real, usando dados locais:', error)
      // Fallback para dados locais
      return getCachedData('backups', () => readCSV<Backup>('/data/backup.csv'))
    }
  },

  async getByClientId(clientId: string): Promise<Backup[]> {
    try {
      // Tentar usar a API real primeiro
      return await apiReal.backups.getByClientId(clientId)
    } catch (error) {
      console.warn('Erro ao conectar com API real, usando dados locais:', error)
      // Fallback para dados locais
      return getCachedData(`backups-client-${clientId}`, async () => {
        const backups = await this.getAll()
        return backups.filter(backup => backup.client_id === clientId)
      })
    }
  },

  async getStats(): Promise<BackupStats> {
    try {
      // Tentar usar a API real primeiro
      return await apiReal.backups.getStats()
    } catch (error) {
      console.warn('Erro ao conectar com API real, usando dados locais:', error)
      // Fallback para dados locais
      return getCachedData('backup-stats', async () => {
        const backups = await this.getAll()
        const successful = backups.filter(b => b.status === 'success').length
        const failed = backups.filter(b => b.status === 'failed').length
        const total = backups.length
        const successRate = total > 0 ? (successful / total) * 100 : 0

        return {
          successful,
          failed,
          total,
          successRate
        }
      })
    }
  },

  async getTimeline(days: number = 30): Promise<{ date: string; successful: number; failed: number }[]> {
    try {
      // Tentar usar a API real primeiro
      return await apiReal.backups.getTimeline(days)
    } catch (error) {
      console.warn('Erro ao conectar com API real, usando dados locais:', error)
      // Fallback para dados locais
      return getCachedData(`timeline-${days}`, async () => {
        const backups = await this.getAll()
        const endDate = new Date()
        const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))
        
        const timeline: { [key: string]: { successful: number; failed: number } } = {}
        
        // Inicializar timeline
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0]
          timeline[dateStr] = { successful: 0, failed: 0 }
        }
        
        // Processar backups
        backups.forEach(backup => {
          const backupDate = new Date(backup.date)
          if (backupDate >= startDate && backupDate <= endDate) {
            const dateStr = backupDate.toISOString().split('T')[0]
            if (timeline[dateStr]) {
              if (backup.status === 'success') timeline[dateStr].successful++
              else if (backup.status === 'failed') timeline[dateStr].failed++
            }
          }
        })
        
        return Object.entries(timeline).map(([date, stats]) => ({
          date,
          ...stats
        }))
      })
    }
  },

  async getClientsWithBackupStatus(): Promise<Array<Client & { lastBackup: string; successRate: number }>> {
    try {
      // Tentar usar a API real primeiro
      return await apiReal.backups.getClientsWithBackupStatus()
    } catch (error) {
      console.warn('Erro ao conectar com API real, usando dados locais:', error)
      // Fallback para dados locais
      return getCachedData('clients-with-backup-status', async () => {
        const clients = await clientsAPI.getAll()
        const backups = await this.getAll()
        
        return clients.map(client => {
          const clientBackups = backups.filter(b => b.client_id === client.client_id)
          const lastBackup = clientBackups.length > 0 
            ? clientBackups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
            : 'N/A'
          
          const successfulBackups = clientBackups.filter(b => b.status === 'success').length
          const successRate = clientBackups.length > 0 ? (successfulBackups / clientBackups.length) * 100 : 0
          
          return {
            ...client,
            lastBackup,
            successRate: Math.round(successRate * 10) / 10
          }
        })
      })
    }
  }
}

// API de Configurações
export const settingsAPI = {
  async getAll(): Promise<Record<string, any>> {
    try {
      // Tentar usar a API real primeiro
      return await apiReal.settings.getAll()
    } catch (error) {
      console.warn('Erro ao conectar com API real, usando dados locais:', error)
      // Fallback para dados locais
      return getCachedData('settings', async () => {
        const settings = await readCSV<Setting>('/data/settings.csv')
        const result: Record<string, any> = {}
        
        settings.forEach(setting => {
          result[setting.key] = convertValue(setting.value, setting.type)
        })
        
        return result
      })
    }
  },

  async get(key: string): Promise<any> {
    try {
      // Tentar usar a API real primeiro
      return await apiReal.settings.get(key)
    } catch (error) {
      console.warn('Erro ao conectar com API real, usando dados locais:', error)
      // Fallback para dados locais
      const settings = await this.getAll()
      return settings[key]
    }
  },

  async update(updates: Record<string, any>): Promise<boolean> {
    try {
      // Tentar usar a API real primeiro
      return await apiReal.settings.update(updates)
    } catch (error) {
      console.warn('Erro ao conectar com API real, usando dados locais:', error)
      // Fallback para dados locais
      console.log('Atualizando configurações localmente:', updates)
      return true
    }
  }
}

// API principal
export const api = {
  clients: clientsAPI,
  backups: backupsAPI,
  settings: settingsAPI
}

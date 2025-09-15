// Utilitário para processar dados CSV e converter para formato da API

import { Cliente, Backup, BackupRequestDTO } from '@/types/api'

export interface CsvRow {
  id: string
  nome: string
  email: string
  cnpj: string
  ativo: string
  dataInclusao: string
  backups: string // JSON string
}

export interface ProcessedClient {
  nome: string
  email: string
  cnpj: string
  ativo: boolean
  dataInclusao: string
  backups: BackupRequestDTO[]
}

export interface BatchUploadResult {
  success: boolean
  totalProcessed: number
  successful: number
  failed: number
  errors: Array<{
    row: number
    error: string
    data?: any
  }>
  results: Array<{
    row: number
    success: boolean
    clientId?: number
    error?: string
  }>
}

/**
 * Converte uma linha do CSV para o formato ProcessedClient
 */
export function parseCsvRow(row: CsvRow): ProcessedClient | null {
  try {
    // Parse dos backups (que estão como JSON string)
    let backups: any[] = []
    if (row.backups && row.backups.trim() !== '') {
      try {
        backups = JSON.parse(row.backups)
      } catch (e) {
        console.warn('Erro ao fazer parse dos backups:', e)
        backups = []
      }
    }

    // Converter backups para formato da API
    const backupRequests: BackupRequestDTO[] = backups.map(backup => ({
      clienteId: parseInt(row.id),
      status: backup.status === 'SUCESSO' ? 'SUCESSO' : 'FALHA',
      mensagem: backup.mensagem || '',
      vacuumExecutado: backup.vacuumExecutado || false,
      vacuumDataExecucao: backup.vacuumDataExecucao || undefined,
      dataInicio: backup.dataInicio || undefined,
      dataFim: backup.dataFim || undefined,
      tamanhoEmMb: backup.tamanhoEmMb || 0
    }))

    return {
      nome: row.nome,
      email: row.email,
      cnpj: row.cnpj,
      ativo: row.ativo.toLowerCase() === 'true',
      dataInclusao: row.dataInclusao,
      backups: backupRequests
    }
  } catch (error) {
    console.error('Erro ao processar linha do CSV:', error, row)
    return null
  }
}

/**
 * Processa um arquivo CSV completo
 */
export function processCsvData(csvData: string): ProcessedClient[] {
  const lines = csvData.split('\n').filter(line => line.trim() !== '')
  const headers = lines[0].split(',').map(h => h.trim())
  
  const processedClients: ProcessedClient[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    
    // Criar objeto da linha
    const row: CsvRow = {
      id: values[0] || '',
      nome: values[1] || '',
      email: values[2] || '',
      cnpj: values[3] || '',
      ativo: values[4] || '',
      dataInclusao: values[5] || '',
      backups: values[6] || '[]'
    }
    
    const processed = parseCsvRow(row)
    if (processed) {
      processedClients.push(processed)
    }
  }
  
  return processedClients
}

/**
 * Processa dados CSV de um arquivo
 */
export async function processCsvFile(file: File): Promise<ProcessedClient[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const csvData = e.target?.result as string
        const processed = processCsvData(csvData)
        resolve(processed)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * Valida se os dados processados estão corretos
 */
export function validateProcessedData(data: ProcessedClient[]): string[] {
  const errors: string[] = []
  
  data.forEach((client, index) => {
    if (!client.nome || client.nome.trim() === '') {
      errors.push(`Linha ${index + 1}: Nome do cliente é obrigatório`)
    }
    
    if (!client.email || client.email.trim() === '') {
      errors.push(`Linha ${index + 1}: Email do cliente é obrigatório`)
    }
    
    if (!client.cnpj || client.cnpj.trim() === '') {
      errors.push(`Linha ${index + 1}: CNPJ do cliente é obrigatório`)
    }
    
    if (!client.dataInclusao || client.dataInclusao.trim() === '') {
      errors.push(`Linha ${index + 1}: Data de inclusão é obrigatória`)
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (client.email && !emailRegex.test(client.email)) {
      errors.push(`Linha ${index + 1}: Email inválido`)
    }
    
    // Validar formato de CNPJ (básico)
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
    if (client.cnpj && !cnpjRegex.test(client.cnpj)) {
      errors.push(`Linha ${index + 1}: CNPJ inválido (formato esperado: XX.XXX.XXX/XXXX-XX)`)
    }
  })
  
  return errors
}

/**
 * Gera um relatório de processamento
 */
export function generateProcessingReport(
  totalRows: number,
  processedClients: ProcessedClient[],
  errors: string[]
): {
  totalRows: number
  processedClients: number
  totalBackups: number
  errors: string[]
  successRate: number
} {
  const totalBackups = processedClients.reduce((sum, client) => sum + client.backups.length, 0)
  const successRate = totalRows > 0 ? (processedClients.length / totalRows) * 100 : 0
  
  return {
    totalRows,
    processedClients: processedClients.length,
    totalBackups,
    errors,
    successRate
  }
}

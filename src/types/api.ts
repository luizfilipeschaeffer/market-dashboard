// Tipos baseados na especificação Swagger da API

// ===== TIPOS PRINCIPAIS =====

export interface Cliente {
  id: number
  nome: string
  email: string
  cnpj: string
  ativo: boolean
  dataInclusao: string
  backups: Backup[]
}

export interface Backup {
  id: number
  status: 'SUCESSO' | 'FALHA'
  mensagem: string
  vacuumExecutado: boolean
  vacuumDataExecucao?: string
  dataInicio: string
  dataFim: string
  tamanhoEmMb: number
  caminhoBackup: string
  ipBackup: string
  databaseBackup: string
  cliente: Cliente
}

// ===== DTOs DE REQUEST =====

export interface BackupRequestDTO {
  clienteId: number
  status: 'SUCESSO' | 'FALHA'
  databaseBackup: string
  caminhoBackup: string
  ipBackup: string
  mensagem?: string
  vacuumExecutado?: boolean
  vacuumDataExecucao?: string
  dataInicio: string
  dataFim: string
  tamanhoEmMb: number
}

// ===== DTOs DE RESPONSE =====

export interface BackupDashboardDTO {
  total: number
  sucessos: number
  falhas: number
  percentualSucesso: number
}

export interface BackupDashboardIndicadoresDTO {
  totalClientes: number
  backupsSucesso: number
  backupsFalha: number
  taxaSucesso: number
}

export interface ClienteBackupStatusDTO {
  id: number
  nome: string
  cnpj: string
  dataInicio: string
  dataFim: string
  statusUltimoBackup: string
  taxaSucesso: number
  tamanhoEmMb: number
  databaseBackup: string
}

export interface BackupHistoricoDTO {
  id: number
  status: 'SUCESSO' | 'FALHA'
  mensagem: string
  vacuumExecutado: boolean
  vacuumDataExecucao?: string
  dataInicio: string
  dataFim: string
  tamanhoEmMb: number
  caminhoBackup: string
  ipBackup: string
  databaseBackup: string
}

// ===== TIPOS DE PARÂMETROS =====

export interface IndicadoresParams {
  dias?: number
}

export interface ClientesStatusParams {
  status?: string
  dias?: number
}

export interface AtualizarDataFimParams {
  id: number
  novaDataFim: string
}

// ===== TIPOS DE RESPOSTA DA API =====

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export class ApiError extends Error {
  public status: number
  public details?: any

  constructor({ message, status, details }: { message: string; status: number; details?: any }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

// ===== TIPOS PARA COMPATIBILIDADE COM UI EXISTENTE =====

// Mapeamento dos tipos da API para os tipos existentes da UI
export interface ClientUI {
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

export interface BackupUI {
  backup_id: string
  client_id: string
  client_name: string
  date: string
  status: 'success' | 'failed'
  duration: string
  size: string
  vacuumExecutado: boolean
  mensagem: string
  databaseBackup: string
  caminhoBackup: string
  ipBackup: string
}

export interface BackupStatsUI {
  successful: number
  failed: number
  total: number
  successRate: number
}

export interface ClientStatsUI {
  totalClients: number
  activeClients: number
  pendingClients: number
  inactiveClients: number
  averageSuccessRate: number
}

// ===== TIPOS DE CONFIGURAÇÃO =====

export interface ApiConfig {
  baseURL: string
  timeout: number
  retries: number
}

export const DEFAULT_API_CONFIG: ApiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://market-externo-dashboard-api.onrender.com',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  retries: Number(import.meta.env.VITE_API_RETRIES) || 3
}

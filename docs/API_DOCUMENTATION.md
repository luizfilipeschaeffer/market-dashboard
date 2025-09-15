# Documentação da API - Market Dashboard

## Visão Geral

Este documento contém instruções detalhadas para que uma IA possa gerar dados realistas para o sistema de dashboard de automações de backup. O sistema gerencia clientes, backups de bases de dados e configurações do sistema.

## Estrutura de Dados

### 1. Clientes (Clients)

#### Interface TypeScript
```typescript
interface Client {
  id: string
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  lastBackup: string
  totalBackups: number
  successRate: number
  logo?: string
}
```

#### Endpoints para Clientes

##### GET /api/clients
**Descrição:** Lista todos os clientes com filtros e paginação

**Parâmetros de Query:**
- `page` (number, opcional): Página atual (padrão: 1)
- `limit` (number, opcional): Itens por página (padrão: 10)
- `search` (string, opcional): Busca por nome, CNPJ ou email
- `status` (string, opcional): Filtro por status ('active', 'inactive', 'pending', 'all')
- `sortBy` (string, opcional): Campo para ordenação ('name', 'joinDate', 'successRate', 'lastBackup')
- `sortOrder` (string, opcional): Direção da ordenação ('asc', 'desc')

**Resposta:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "Empresa Alpha Ltda",
      "cnpj": "12.345.678/0001-90",
      "email": "contato@alpha.com.br",
      "phone": "(11) 99999-9999",
      "address": "São Paulo, SP",
      "status": "active",
      "joinDate": "2023-01-15",
      "lastBackup": "2024-01-07 23:30:00",
      "totalBackups": 365,
      "successRate": 98.5,
      "logo": "https://api.placeholder.com/40/40"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  },
  "stats": {
    "totalClients": 50,
    "activeClients": 42,
    "pendingClients": 5,
    "inactiveClients": 3,
    "averageSuccessRate": 94.2
  }
}
```

##### GET /api/clients/:id
**Descrição:** Obtém detalhes de um cliente específico

**Parâmetros:**
- `id` (string, obrigatório): ID do cliente

**Resposta:**
```json
{
  "id": "1",
  "name": "Empresa Alpha Ltda",
  "cnpj": "12.345.678/0001-90",
  "email": "contato@alpha.com.br",
  "phone": "(11) 99999-9999",
  "address": "São Paulo, SP",
  "status": "active",
  "joinDate": "2023-01-15",
  "lastBackup": "2024-01-07 23:30:00",
  "totalBackups": 365,
  "successRate": 98.5,
  "logo": "https://api.placeholder.com/40/40",
  "backupHistory": [
    {
      "date": "2024-01-07",
      "status": "success",
      "duration": "00:05:23",
      "size": "2.3 GB"
    }
  ]
}
```

### 2. Backups

#### Interface TypeScript
```typescript
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
```

#### Endpoints para Backups

##### GET /api/backups/stats
**Descrição:** Obtém estatísticas gerais dos backups

**Parâmetros de Query:**
- `period` (string, opcional): Período ('7d', '30d', '90d', '1y')
- `clientId` (string, opcional): ID do cliente específico

**Resposta:**
```json
{
  "stats": {
    "successful": 45,
    "failed": 8,
    "inProgress": 3,
    "pending": 2,
    "total": 58,
    "successRate": 77.6
  },
  "trends": {
    "successful": "+5.2%",
    "failed": "-12.1%",
    "inProgress": "+2.3%"
  }
}
```

##### GET /api/backups/timeline
**Descrição:** Obtém dados de série temporal para gráficos

**Parâmetros de Query:**
- `period` (string, obrigatório): Período ('7d', '30d', '90d', '1y')
- `clientId` (string, opcional): ID do cliente específico

**Resposta:**
```json
{
  "data": [
    {
      "date": "2024-01-01",
      "successful": 42,
      "failed": 5,
      "inProgress": 2
    },
    {
      "date": "2024-01-02",
      "successful": 44,
      "failed": 4,
      "inProgress": 1
    }
  ]
}
```

##### GET /api/backups/clients
**Descrição:** Lista clientes com status de backup

**Parâmetros de Query:**
- `status` (string, opcional): Filtro por status ('success', 'failed', 'in-progress', 'pending', 'all')
- `sortBy` (string, opcional): Campo para ordenação ('name', 'lastBackup', 'successRate')
- `sortOrder` (string, opcional): Direção da ordenação ('asc', 'desc')

**Resposta:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "Empresa Alpha Ltda",
      "cnpj": "12.345.678/0001-90",
      "logo": "https://api.placeholder.com/40/40",
      "lastBackup": "2024-01-07 23:30:00",
      "status": "success",
      "successRate": 95.2
    }
  ]
}
```

### 3. Configurações do Sistema

#### Interface TypeScript
```typescript
interface SystemSettings {
  // Configurações Gerais
  companyName: string
  companyEmail: string
  companyPhone: string
  timezone: string
  language: string
  
  // Configurações de Backup
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly'
  backupRetention: string
  backupCompression: boolean
  backupEncryption: boolean
  backupNotifications: boolean
  
  // Configurações de Notificações
  emailNotifications: boolean
  smsNotifications: boolean
  slackNotifications: boolean
  notificationFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  
  // Configurações de Segurança
  twoFactorAuth: boolean
  sessionTimeout: string
  passwordPolicy: 'weak' | 'medium' | 'strong' | 'very-strong'
  ipWhitelist: boolean
  
  // Configurações de Sistema
  maintenanceMode: boolean
  debugMode: boolean
  autoUpdates: boolean
  logLevel: 'error' | 'warn' | 'info' | 'debug'
}
```

#### Endpoints para Configurações

##### GET /api/settings
**Descrição:** Obtém todas as configurações do sistema

**Resposta:**
```json
{
  "companyName": "Market Automações",
  "companyEmail": "contato@market.com.br",
  "companyPhone": "(11) 99999-9999",
  "timezone": "America/Sao_Paulo",
  "language": "pt-BR",
  "backupFrequency": "daily",
  "backupRetention": "30",
  "backupCompression": true,
  "backupEncryption": true,
  "backupNotifications": true,
  "emailNotifications": true,
  "smsNotifications": false,
  "slackNotifications": false,
  "notificationFrequency": "immediate",
  "twoFactorAuth": false,
  "sessionTimeout": "30",
  "passwordPolicy": "strong",
  "ipWhitelist": false,
  "maintenanceMode": false,
  "debugMode": false,
  "autoUpdates": true,
  "logLevel": "info"
}
```

##### PUT /api/settings
**Descrição:** Atualiza configurações do sistema

**Body:**
```json
{
  "companyName": "Nova Empresa",
  "backupFrequency": "weekly",
  "emailNotifications": true
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Configurações atualizadas com sucesso",
  "updatedFields": ["companyName", "backupFrequency", "emailNotifications"]
}
```

## Instruções para Geração de Dados

### 1. Dados de Clientes

**Regras para geração:**
- **Nomes de empresas:** Use nomes realistas brasileiros (ex: "Tech Solutions Ltda", "Inovação Digital S.A.", "Sistemas Integrados ME")
- **CNPJs:** Gere CNPJs válidos no formato XX.XXX.XXX/XXXX-XX
- **Emails:** Use domínios brasileiros (.com.br, .net.br) e nomes relacionados ao nome da empresa
- **Telefones:** Use formato brasileiro (XX) XXXXX-XXXX
- **Endereços:** Use cidades brasileiras reais com estado
- **Status:** Distribua realisticamente (70% active, 20% pending, 10% inactive)
- **Datas de cadastro:** Várie entre 6 meses e 2 anos atrás
- **Taxa de sucesso:** Várie entre 75% e 99%, com média de 90-95%
- **Total de backups:** Calcule baseado na data de cadastro e frequência

### 2. Dados de Backups

**Regras para geração:**
- **Status:** Distribua realisticamente (80% success, 15% failed, 3% in-progress, 2% pending)
- **Datas de backup:** Use horários noturnos (22:00-06:00) para a maioria
- **Taxa de sucesso:** Mantenha consistência com os dados do cliente
- **Série temporal:** Gere dados diários com variações realistas
- **Tendências:** Inclua pequenas variações semanais e sazonais

### 3. Dados de Configurações

**Regras para geração:**
- **Configurações padrão:** Use valores sensatos para um sistema de backup
- **Fuso horário:** Use "America/Sao_Paulo" como padrão
- **Idioma:** Use "pt-BR" como padrão
- **Frequência de backup:** Use "daily" como padrão
- **Notificações:** Ative email, desative SMS por padrão
- **Segurança:** Use configurações moderadas (não muito restritivas)

## Exemplos de Dados Gerados

### Cliente Exemplo
```json
{
  "id": "clt_001",
  "name": "Soluções Empresariais Ltda",
  "cnpj": "45.678.901/0001-23",
  "email": "contato@solucoesempresariais.com.br",
  "phone": "(11) 3456-7890",
  "address": "São Paulo, SP",
  "status": "active",
  "joinDate": "2023-03-15",
  "lastBackup": "2024-01-07 23:45:00",
  "totalBackups": 298,
  "successRate": 96.8,
  "logo": "https://api.placeholder.com/40/40"
}
```

### Estatísticas de Backup Exemplo
```json
{
  "stats": {
    "successful": 42,
    "failed": 6,
    "inProgress": 2,
    "pending": 1,
    "total": 51,
    "successRate": 82.4
  },
  "trends": {
    "successful": "+3.2%",
    "failed": "-8.7%",
    "inProgress": "+1.1%"
  }
}
```

## Códigos de Status HTTP

- **200:** Sucesso
- **201:** Criado com sucesso
- **400:** Dados inválidos
- **401:** Não autorizado
- **403:** Acesso negado
- **404:** Recurso não encontrado
- **500:** Erro interno do servidor

## Formato de Datas

- **Datas:** YYYY-MM-DD
- **Datas com hora:** YYYY-MM-DD HH:mm:ss
- **Timezone:** UTC (converter para o timezone configurado no frontend)

## Validações

### Clientes
- CNPJ deve ser válido
- Email deve ter formato válido
- Telefone deve seguir formato brasileiro
- Status deve ser um dos valores permitidos
- Taxa de sucesso deve estar entre 0 e 100

### Backups
- Status deve ser um dos valores permitidos
- Datas devem estar em formato válido
- Taxa de sucesso deve estar entre 0 e 100

### Configurações
- Valores booleanos devem ser true/false
- Valores de enum devem ser um dos valores permitidos
- Números devem estar dentro dos ranges esperados

## Notas Importantes

1. **Consistência:** Mantenha consistência entre dados relacionados (ex: taxa de sucesso do cliente deve refletir nos dados de backup)
2. **Realismo:** Use dados que façam sentido no contexto brasileiro
3. **Variação:** Inclua variações realistas nos dados para simular um ambiente real
4. **Performance:** Considere paginação para listas grandes
5. **Filtros:** Implemente filtros que façam sentido para o negócio
6. **Ordenação:** Suporte ordenação por campos relevantes
7. **Busca:** Implemente busca textual em campos apropriados

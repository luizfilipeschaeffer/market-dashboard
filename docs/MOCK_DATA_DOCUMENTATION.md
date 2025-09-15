# Documentação de Dados Mockados

Este documento mapeia todos os locais onde dados mockados são utilizados no sistema, para facilitar a migração para dados reais da API.

## 📋 Resumo Geral

O sistema atualmente utiliza uma estratégia híbrida:
- **API Real**: Endpoints da API Java Spring Boot (`http://192.168.60.37:8080`)
- **API Mock**: Dados locais em arquivos CSV como fallback
- **Estratégia**: Tentar API real primeiro, usar dados mock em caso de falha

## 🗂️ Arquivos de Dados Mockados

### 1. Arquivos CSV (`/data/`)
- **`clients.csv`**: Dados dos clientes
- **`backup.csv`**: Dados de backups
- **`settings.csv`**: Configurações do sistema

### 2. Scripts de Geração
- **`docs/generate_extended_data.py`**: Gera dados estendidos
- **`docs/generate_large_dataset.py`**: Gera datasets grandes

## 🔍 Locais com Dados Mockados

### 1. Serviços de API

#### `src/services/api.ts` (API Real)
**Status**: ✅ Implementado
**Dados Mock**: Nenhum (usa API real)
**Observação**: Mapeia dados da API real para formato da UI

#### `src/services/api-mock.ts` (API Mock - Fallback)
**Status**: ✅ Implementado com fallback
**Dados Mock**: CSV files
**Funções que usam mock**:
- `clientsAPI.getAll()` → `/data/clients.csv`
- `clientsAPI.getById()` → `/data/clients.csv`
- `clientsAPI.getStats()` → Calculado dos dados CSV
- `backupsAPI.getAll()` → `/data/backup.csv`
- `backupsAPI.getByClientId()` → `/data/backup.csv`
- `backupsAPI.getStats()` → Calculado dos dados CSV
- `backupsAPI.getTimeline()` → Calculado dos dados CSV
- `backupsAPI.getClientsWithBackupStatus()` → Combinado de clients.csv + backup.csv
- `settingsAPI.getAll()` → `/data/settings.csv`
- `settingsAPI.get()` → `/data/settings.csv`
- `settingsAPI.update()` → Simulado (não persiste)


### 2. Páginas e Componentes

#### `src/pages/HomePage.tsx`
**Status**: ✅ Usa API híbrida
**Dados Mock**: Nenhum (carrega via API)
**Funções**: `api.clients.getStats()`, `api.backups.getStats()`

#### `src/pages/BackupDashboard.tsx`
**Status**: ✅ Usa API híbrida
**Dados Mock**: Nenhum (carrega via API)
**Funções**: 
- `api.backups.getStats()`
- `api.backups.getTimeline()`
- `api.backups.getClientsWithBackupStatus()`

#### `src/pages/ClientsPage.tsx`
**Status**: ✅ Usa API híbrida
**Dados Mock**: Nenhum (carrega via API)
**Funções**: 
- `api.clients.getAll()`
- `api.clients.getStats()`
- `api.backups.getClientsWithBackupStatus()`

#### `src/pages/SettingsPage.tsx`
**Status**: ✅ Usa API híbrida
**Dados Mock**: Nenhum (carrega via API)
**Funções**: 
- `api.settings.getAll()`
- `api.settings.update()`

#### `src/pages/ClientFormPage.tsx`
**Status**: ✅ Usa API híbrida
**Dados Mock**: Nenhum (carrega via API)
**Funções**: 
- `api.clients.getById()` (modo edição)
- `api.clients.getAll()` (validação)

### 3. Componentes

#### `src/components/ClientBackupModal.tsx`
**Status**: ✅ Usa API híbrida
**Dados Mock**: Nenhum (carrega via API)
**Funções**: `api.backups.getByClientId()`

## 🔄 Estratégia de Migração

### Fase 1: Identificação ✅
- [x] Mapear todos os locais com dados mockados
- [x] Documentar funções que usam fallback
- [x] Identificar dependências

### Fase 2: Renomeação de APIs ✅
- [x] Renomear `apiReal.ts` → `api.ts`
- [x] Renomear `api.ts` → `api-mock.ts`
- [x] Atualizar imports em todos os arquivos
- [x] Atualizar documentação

### Fase 3: Configuração de Ambiente
- [ ] Criar variável de ambiente para controlar uso de mock
- [ ] Implementar toggle para desenvolvimento/produção
- [ ] Manter fallback para casos de erro

### Fase 4: Testes e Validação
- [ ] Testar com API real ativa
- [ ] Testar fallback para mock
- [ ] Validar performance
- [ ] Documentar diferenças de comportamento

## 📊 Dados Mockados por Categoria

### 1. Clientes (`clients.csv`)
**Campos**:
- `client_id`: ID único do cliente
- `name`: Nome da empresa
- `cnpj`: CNPJ formatado
- `email`: Email de contato
- `phone`: Telefone
- `address`: Endereço
- `status`: active/inactive/pending
- `join_date`: Data de cadastro
- `logo`: URL do logo

**Quantidade**: ~50 registros
**Geração**: Scripts Python

### 2. Backups (`backup.csv`)
**Campos**:
- `backup_id`: ID único do backup
- `client_id`: ID do cliente
- `client_name`: Nome do cliente
- `date`: Data e hora do backup
- `status`: success/failed
- `duration`: Duração do backup
- `size`: Tamanho do backup

**Quantidade**: ~1000+ registros
**Geração**: Scripts Python

### 3. Configurações (`settings.csv`)
**Campos**:
- `key`: Chave da configuração
- `value`: Valor da configuração
- `type`: Tipo (string/number/boolean)
- `description`: Descrição da configuração

**Quantidade**: ~20 configurações
**Geração**: Manual

## 🚀 Próximos Passos

1. **Renomear APIs** conforme solicitado
2. **Implementar variável de ambiente** para controlar uso de mock
3. **Criar testes** para validar migração
4. **Documentar diferenças** entre dados mock e reais
5. **Implementar loading states** para chamadas da API real

## 📝 Notas Importantes

- **Cache**: Sistema de cache funciona tanto para API real quanto mock
- **Formatação**: Datas são formatadas consistentemente
- **Tratamento de Erros**: Fallback gracioso para dados mock
- **Performance**: Dados mock são mais rápidos, API real é mais atualizada
- **Desenvolvimento**: Mock permite desenvolvimento offline

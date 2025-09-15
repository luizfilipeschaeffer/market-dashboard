# System Patterns - Market Dashboard

## Arquitetura Geral
```
Frontend (React/TypeScript)
├── Components (UI Reutilizáveis)
├── Pages (Páginas Principais)
├── Services (API e Lógica de Negócio)
├── Contexts (Estado Global)
└── Utils (Funções Auxiliares)

Backend (API REST)
├── /api/clientes
├── /api/backups
└── /api/dashboard/backup/*
```

## Padrões de Componentes

### 1. Estrutura de Páginas
- **PageWrapper**: Container padrão com layout
- **SplashScreen**: Loading inicial da aplicação
- **TransitionSplash**: Transições entre páginas
- **Sidebar**: Navegação principal
- **TopBar**: Barra superior com ações

### 2. Padrões de Estado
- **useState** para estado local de componentes
- **Context API** para tema e configurações globais
- **Cache** para otimização de requisições API

### 3. Padrões de API
- **Cache inteligente** com TTL de 5 minutos
- **Funções assíncronas** para operações de rede
- **Tratamento de erros** centralizado
- **Loading states** para feedback visual

## Padrões de Dados

### 1. Interfaces Principais
```typescript
interface Cliente {
  id: number
  nome: string
  email: string
  cnpj: string
  ativo: boolean
  dataInclusao: string
  backups: Backup[]
}

interface Backup {
  id: number
  status: 'SUCESSO' | 'FALHA'
  mensagem: string
  vacuumExecutado: boolean
  vacuumDataExecucao?: string
  criadoEm: string
  cliente: Cliente
}
```

### 2. Padrões de Cache
- **Chave única** por tipo de dados
- **TTL configurável** por tipo
- **Invalidação manual** quando necessário
- **Fallback** para dados locais em caso de erro

## Padrões de UI

### 1. Design System
- **Shadcn/ui** como base de componentes
- **Tailwind CSS** para estilização
- **Radix UI** para acessibilidade
- **Lucide React** para ícones

### 2. Tema
- **Dark/Light mode** com Context
- **Cores consistentes** baseadas em CSS variables
- **Responsividade** mobile-first

### 3. Animações
- **Transições suaves** entre páginas
- **Loading states** com progress indicators
- **Hover effects** para interatividade

## Padrões de Integração

### 1. API REST
- **Base URL** configurável
- **Headers** padronizados
- **Error handling** consistente
- **Retry logic** para falhas temporárias

### 2. Mapeamento de Dados
- **Transformação** entre formatos API e UI
- **Validação** de dados recebidos
- **Fallbacks** para dados ausentes

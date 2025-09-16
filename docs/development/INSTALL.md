# Instruções de Instalação

## Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## Passos para Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Executar o projeto:**
```bash
npm run dev
```

3. **Abrir no navegador:**
```
http://localhost:5173
```

## Dependências Principais

- `react` e `react-dom` - Framework React
- `typescript` - Tipagem estática
- `vite` - Build tool
- `tailwindcss` - Framework CSS
- `@radix-ui/*` - Componentes acessíveis
- `lucide-react` - Ícones
- `recharts` - Gráficos
- `clsx` e `tailwind-merge` - Utilitários CSS

## Estrutura do Projeto

```
market-dashboard/
├── .cursor/                      # Dados e configurações do Cursor (IA)
│   ├── rules/                    # Regras do cursor
│   ├── mcp.json                  # Configuração do Market Cursor Protocol (MCP) para integração e automação com o Cursor
├── src/
│   ├── components/
│   │   ├── ui/                    # Componentes base (shadcn/ui)
│   │   ├── layout/                # Componentes de layout
│   │   ├── modals/                # Modais do sistema
│   │   ├── AppSidebar.tsx         # Sidebar principal
│   │   ├── LogoProgress.tsx       # Componente de progresso
│   │   ├── SplashScreen.tsx       # Tela de carregamento
│   │   ├── ThemeToggle.tsx        # Toggle de tema
│   │   └── TransitionSplash.tsx   # Transições
│   ├── contexts/
│   │   └── ThemeContext.tsx       # Contexto do tema
│   ├── hooks/
│   │   ├── use-mobile.tsx         # Hook para mobile
│   │   └── useApiValidation.ts    # Hook de validação da API
│   ├── lib/
│   │   ├── csvProcessor.ts        # Processamento de CSV
│   │   ├── dateUtils.ts           # Utilitários de data
│   │   ├── errorCodes.ts          # Códigos de erro
│   │   └── utils.ts               # Utilitários gerais
│   ├── pages/
│   │   ├── BackupDashboard.tsx    # Dashboard de backups
│   │   ├── ClientFormPage.tsx     # Formulário de clientes
│   │   ├── ClientsPage.tsx        # Lista de clientes
│   │   ├── FAQPage.tsx            # Página de FAQ
│   │   ├── HomePage.tsx           # Página inicial
│   │   └── SettingsPage.tsx       # Configurações
│   ├── services/
│   │   ├── api.ts                 # Serviços da API
│   │   └── api-mock.ts            # Mock da API
│   ├── types/
│   │   └── api.ts                 # Tipos da API
│   ├── App.tsx                    # Componente principal
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Estilos globais
├── docs/
│   ├── api/                       # Documentação da API
│   ├── design/                    # Documentação de design
│   └── development/               # Documentação de desenvolvimento
├── memory-bank/                   # Banco de memória do projeto
├── scripts/                       # Scripts de automação
│   └── utilities/                 # Utilitários de script
├── public/                        # Arquivos estáticos
├── dist/                          # Build de produção
├── components.json                # Configuração shadcn/ui
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Comandos Disponíveis

- `npm run dev` - Desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview da build
- `npm run lint` - Linting do código

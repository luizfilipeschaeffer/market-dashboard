# Tech Context - Market Dashboard

## Stack Tecnológico

### Frontend
- **React 18.2.0**: Biblioteca principal
- **TypeScript 5.0.2**: Tipagem estática
- **Vite 7.1.5**: Build tool e dev server
- **Tailwind CSS 3.4.0**: Framework CSS

### UI Libraries
- **Radix UI**: Componentes acessíveis
  - @radix-ui/react-avatar
  - @radix-ui/react-dialog
  - @radix-ui/react-dropdown-menu
  - @radix-ui/react-progress
  - @radix-ui/react-select
  - @radix-ui/react-tabs
  - @radix-ui/react-tooltip
- **Shadcn/ui**: Componentes pré-construídos
- **Lucide React 0.263.1**: Ícones
- **Recharts 2.8.0**: Gráficos e visualizações

### Desenvolvimento
- **ESLint**: Linting de código
- **PostCSS**: Processamento CSS
- **Autoprefixer**: Compatibilidade CSS

## Configuração do Projeto

### Estrutura de Pastas
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Shadcn)
│   └── *.tsx           # Componentes específicos
├── pages/              # Páginas da aplicação
├── services/           # Serviços e API
├── contexts/           # Contextos React
├── lib/                # Utilitários
└── main.tsx           # Entry point
```

### Configurações
- **Vite**: Configuração em `vite.config.ts`
- **TypeScript**: Configuração em `tsconfig.json`
- **Tailwind**: Configuração em `tailwind.config.js`
- **PostCSS**: Configuração em `postcss.config.js`

## API Backend

### Especificação
- **Protocolo**: HTTP/HTTPS
- **Formato**: JSON
- **Base URL**: `http://192.168.60.37:8080`
- **Especificação**: OpenAPI 3.1.0 (Swagger)

### Endpoints Principais
- **Clientes**: `/api/clientes`
- **Backups**: `/api/backups`
- **Dashboard**: `/api/dashboard/backup/*`

### Dependências de Rede
- **CORS**: Configurado no backend
- **Timeout**: 30 segundos padrão
- **Retry**: 3 tentativas em caso de falha

## Ambiente de Desenvolvimento

### Requisitos
- **Node.js**: v18+ (recomendado)
- **npm**: v8+ ou **yarn**: v1.22+
- **Git**: Para controle de versão

### Scripts Disponíveis
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Linting do código
```

### Configuração Local
- **Porta dev**: 5173 (Vite padrão)
- **Hot reload**: Habilitado
- **Source maps**: Habilitados em dev

## Performance

### Otimizações
- **Code splitting**: Por rota
- **Lazy loading**: Componentes pesados
- **Cache**: 5 minutos para dados API
- **Bundle size**: Otimizado com Vite

### Métricas
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3s

## Segurança

### Frontend
- **XSS Protection**: Sanitização de inputs
- **CSRF**: Headers apropriados
- **Content Security Policy**: Configurado

### API
- **CORS**: Configurado no backend
- **Authentication**: A ser implementado
- **Rate Limiting**: A ser implementado

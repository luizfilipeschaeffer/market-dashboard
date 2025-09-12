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
Market - Automações-dashboard/
├── src/
│   ├── components/ui/     # Componentes base
│   ├── lib/              # Utilitários
│   ├── App.tsx           # Dashboard principal
│   ├── main.tsx          # Entry point
│   └── index.css         # Estilos globais
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Comandos Disponíveis

- `npm run dev` - Desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview da build
- `npm run lint` - Linting do código

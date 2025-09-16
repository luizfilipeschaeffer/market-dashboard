# Market - Automações Dashboard

Um dashboard moderno para monitoramento de backups de clientes, construído com React, TypeScript, Tailwind CSS e Vite.

## 🚀 Tecnologias

- **React 18** - Biblioteca de interface do usuário
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderno e rápido
- **Tailwind CSS v4** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones

## 📦 Instalação

### Instalação Rápida (Windows/macOS/Linux)

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd market-dashboard
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3050](http://localhost:3050) no seu navegador.

### Instalação no Ubuntu 18.04 LTS

Para instalação automatizada no Ubuntu 18.04, use o script de instalação:

```bash
# Instalação completa
chmod +x scripts/install-ubuntu.sh
./scripts/install-ubuntu.sh

# Ou instalação rápida
chmod +x scripts/quick-install-ubuntu.sh
./scripts/quick-install-ubuntu.sh
```

Para instruções detalhadas, consulte: [docs/development/UBUNTU_INSTALL.md](docs/development/UBUNTU_INSTALL.md)

### Configuração de Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo (se existir)
cp .env.example .env

# Edite o arquivo .env com suas configurações
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# API Configuration
VITE_API_BASE_URL=http://192.168.60.37:8080
VITE_API_TIMEOUT=30000
VITE_API_RETRIES=3

# Development Configuration
VITE_APP_NAME=Market Dashboard
VITE_APP_VERSION=1.0.0
```

**Variáveis obrigatórias:**
- `VITE_API_BASE_URL`: URL base da API de backups
- `VITE_API_TIMEOUT`: Timeout das requisições em milissegundos (padrão: 30000)
- `VITE_API_RETRIES`: Número de tentativas em caso de falha (padrão: 3)

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento (porta 3050)
- `npm run build` - Cria a build de produção
- `npm run preview` - Visualiza a build de produção (porta 3050)
- `npm run lint` - Executa o linter

### Scripts Auxiliares (Ubuntu)

- `./start-dev.sh` - Inicia o servidor de desenvolvimento
- `./start-prod.sh` - Inicia o servidor de produção
- `./scripts/install-ubuntu.sh` - Instalação completa no Ubuntu
- `./scripts/quick-install-ubuntu.sh` - Instalação rápida no Ubuntu

## 🎨 Componentes UI

O projeto utiliza uma biblioteca de componentes baseada no shadcn/ui:

- **Card** - Cartões para exibir informações
- **Button** - Botões com diferentes variantes
- **Badge** - Etiquetas de status
- **Select** - Seletores dropdown
- **Table** - Tabelas responsivas
- **Avatar** - Avatares de usuário
- **Progress** - Barras de progresso

## 📊 Funcionalidades do Dashboard

- **Visão Geral**: Estatísticas gerais dos backups
- **Gráficos**: Visualizações em pizza e linha do tempo
- **Tabela de Clientes**: Lista detalhada com filtros
- **Filtros**: Por período e status
- **Responsivo**: Adaptável a diferentes tamanhos de tela

## 🎯 Estrutura do Projeto

```
src/
├── components/
│   └── ui/           # Componentes base da UI
├── lib/
│   └── utils.ts      # Utilitários (cn function)
├── App.tsx           # Componente principal
├── main.tsx          # Ponto de entrada
└── index.css         # Estilos globais
```

## 🔧 Configuração

### Tailwind CSS v4

O projeto está configurado para usar Tailwind CSS v4 com:
- Variáveis CSS customizadas para temas
- Suporte a modo escuro
- Configuração de cores do shadcn/ui

### TypeScript

Configuração otimizada para React com:
- Path mapping (`@/` para `src/`)
- Strict mode habilitado
- Suporte a JSX

## 📝 Licença

Este projeto está sob a licença MIT.

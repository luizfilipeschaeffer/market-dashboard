#!/bin/bash

# Script de Instalação - Market Dashboard
# Ubuntu 18.04 LTS
# 
# Este script instala todas as dependências necessárias para executar
# o projeto Market Dashboard em um sistema Ubuntu 18.04

set -e  # Para o script em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   print_error "Este script não deve ser executado como root!"
   print_message "Execute: bash install-ubuntu.sh"
   exit 1
fi

print_message "=== Instalação do Market Dashboard ==="
print_message "Sistema: Ubuntu 18.04 LTS"
print_message "Usuário: $(whoami)"
print_message "Diretório: $(pwd)"
echo

# 1. Atualizar sistema
print_message "1. Atualizando sistema..."
sudo apt update && sudo apt upgrade -y
print_success "Sistema atualizado!"

# 2. Instalar dependências do sistema
print_message "2. Instalando dependências do sistema..."
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    unzip \
    python3 \
    python3-pip
print_success "Dependências do sistema instaladas!"

# 3. Instalar Node.js 18.x
print_message "3. Instalando Node.js 18.x..."

# Verificar se Node.js já está instalado
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        print_warning "Node.js $NODE_VERSION já está instalado. Pulando instalação..."
    else
        print_message "Node.js $NODE_VERSION encontrado. Atualizando para versão 18..."
        # Remover versão antiga
        sudo apt remove -y nodejs npm
    fi
fi

# Instalar Node.js 18.x se não estiver instalado ou se for versão antiga
if ! command -v node &> /dev/null || [ "$NODE_VERSION" -lt 18 ]; then
    # Adicionar repositório do NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js $(node --version) instalado!"
else
    print_success "Node.js $(node --version) já está na versão correta!"
fi

# 4. Verificar instalação do Node.js e npm
print_message "4. Verificando instalações..."
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# 5. Instalar dependências do projeto
print_message "5. Instalando dependências do projeto..."

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    print_error "package.json não encontrado! Execute este script no diretório raiz do projeto."
    exit 1
fi

# Instalar dependências
npm install
print_success "Dependências do projeto instaladas!"

# 6. Verificar se a instalação foi bem-sucedida
print_message "6. Verificando instalação..."

# Verificar se node_modules existe
if [ -d "node_modules" ]; then
    print_success "node_modules criado com sucesso!"
else
    print_error "Falha ao criar node_modules!"
    exit 1
fi

# 7. Testar build
print_message "7. Testando build do projeto..."
if npm run build; then
    print_success "Build executado com sucesso!"
else
    print_error "Falha no build do projeto!"
    exit 1
fi

# 8. Criar script de inicialização
print_message "8. Criando script de inicialização..."
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "=== Iniciando Market Dashboard ==="
echo "Desenvolvimento: http://localhost:3050"
echo "Pressione Ctrl+C para parar"
echo
npm run dev
EOF

chmod +x start-dev.sh
print_success "Script start-dev.sh criado!"

# 9. Criar script de produção
print_message "9. Criando script de produção..."
cat > start-prod.sh << 'EOF'
#!/bin/bash
echo "=== Iniciando Market Dashboard (Produção) ==="
echo "Produção: http://localhost:3050"
echo "Pressione Ctrl+C para parar"
echo
npm run build
npm run preview
EOF

chmod +x start-prod.sh
print_success "Script start-prod.sh criado!"

# 10. Informações finais
echo
print_success "=== Instalação Concluída! ==="
echo
print_message "Comandos disponíveis:"
echo "  Desenvolvimento: ./start-dev.sh ou npm run dev"
echo "  Produção:       ./start-prod.sh ou npm run build && npm run preview"
echo "  Linting:        npm run lint"
echo
print_message "URLs de acesso:"
echo "  Desenvolvimento: http://localhost:3050"
echo "  Produção:        http://localhost:3050"
echo
print_message "Estrutura do projeto:"
echo "  - src/          - Código fonte"
echo "  - public/       - Arquivos estáticos"
echo "  - dist/         - Build de produção"
echo "  - docs/         - Documentação"
echo "  - scripts/      - Scripts de automação"
echo
print_success "Pronto para usar! Execute './start-dev.sh' para iniciar o desenvolvimento."

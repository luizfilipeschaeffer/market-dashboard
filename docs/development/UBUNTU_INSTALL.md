# Instalação no Ubuntu 18.04 LTS

Este guia fornece instruções detalhadas para instalar e executar o Market Dashboard em um sistema Ubuntu 18.04 LTS.

## Pré-requisitos

- Ubuntu 18.04 LTS (ou superior)
- Acesso de administrador (sudo)
- Conexão com a internet

## Instalação Automática

### Opção 1: Script de Instalação (Recomendado)

1. **Clone ou baixe o projeto:**
   ```bash
   git clone <url-do-repositorio>
   cd market-dashboard
   ```

2. **Execute o script de instalação:**
   ```bash
   chmod +x scripts/install-ubuntu.sh
   ./scripts/install-ubuntu.sh
   ```

3. **Inicie o desenvolvimento:**
   ```bash
   ./start-dev.sh
   ```

### Opção 2: Instalação Manual

1. **Atualizar o sistema:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Instalar dependências do sistema:**
   ```bash
   sudo apt install -y curl wget git build-essential software-properties-common
   ```

3. **Instalar Node.js 18.x:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

4. **Verificar instalação:**
   ```bash
   node --version  # Deve ser v18.x.x ou superior
   npm --version   # Deve ser 9.x.x ou superior
   ```

5. **Instalar dependências do projeto:**
   ```bash
   npm install
   ```

6. **Testar a instalação:**
   ```bash
   npm run build
   ```

## Executando o Projeto

### Desenvolvimento
```bash
npm run dev
# ou
./start-dev.sh
```
Acesse: http://localhost:3050

### Produção
```bash
npm run build
npm run preview
# ou
./start-prod.sh
```
Acesse: http://localhost:3050

## Scripts Disponíveis

Após a instalação, os seguintes scripts estarão disponíveis:

- `start-dev.sh` - Inicia o servidor de desenvolvimento
- `start-prod.sh` - Inicia o servidor de produção
- `scripts/install-ubuntu.sh` - Script de instalação

## Comandos NPM

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview da build
- `npm run lint` - Verificação de código

## Estrutura do Projeto

```
market-dashboard/
├── src/                    # Código fonte
│   ├── components/         # Componentes React
│   ├── pages/             # Páginas da aplicação
│   ├── services/          # Serviços da API
│   └── types/             # Definições TypeScript
├── public/                # Arquivos estáticos
├── dist/                  # Build de produção
├── docs/                  # Documentação
├── scripts/               # Scripts de automação
└── memory-bank/           # Banco de memória do projeto
```

## Solução de Problemas

### Erro: "node: command not found"
```bash
# Reinstalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Erro: "npm: command not found"
```bash
# Instalar npm
sudo apt install -y npm
```

### Erro: "Permission denied"
```bash
# Dar permissão de execução aos scripts
chmod +x scripts/*.sh
chmod +x start-*.sh
```

### Erro: "Port 3050 already in use"
```bash
# Encontrar processo usando a porta
sudo lsof -i :3050
# Matar o processo
sudo kill -9 <PID>
```

### Erro de dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## Configuração Adicional

### Configurar Git (se necessário)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### Instalar editor recomendado (VS Code)
```bash
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install -y code
```

## Suporte

Para problemas específicos do Ubuntu 18.04:

1. Verifique os logs de instalação
2. Consulte a documentação do Node.js
3. Verifique as dependências do sistema
4. Execute o script de instalação novamente

## Notas Importantes

- O script de instalação é específico para Ubuntu 18.04 LTS
- Node.js 18+ é obrigatório
- A porta 3050 será usada tanto para desenvolvimento quanto produção
- O script cria scripts auxiliares para facilitar o uso

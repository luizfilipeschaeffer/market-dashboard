# Docker Setup - Market Dashboard

Este documento contém instruções para executar o Market Dashboard usando Docker.

## Estrutura de Arquivos Docker

```
docker/
├── Dockerfile          # Imagem de produção multi-stage com nginx
├── Dockerfile.dev      # Imagem de desenvolvimento
├── Dockerfile          # Imagem simplificada para desenvolvimento
├── docker-compose.yml  # Orquestração de containers
├── nginx.conf          # Configuração do nginx para servir a aplicação
├── start-docker.bat    # Script de conveniência para Windows
└── DOCKER.md          # Esta documentação
```

## Arquivos Docker Incluídos

- `docker/Dockerfile` - Imagem de produção multi-stage com nginx
- `docker/Dockerfile.dev` - Imagem de desenvolvimento
- `docker/Dockerfile` - Imagem simplificada para desenvolvimento (recomendado)
- `docker/docker-compose.yml` - Orquestração de containers
- `docker/nginx.conf` - Configuração do nginx para servir a aplicação
- `.dockerignore` - Arquivos ignorados no build (na raiz do projeto)

## Comandos Disponíveis

### Produção

#### Build e execução da imagem de produção:
```bash
# Navegar para a pasta docker
cd docker

# Build da imagem
docker build -t market-dashboard -f Dockerfile ..

# Executar container
docker run -p 3050:80 market-dashboard
```

#### Usando Docker Compose (Recomendado):
```bash
# Navegar para a pasta docker
cd docker

# Build e execução
docker-compose up --build

# Execução em background
docker-compose up -d --build

# Parar containers
docker-compose down
```

#### Usando o script de conveniência (Windows):
```bash
# Executar o script na pasta docker
docker/start-docker.bat
```

### Desenvolvimento

#### Executar em modo desenvolvimento:
```bash
# Navegar para a pasta docker
cd docker

# Usando docker-compose com perfil de desenvolvimento
docker-compose --profile dev up --build

# Ou usando Dockerfile.dev diretamente
docker build -f Dockerfile.dev -t market-dashboard-dev ..
docker run -p 3051:3050 -v $(pwd)/..:/app -v /app/node_modules market-dashboard-dev
```

## Acessos

- **Produção**: http://localhost:3050 ou http://[SEU_IP]:3050
- **Desenvolvimento**: http://localhost:3051 ou http://[SEU_IP]:3051
- **Health Check**: http://localhost:3050/health ou http://[SEU_IP]:3050/health

### Acesso Externo

A aplicação está configurada para aceitar conexões de qualquer IP (0.0.0.0), permitindo acesso de outros dispositivos na rede local:

- Substitua `[SEU_IP]` pelo IP da máquina onde o Docker está rodando
- Exemplo: Se seu IP for 192.168.1.100, acesse http://192.168.1.100:3050

## Características da Configuração

### Produção
- Imagem multi-stage otimizada
- Nginx como servidor web
- Compressão gzip habilitada
- Headers de segurança configurados
- Cache de assets estáticos
- Suporte a SPA (Single Page Application)
- Health check endpoint

### Desenvolvimento
- Hot reload habilitado
- Volume mount para código fonte
- Todas as dependências incluídas
- Porta 3051 para evitar conflitos

## Troubleshooting

### Limpar containers e imagens:
```bash
# Parar e remover containers
docker-compose -f docker/docker-compose.yml down

# Remover imagens
docker rmi market-dashboard market-dashboard-dev

# Limpeza completa (cuidado!)
docker system prune -a
```

### Ver logs:
```bash
# Logs do docker-compose
docker-compose -f docker/docker-compose.yml logs -f

# Logs de container específico
docker logs market-dashboard-app
```

### Rebuild completo:
```bash
# Remover tudo e rebuildar
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml build --no-cache
docker-compose -f docker/docker-compose.yml up
```

## Variáveis de Ambiente

Você pode configurar variáveis de ambiente no arquivo `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - API_URL=https://api.example.com
```

## Portas

- **3050**: Aplicação de produção (nginx)
- **3051**: Aplicação de desenvolvimento (vite dev server)

## Recursos

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)

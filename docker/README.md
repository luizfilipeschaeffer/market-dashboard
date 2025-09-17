# Market Dashboard - Docker

Este projeto está configurado para rodar com Docker. Todos os arquivos relacionados ao Docker estão organizados na pasta `docker/`.

## 🚀 Início Rápido

### Opção 1: Script de Conveniência (Windows)
```bash
# Execute o script na pasta docker
docker/start-docker.bat
```

### Opção 2: Docker Compose
```bash
# Inicie a aplicação (da raiz do projeto)
docker-compose -f docker/docker-compose.yml up -d

# Para desenvolvimento
docker-compose -f docker/docker-compose.yml --profile dev up
```

### Opção 3: Docker Build Manual
```bash
# Build da imagem simplificada (recomendado)
docker build -f docker/Dockerfile -t market-dashboard .

# Execute o container
docker run -p 3050:3050 market-dashboard
```

## 📁 Estrutura Docker

```
docker/
├── Dockerfile              # Imagem de produção (nginx)
├── Dockerfile.dev          # Imagem de desenvolvimento
├── Dockerfile              # Imagem simplificada (recomendado)
├── docker-compose.yml      # Orquestração de containers
├── nginx.conf              # Configuração do nginx
├── start-docker.bat        # Script de conveniência
└── DOCKER.md               # Documentação completa
```

## 🌐 Acessos

- **Produção**: http://localhost:3050
- **Desenvolvimento**: http://localhost:3051

## 📖 Documentação Completa

Para instruções detalhadas, consulte: [docker/DOCKER.md](docker/DOCKER.md)

## 🛠️ Comandos Úteis

```bash
# Parar containers
docker-compose -f docker/docker-compose.yml down

# Ver logs
docker-compose -f docker/docker-compose.yml logs -f

# Rebuild completo
docker-compose -f docker/docker-compose.yml build --no-cache
docker-compose -f docker/docker-compose.yml up
```
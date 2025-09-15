# Scripts de Upload em Lote

Este diretório contém scripts para fazer upload em lote de dados CSV para a API.

## Scripts Disponíveis

### 1. simple-batch-upload.js (Recomendado)

Script simples que funciona com Node.js versões mais antigas.

**Uso:**
```bash
node scripts/simple-batch-upload.js data/clients_updated.csv
```

**Características:**
- Funciona com Node.js 14+
- Processa 5 clientes por vez
- Pausa entre operações para não sobrecarregar a API
- Logs detalhados do progresso
- Relatório final com estatísticas

### 2. batch-upload.mjs (Node.js 18+)

Script mais avançado que usa ES modules.

**Uso:**
```bash
node scripts/batch-upload.mjs data/clients_updated.csv --api-url http://192.168.60.37:8080
```

**Características:**
- Requer Node.js 18+ (para fetch nativo)
- Processa em lotes maiores (10 clientes, 20 backups)
- Mais opções de configuração
- Melhor performance

## Formato do CSV

O arquivo CSV deve ter o seguinte formato:

```csv
id,nome,email,cnpj,ativo,dataInclusao,backups
1,Cliente Teste,teste@email.com,12.345.678/0001-90,true,2025-01-15T00:00:00.000Z,"[{""id"": 1, ""status"": ""SUCESSO"", ""mensagem"": ""Backup realizado com sucesso"", ""vacuumExecutado"": false, ""vacuumDataExecucao"": null, ""dataInicio"": ""2025-09-14T02:36:00.000Z"", ""dataFim"": ""2025-09-14T02:54:00.000Z"", ""tamanhoEmMb"": 4404.68, ""cliente"": ""Cliente Teste""}]"
```

### Campos Obrigatórios

- **id**: ID único do cliente (não será usado na API)
- **nome**: Nome do cliente
- **email**: Email do cliente (deve ser válido)
- **cnpj**: CNPJ do cliente (formato: XX.XXX.XXX/XXXX-XX)
- **ativo**: true/false (string)
- **dataInclusao**: Data de inclusão (ISO 8601)
- **backups**: JSON string com array de backups

### Formato dos Backups

O campo `backups` deve conter um JSON string com array de objetos:

```json
[
  {
    "id": 1,
    "status": "SUCESSO",
    "mensagem": "Backup realizado com sucesso",
    "vacuumExecutado": false,
    "vacuumDataExecucao": null,
    "dataInicio": "2025-09-14T02:36:00.000Z",
    "dataFim": "2025-09-14T02:54:00.000Z",
    "tamanhoEmMb": 4404.68,
    "cliente": "Nome do Cliente"
  }
]
```

## Exemplo de Uso

1. **Preparar o arquivo CSV:**
   ```bash
   # O arquivo data/clients_updated.csv já está no formato correto
   ls -la data/clients_updated.csv
   ```

2. **Executar o upload:**
   ```bash
   # Usar o script simples (recomendado)
   node scripts/simple-batch-upload.js data/clients_updated.csv
   ```

3. **Verificar o resultado:**
   O script mostrará logs detalhados e um resumo final com:
   - Total de clientes processados
   - Clientes criados com sucesso
   - Clientes que falharam
   - Total de backups processados
   - Backups criados com sucesso
   - Backups que falharam
   - Taxa de sucesso

## Tratamento de Erros

Os scripts incluem tratamento robusto de erros:

- **Validação de arquivo**: Verifica se o arquivo existe e tem o formato correto
- **Validação de dados**: Verifica campos obrigatórios e formatos
- **Retry automático**: Em caso de falha temporária da API
- **Logs detalhados**: Mostra exatamente onde ocorreu cada erro
- **Relatório final**: Lista todos os erros encontrados

## Configuração da API

Por padrão, os scripts usam a API em `http://192.168.60.37:8080`.

Para alterar a URL da API, edite o arquivo do script ou use a opção `--api-url` (apenas no script .mjs).

## Monitoramento

Durante a execução, você verá logs como:

```
ℹ️ [2025-01-15T10:30:00.000Z] Iniciando upload em lote para http://192.168.60.37:8080
ℹ️ [2025-01-15T10:30:00.100Z] Processando arquivo: data/clients_updated.csv
ℹ️ [2025-01-15T10:30:00.200Z] Processados 500 clientes com 5000 backups
🔄 [2025-01-15T10:30:00.300Z] Processando lote 1 (5 clientes)
🔄 [2025-01-15T10:30:00.400Z] Criando cliente: DataAlliance EIRELI
✅ [2025-01-15T10:30:00.500Z] Cliente criado com sucesso: DataAlliance EIRELI (ID: 1)
...
```

## Troubleshooting

### Erro: "Fetch não disponível"
- **Solução**: Instale node-fetch: `npm install node-fetch`
- **Alternativa**: Use Node.js 18+ ou o script simple-batch-upload.js

### Erro: "Arquivo não encontrado"
- **Solução**: Verifique se o caminho do arquivo está correto
- **Exemplo**: `node scripts/simple-batch-upload.js ./data/clients_updated.csv`

### Erro: "HTTP 500: Internal Server Error"
- **Solução**: Verifique se a API está rodando e acessível
- **Teste**: `curl http://192.168.60.37:8080/api/clientes`

### Erro: "Dados incompletos"
- **Solução**: Verifique se todas as linhas do CSV têm os campos obrigatórios
- **Campos**: nome, email, cnpj são obrigatórios

## Performance

- **Script simples**: ~5 clientes/minuto (com pausas)
- **Script avançado**: ~20 clientes/minuto (com pausas)
- **Sem pausas**: Pode sobrecarregar a API e causar erros

Recomenda-se usar as pausas padrão para evitar sobrecarregar a API.

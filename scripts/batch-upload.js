#!/usr/bin/env node

/**
 * Script CLI para upload em lote de dados CSV para a API
 * 
 * Uso:
 * node scripts/batch-upload.js <arquivo-csv> [opções]
 * 
 * Exemplo:
 * node scripts/batch-upload.js data/clients_updated.csv --api-url http://192.168.60.37:8080
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configurações
const DEFAULT_API_URL = 'http://192.168.60.37:8080';
const BATCH_SIZE_CLIENTS = 10;
const BATCH_SIZE_BACKUPS = 20;
const DELAY_BETWEEN_BATCHES = 100; // ms

class BatchUploader {
  constructor(apiUrl = DEFAULT_API_URL) {
    this.apiUrl = apiUrl;
    this.stats = {
      totalClients: 0,
      totalBackups: 0,
      clientsCreated: 0,
      clientsFailed: 0,
      backupsCreated: 0,
      backupsFailed: 0,
      errors: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      progress: '🔄'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.apiUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Erro na requisição: ${error.message}`);
    }
  }

  parseCsvRow(row) {
    const values = row.split(',').map(v => v.trim());
    
    return {
      id: values[0] || '',
      nome: values[1] || '',
      email: values[2] || '',
      cnpj: values[3] || '',
      ativo: values[4] || '',
      dataInclusao: values[5] || '',
      backups: values[6] || '[]'
    };
  }

  parseBackups(backupsJson) {
    try {
      const backups = JSON.parse(backupsJson);
      return backups.map(backup => ({
        clienteId: 0, // Será preenchido após criar o cliente
        status: backup.status === 'SUCESSO' ? 'SUCESSO' : 'FALHA',
        mensagem: backup.mensagem || '',
        vacuumExecutado: backup.vacuumExecutado || false,
        vacuumDataExecucao: backup.vacuumDataExecucao || undefined,
        dataInicio: backup.dataInicio || undefined,
        dataFim: backup.dataFim || undefined,
        tamanhoEmMb: backup.tamanhoEmMb || 0
      }));
    } catch (error) {
      this.log(`Erro ao fazer parse dos backups: ${error.message}`, 'warning');
      return [];
    }
  }

  async processCsvFile(filePath) {
    this.log(`Processando arquivo: ${filePath}`);
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados');
    }

    const clients = [];
    
    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCsvRow(lines[i]);
      
      if (!row.nome || !row.email || !row.cnpj) {
        this.log(`Linha ${i + 1}: Dados incompletos, pulando...`, 'warning');
        continue;
      }

      const client = {
        nome: row.nome,
        email: row.email,
        cnpj: row.cnpj,
        ativo: row.ativo.toLowerCase() === 'true',
        dataInclusao: row.dataInclusao,
        backups: this.parseBackups(row.backups)
      };

      clients.push(client);
    }

    this.stats.totalClients = clients.length;
    this.stats.totalBackups = clients.reduce((sum, client) => sum + client.backups.length, 0);
    
    this.log(`Processados ${clients.length} clientes com ${this.stats.totalBackups} backups`);
    return clients;
  }

  async createClient(client) {
    try {
      const result = await this.makeRequest('/api/clientes', {
        method: 'POST',
        body: JSON.stringify(client)
      });
      
      this.stats.clientsCreated++;
      return { success: true, clientId: result.id, data: result };
    } catch (error) {
      this.stats.clientsFailed++;
      this.stats.errors.push(`Erro ao criar cliente ${client.nome}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async createBackup(backup) {
    try {
      const result = await this.makeRequest('/api/backups', {
        method: 'POST',
        body: JSON.stringify(backup)
      });
      
      this.stats.backupsCreated++;
      return { success: true, backupId: result.id, data: result };
    } catch (error) {
      this.stats.backupsFailed++;
      this.stats.errors.push(`Erro ao criar backup para cliente ${backup.clienteId}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async createClientsBatch(clients) {
    this.log(`Criando lote de ${clients.length} clientes...`);
    
    const results = [];
    
    for (let i = 0; i < clients.length; i += BATCH_SIZE_CLIENTS) {
      const batch = clients.slice(i, i + BATCH_SIZE_CLIENTS);
      this.log(`Processando lote ${Math.floor(i / BATCH_SIZE_CLIENTS) + 1} (${batch.length} clientes)`);
      
      const batchPromises = batch.map(async (client, batchIndex) => {
        const globalIndex = i + batchIndex;
        this.log(`Criando cliente ${globalIndex + 1}/${clients.length}: ${client.nome}`, 'progress');
        
        const result = await this.createClient(client);
        return { ...result, index: globalIndex, client };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Pequena pausa entre lotes
      if (i + BATCH_SIZE_CLIENTS < clients.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    return results;
  }

  async createBackupsBatch(backups) {
    if (backups.length === 0) {
      this.log('Nenhum backup para criar');
      return [];
    }

    this.log(`Criando lote de ${backups.length} backups...`);
    
    const results = [];
    
    for (let i = 0; i < backups.length; i += BATCH_SIZE_BACKUPS) {
      const batch = backups.slice(i, i + BATCH_SIZE_BACKUPS);
      this.log(`Processando lote de backups ${Math.floor(i / BATCH_SIZE_BACKUPS) + 1} (${batch.length} backups)`);
      
      const batchPromises = batch.map(async (backup, batchIndex) => {
        const globalIndex = i + batchIndex;
        this.log(`Criando backup ${globalIndex + 1}/${backups.length} para cliente ${backup.clienteId}`, 'progress');
        
        const result = await this.createBackup(backup);
        return { ...result, index: globalIndex, backup };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Pequena pausa entre lotes
      if (i + BATCH_SIZE_BACKUPS < backups.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    return results;
  }

  async uploadData(clients) {
    this.log('Iniciando upload de dados...');
    
    // 1. Criar clientes
    const clientResults = await this.createClientsBatch(clients);
    
    // 2. Coletar backups dos clientes criados com sucesso
    const allBackups = [];
    const clientIdMap = new Map();
    
    clientResults.forEach((result, index) => {
      if (result.success && result.clientId) {
        clientIdMap.set(index, result.clientId);
        
        // Atualizar clienteId nos backups
        const clientBackups = clients[index].backups.map(backup => ({
          ...backup,
          clienteId: result.clientId
        }));
        
        allBackups.push(...clientBackups);
      }
    });
    
    this.log(`Coletados ${allBackups.length} backups para criação`);
    
    // 3. Criar backups
    const backupResults = await this.createBackupsBatch(allBackups);
    
    return { clientResults, backupResults };
  }

  printSummary() {
    this.log('\n=== RESUMO DO UPLOAD ===', 'info');
    this.log(`Total de clientes processados: ${this.stats.totalClients}`);
    this.log(`Clientes criados com sucesso: ${this.stats.clientsCreated}`, 'success');
    this.log(`Clientes que falharam: ${this.stats.clientsFailed}`, this.stats.clientsFailed > 0 ? 'error' : 'success');
    this.log(`Total de backups processados: ${this.stats.totalBackups}`);
    this.log(`Backups criados com sucesso: ${this.stats.backupsCreated}`, 'success');
    this.log(`Backups que falharam: ${this.stats.backupsFailed}`, this.stats.backupsFailed > 0 ? 'error' : 'success');
    
    if (this.stats.errors.length > 0) {
      this.log('\n=== ERROS ===', 'error');
      this.stats.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error}`, 'error');
      });
    }
    
    const successRate = this.stats.totalClients > 0 ? 
      ((this.stats.clientsCreated / this.stats.totalClients) * 100).toFixed(2) : 0;
    
    this.log(`\nTaxa de sucesso: ${successRate}%`, successRate > 90 ? 'success' : 'warning');
  }

  async run(filePath) {
    try {
      this.log(`Iniciando upload em lote para ${this.apiUrl}`);
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo não encontrado: ${filePath}`);
      }
      
      // Processar arquivo CSV
      const clients = await this.processCsvFile(filePath);
      
      if (clients.length === 0) {
        this.log('Nenhum cliente válido encontrado no arquivo', 'warning');
        return;
      }
      
      // Fazer upload
      await this.uploadData(clients);
      
      // Mostrar resumo
      this.printSummary();
      
      this.log('Upload concluído!', 'success');
      
    } catch (error) {
      this.log(`Erro fatal: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Uso: node scripts/batch-upload.js <arquivo-csv> [opções]

Opções:
  --api-url <url>    URL da API (padrão: ${DEFAULT_API_URL})
  --help             Mostra esta ajuda

Exemplo:
  node scripts/batch-upload.js data/clients_updated.csv --api-url http://192.168.60.37:8080
    `);
    process.exit(1);
  }
  
  if (args.includes('--help')) {
    console.log(`
Script CLI para upload em lote de dados CSV para a API

Uso:
  node scripts/batch-upload.js <arquivo-csv> [opções]

Argumentos:
  <arquivo-csv>      Caminho para o arquivo CSV com dados de clientes

Opções:
  --api-url <url>    URL da API (padrão: ${DEFAULT_API_URL})
  --help             Mostra esta ajuda

Exemplo:
  node scripts/batch-upload.js data/clients_updated.csv --api-url http://192.168.60.37:8080

Formato do CSV esperado:
  id,nome,email,cnpj,ativo,dataInclusao,backups
  1,Cliente Teste,teste@email.com,12.345.678/0001-90,true,2025-01-15T00:00:00.000Z,"[{...}]"
    `);
    process.exit(0);
  }
  
  const filePath = args[0];
  const apiUrlIndex = args.indexOf('--api-url');
  const apiUrl = apiUrlIndex !== -1 && args[apiUrlIndex + 1] ? 
    args[apiUrlIndex + 1] : DEFAULT_API_URL;
  
  const uploader = new BatchUploader(apiUrl);
  await uploader.run(filePath);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
}

module.exports = BatchUploader;

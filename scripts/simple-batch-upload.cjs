#!/usr/bin/env node

/**
 * Script CLI simples para upload em lote de dados CSV para a API
 * Funciona com Node.js versões mais antigas (usa node-fetch)
 * 
 * Uso:
 * node scripts/simple-batch-upload.js <arquivo-csv>
 * 
 * Exemplo:
 * node scripts/simple-batch-upload.js data/clients_updated.csv
 */

const fs = require('fs');
const path = require('path');

// Configurações
const API_URL = 'http://192.168.60.37:8080';
const BATCH_SIZE = 5; // Processar 5 clientes por vez
const DELAY = 200; // 200ms entre lotes

class SimpleBatchUploader {
  constructor() {
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
    // Usar fetch nativo se disponível (Node 18+), senão usar require dinâmico
    let fetch;
    
    try {
      // Tentar usar fetch nativo primeiro
      fetch = globalThis.fetch;
    } catch (e) {
      // Se não disponível, tentar carregar node-fetch
      try {
        const nodeFetch = require('node-fetch');
        fetch = nodeFetch.default || nodeFetch;
      } catch (e2) {
        throw new Error('Fetch não disponível. Instale node-fetch: npm install node-fetch');
      }
    }

    const url = `${API_URL}${endpoint}`;
    
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
    // Parse simples do CSV (assumindo que não há vírgulas dentro dos valores)
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
      this.log(`Criando cliente: ${client.nome}`, 'progress');
      
      const result = await this.makeRequest('/api/clientes', {
        method: 'POST',
        body: JSON.stringify(client)
      });
      
      this.stats.clientsCreated++;
      this.log(`Cliente criado com sucesso: ${client.nome} (ID: ${result.id})`, 'success');
      return { success: true, clientId: result.id, data: result };
    } catch (error) {
      this.stats.clientsFailed++;
      this.stats.errors.push(`Erro ao criar cliente ${client.nome}: ${error.message}`);
      this.log(`Erro ao criar cliente ${client.nome}: ${error.message}`, 'error');
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

  async createBackupsForClient(client, clientId) {
    if (client.backups.length === 0) {
      return [];
    }

    this.log(`Criando ${client.backups.length} backups para cliente ${client.nome}`, 'progress');
    
    const results = [];
    
    for (const backup of client.backups) {
      const backupWithClientId = {
        ...backup,
        clienteId: clientId
      };
      
      const result = await this.createBackup(backupWithClientId);
      results.push(result);
      
      // Pequena pausa entre backups
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    return results;
  }

  async uploadData(clients) {
    this.log('Iniciando upload de dados...');
    
    for (let i = 0; i < clients.length; i += BATCH_SIZE) {
      const batch = clients.slice(i, i + BATCH_SIZE);
      this.log(`Processando lote ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} clientes)`);
      
      for (const client of batch) {
        // Criar cliente
        const clientResult = await this.createClient(client);
        
        if (clientResult.success) {
          // Criar backups do cliente
          await this.createBackupsForClient(client, clientResult.clientId);
        }
        
        // Pequena pausa entre clientes
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Pausa entre lotes
      if (i + BATCH_SIZE < clients.length) {
        this.log(`Aguardando ${DELAY}ms antes do próximo lote...`, 'info');
        await new Promise(resolve => setTimeout(resolve, DELAY));
      }
    }
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
      this.stats.errors.slice(0, 10).forEach((error, index) => {
        this.log(`${index + 1}. ${error}`, 'error');
      });
      
      if (this.stats.errors.length > 10) {
        this.log(`... e mais ${this.stats.errors.length - 10} erros`, 'error');
      }
    }
    
    const successRate = this.stats.totalClients > 0 ? 
      ((this.stats.clientsCreated / this.stats.totalClients) * 100).toFixed(2) : 0;
    
    this.log(`\nTaxa de sucesso: ${successRate}%`, successRate > 90 ? 'success' : 'warning');
  }

  async run(filePath) {
    try {
      this.log(`Iniciando upload em lote para ${API_URL}`);
      
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
Uso: node scripts/simple-batch-upload.js <arquivo-csv>

Exemplo:
  node scripts/simple-batch-upload.js data/clients_updated.csv

Formato do CSV esperado:
  id,nome,email,cnpj,ativo,dataInclusao,backups
  1,Cliente Teste,teste@email.com,12.345.678/0001-90,true,2025-01-15T00:00:00.000Z,"[{...}]"

Nota: Este script usa a API em ${API_URL}
    `);
    process.exit(1);
  }
  
  const filePath = args[0];
  const uploader = new SimpleBatchUploader();
  await uploader.run(filePath);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
}

module.exports = SimpleBatchUploader;

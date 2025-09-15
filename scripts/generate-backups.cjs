#!/usr/bin/env node

/**
 * Script para gerar registros de backup realistas para clientes existentes
 * 
 * Uso:
 * node scripts/generate-backups.cjs [opções]
 * 
 * Exemplo:
 * node scripts/generate-backups.cjs --start-date 2025-09-01 --days 15
 */

const fs = require('fs');
const path = require('path');

// Configurações
const API_URL = 'http://192.168.60.37:8080';
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 200; // ms
const BACKUPS_PER_DAY = 2;
const MIN_BACKUPS_PER_CLIENT = 200;

class BackupGenerator {
  constructor() {
    this.stats = {
      totalClients: 0,
      totalBackups: 0,
      backupsCreated: 0,
      backupsFailed: 0,
      errors: []
    };
    this.clients = [];
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

  loadClients() {
    this.log('Carregando clientes do arquivo...');
    
    try {
      const filePath = path.join(__dirname, '..', 'data_api', 'clientes_api.json');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      this.clients = JSON.parse(fileContent);
      
      this.stats.totalClients = this.clients.length;
      this.log(`Carregados ${this.clients.length} clientes`);
      
      return this.clients;
    } catch (error) {
      throw new Error(`Erro ao carregar clientes: ${error.message}`);
    }
  }

  generateBackupData(cliente, dayOffset, backupIndex) {
    const baseDate = new Date('2025-09-15T00:00:00.000Z');
    const currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() - dayOffset);
    
    // Progressão de estabilização: primeiros dias com mais problemas
    const isEarlyDays = dayOffset > 10; // Primeiros 10 dias com mais problemas
    const problemChance = isEarlyDays ? 0.4 : 0.1; // 40% de chance de problema nos primeiros dias, 10% depois
    
    // Progressão do tamanho: começa pequeno e cresce gradualmente
    const baseSize = 10 + (dayOffset * 2); // Tamanho base cresce com o tempo
    const sizeVariation = baseSize * 0.3; // ±30% de variação
    const size = Math.max(0.1, baseSize + (Math.random() - 0.5) * sizeVariation);
    
    // Progressão da duração: começa longa (problemas) e diminui
    const baseDuration = isEarlyDays ? 120 : 30; // 120 min nos primeiros dias, 30 min depois
    const durationVariation = baseDuration * 0.5;
    const durationMinutes = Math.max(5, baseDuration + (Math.random() - 0.5) * durationVariation);
    
    // Gerar horários aleatórios do dia
    const hour = Math.floor(Math.random() * 12) + 1; // 1h às 12h
    const minute = Math.floor(Math.random() * 60);
    
    const dataInicio = new Date(currentDate);
    dataInicio.setHours(hour, minute, 0, 0);
    
    const dataFim = new Date(dataInicio);
    dataFim.setMinutes(dataFim.getMinutes() + durationMinutes);
    
    // Determinar status baseado na progressão
    const isSuccess = Math.random() > problemChance;
    const status = isSuccess ? 'SUCESSO' : 'FALHA';
    
    // Mensagens baseadas no status
    const successMessages = [
      'Backup realizado com sucesso',
      'Backup concluído sem problemas',
      'Processo de backup finalizado',
      'Dados sincronizados com sucesso'
    ];
    
    const failureMessages = [
      'Backup falhou - espaço em disco insuficiente',
      'Backup falhou - banco de dados indisponível',
      'Backup falhou - timeout na operação',
      'Backup falhou - erro de conexão com o banco',
      'Backup falhou - erro de permissão'
    ];
    
    const mensagem = isSuccess ? 
      successMessages[Math.floor(Math.random() * successMessages.length)] :
      failureMessages[Math.floor(Math.random() * failureMessages.length)];
    
    // Vacuum executado (mais comum em backups bem-sucedidos)
    const vacuumExecutado = isSuccess && Math.random() > 0.3;
    const vacuumDataExecucao = vacuumExecutado ? 
      new Date(dataInicio.getTime() + Math.random() * (dataFim.getTime() - dataInicio.getTime())) : 
      null;
    
    return {
      clienteId: cliente.id,
      status: status,
      mensagem: mensagem,
      vacuumExecutado: vacuumExecutado,
      vacuumDataExecucao: vacuumDataExecucao ? vacuumDataExecucao.toISOString() : null,
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      tamanhoEmMb: isSuccess ? parseFloat(size.toFixed(2)) : 0.0
    };
  }

  generateBackupsForClient(cliente, days) {
    const backups = [];
    
    this.log(`Gerando backups para cliente ${cliente.nome} (ID: ${cliente.id})`, 'progress');
    
    for (let day = 0; day < days; day++) {
      // Gerar 2 backups por dia
      for (let backupIndex = 0; backupIndex < BACKUPS_PER_DAY; backupIndex++) {
        const backup = this.generateBackupData(cliente, day, backupIndex);
        backups.push(backup);
      }
    }
    
    this.log(`Gerados ${backups.length} backups para ${cliente.nome}`);
    return backups;
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

  async createBackupsBatch(backups) {
    if (backups.length === 0) {
      return [];
    }

    this.log(`Criando lote de ${backups.length} backups...`);
    
    const results = [];
    
    for (let i = 0; i < backups.length; i += BATCH_SIZE) {
      const batch = backups.slice(i, i + BATCH_SIZE);
      this.log(`Processando lote de backups ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} backups)`);
      
      const batchPromises = batch.map(async (backup, batchIndex) => {
        const globalIndex = i + batchIndex;
        
        if (globalIndex % 50 === 0) {
          this.log(`Criando backup ${globalIndex + 1}/${backups.length}`, 'progress');
        }
        
        const result = await this.createBackup(backup);
        return { ...result, index: globalIndex, backup };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Pausa entre lotes
      if (i + BATCH_SIZE < backups.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    return results;
  }

  async generateAndUploadBackups(days = 15) {
    this.log(`Iniciando geração de backups para ${days} dias...`);
    
    const allBackups = [];
    
    // Gerar backups para cada cliente
    for (const cliente of this.clients) {
      const clientBackups = this.generateBackupsForClient(cliente, days);
      allBackups.push(...clientBackups);
    }
    
    this.stats.totalBackups = allBackups.length;
    this.log(`Total de backups gerados: ${allBackups.totalBackups}`);
    
    // Fazer upload dos backups
    const results = await this.createBackupsBatch(allBackups);
    
    return results;
  }

  printSummary() {
    this.log('\n=== RESUMO DA GERAÇÃO DE BACKUPS ===', 'info');
    this.log(`Total de clientes processados: ${this.stats.totalClients}`);
    this.log(`Total de backups gerados: ${this.stats.totalBackups}`);
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
    
    const successRate = this.stats.totalBackups > 0 ? 
      ((this.stats.backupsCreated / this.stats.totalBackups) * 100).toFixed(2) : 0;
    
    this.log(`\nTaxa de sucesso: ${successRate}%`, successRate > 90 ? 'success' : 'warning');
  }

  async run(days = 15) {
    try {
      this.log(`Iniciando geração de backups para ${API_URL}`);
      
      // Carregar clientes
      this.loadClients();
      
      if (this.clients.length === 0) {
        this.log('Nenhum cliente encontrado', 'warning');
        return;
      }
      
      // Gerar e fazer upload dos backups
      await this.generateAndUploadBackups(days);
      
      // Mostrar resumo
      this.printSummary();
      
      this.log('Geração de backups concluída!', 'success');
      
    } catch (error) {
      this.log(`Erro fatal: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  let days = 15; // Padrão: 15 dias
  
  // Parse argumentos
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--days' && args[i + 1]) {
      days = parseInt(args[i + 1]);
      i++; // Pular o próximo argumento
    } else if (args[i] === '--help') {
      console.log(`
Script para gerar registros de backup realistas para clientes existentes

Uso:
  node scripts/generate-backups.cjs [opções]

Opções:
  --days <número>    Número de dias para gerar backups (padrão: 15)
  --help             Mostra esta ajuda

Exemplo:
  node scripts/generate-backups.cjs --days 20

Características:
- Gera 2 backups por dia por cliente
- Progressão realista: problemas iniciais, depois estabilização
- Tamanho cresce gradualmente com o tempo
- Duração diminui conforme estabiliza
- Vacuum executado em ~70% dos backups bem-sucedidos
      `);
      process.exit(0);
    }
  }
  
  const generator = new BackupGenerator();
  await generator.run(days);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
}

module.exports = BackupGenerator;

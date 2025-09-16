export interface ErrorCode {
  code: string
  title: string
  description: string
  category: 'api' | 'network' | 'data' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  solutions: string[]
  prevention: string[]
  faqLink?: string
}

export const ERROR_CODES: Record<string, ErrorCode> = {
  'API-001': {
    code: 'API-001',
    title: 'API não está respondendo',
    description: 'A API principal não está respondendo ou está fora do ar',
    category: 'api',
    severity: 'critical',
    solutions: [
      'Verifique se o servidor da API está rodando',
      'Confirme se a URL da API está correta (verifique o arquivo .env)',
      'Teste a conectividade de rede com o servidor',
      'Verifique os logs do servidor para erros',
      'Entre em contato com o administrador do sistema'
    ],
    prevention: [
      'Implementar monitoramento de saúde da API',
      'Configurar alertas automáticos',
      'Manter backup da API em servidor secundário'
    ],
    faqLink: '/faq#API-001'
  },
  'API-002': {
    code: 'API-002',
    title: 'Timeout na requisição',
    description: 'A requisição para a API está demorando muito para responder',
    category: 'api',
    severity: 'high',
    solutions: [
      'Aumentar o timeout da requisição',
      'Verificar a performance do servidor',
      'Otimizar consultas no banco de dados',
      'Implementar cache para dados frequentes',
      'Verificar a carga do servidor'
    ],
    prevention: [
      'Configurar timeouts apropriados',
      'Implementar cache inteligente',
      'Monitorar performance da API'
    ],
    faqLink: '/faq#API-002'
  },
  'API-003': {
    code: 'API-003',
    title: 'Erro de autenticação',
    description: 'Falha na autenticação com a API',
    category: 'api',
    severity: 'high',
    solutions: [
      'Verificar se as credenciais estão corretas',
      'Renovar token de autenticação',
      'Verificar permissões do usuário',
      'Contatar administrador para reset de senha',
      'Verificar configurações de segurança'
    ],
    prevention: [
      'Implementar renovação automática de tokens',
      'Configurar alertas de expiração',
      'Manter backup de credenciais'
    ],
    faqLink: '/faq#API-003'
  },
  'NET-001': {
    code: 'NET-001',
    title: 'Problema de conectividade',
    description: 'Falha na conexão de rede com o servidor',
    category: 'network',
    severity: 'high',
    solutions: [
      'Verificar conexão de internet',
      'Testar conectividade com ping',
      'Verificar configurações de firewall',
      'Tentar conectar de outra rede',
      'Verificar se o servidor está acessível'
    ],
    prevention: [
      'Implementar múltiplas rotas de rede',
      'Configurar VPN de backup',
      'Monitorar conectividade em tempo real'
    ],
    faqLink: '/faq#NET-001'
  },
  'NET-002': {
    code: 'NET-002',
    title: 'DNS não resolve',
    description: 'Não é possível resolver o endereço do servidor',
    category: 'network',
    severity: 'medium',
    solutions: [
      'Verificar configurações de DNS',
      'Usar IP direto em vez de domínio',
      'Verificar arquivo hosts local',
      'Tentar com DNS público (8.8.8.8)',
      'Verificar se o servidor está registrado no DNS'
    ],
    prevention: [
      'Configurar DNS redundante',
      'Manter registro de IPs alternativos',
      'Implementar fallback de DNS'
    ],
    faqLink: '/faq#NET-002'
  },
  'DATA-001': {
    code: 'DATA-001',
    title: 'Nenhum dado encontrado',
    description: 'A API retorna resposta vazia ou sem dados',
    category: 'data',
    severity: 'medium',
    solutions: [
      'Verificar se há dados cadastrados no sistema',
      'Verificar filtros de busca aplicados',
      'Verificar se o período selecionado tem dados',
      'Verificar logs de importação de dados',
      'Contatar administrador para verificar dados'
    ],
    prevention: [
      'Implementar validação de dados na importação',
      'Configurar alertas para dados vazios',
      'Manter backup de dados de exemplo'
    ],
    faqLink: '/faq#DATA-001'
  },
  'DATA-002': {
    code: 'DATA-002',
    title: 'Dados corrompidos',
    description: 'Os dados retornados estão em formato inválido',
    category: 'data',
    severity: 'high',
    solutions: [
      'Verificar formato dos dados na API',
      'Verificar encoding dos dados',
      'Verificar se o JSON está bem formado',
      'Verificar logs de erro na API',
      'Contatar desenvolvedor para correção'
    ],
    prevention: [
      'Implementar validação de dados na API',
      'Configurar logs detalhados',
      'Implementar testes automatizados'
    ],
    faqLink: '/faq#DATA-002'
  },
  'SYS-001': {
    code: 'SYS-001',
    title: 'Erro interno do servidor',
    description: 'Erro 500 - Falha interna no servidor',
    category: 'system',
    severity: 'critical',
    solutions: [
      'Verificar logs do servidor para detalhes',
      'Reiniciar o servidor da API',
      'Verificar recursos disponíveis (memória, CPU)',
      'Verificar configurações do servidor',
      'Contatar administrador do sistema'
    ],
    prevention: [
      'Implementar monitoramento de recursos',
      'Configurar alertas de uso de recursos',
      'Implementar restart automático'
    ],
    faqLink: '/faq#SYS-001'
  },
  'SYS-002': {
    code: 'SYS-002',
    title: 'Serviço indisponível',
    description: 'O serviço está temporariamente indisponível',
    category: 'system',
    severity: 'high',
    solutions: [
      'Aguardar alguns minutos e tentar novamente',
      'Verificar status do serviço',
      'Verificar se há manutenção programada',
      'Verificar logs do sistema',
      'Contatar suporte técnico'
    ],
    prevention: [
      'Implementar alta disponibilidade',
      'Configurar load balancer',
      'Implementar failover automático'
    ],
    faqLink: '/faq#SYS-002'
  }
}

export function getErrorCode(code: string): ErrorCode | undefined {
  return ERROR_CODES[code]
}

export function generateErrorCode(error: Error): string {
  // Gerar código baseado no tipo de erro e contexto
  if (error.message.includes('timeout') || error.message.includes('Timeout')) {
    return 'API-002'
  }
  
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return 'NET-001'
  }
  
  if (error.message.includes('404') || error.message.includes('Not Found')) {
    return 'DATA-001'
  }
  
  if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
    return 'SYS-001'
  }
  
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    return 'API-003'
  }
  
  if (error.message.includes('403') || error.message.includes('Forbidden')) {
    return 'API-003'
  }
  
  if (error.message.includes('DNS') || error.message.includes('resolve')) {
    return 'NET-002'
  }
  
  if (error.message.includes('JSON') || error.message.includes('parse')) {
    return 'DATA-002'
  }
  
  // Código padrão para erros não mapeados
  return 'API-001'
}

export function getErrorSeverityColor(severity: string): string {
  const colors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return colors[severity as keyof typeof colors] || colors.low
}

export function getErrorCategoryColor(category: string): string {
  const colors = {
    api: 'bg-blue-100 text-blue-800',
    network: 'bg-green-100 text-green-800',
    data: 'bg-yellow-100 text-yellow-800',
    system: 'bg-red-100 text-red-800'
  }
  return colors[category as keyof typeof colors] || colors.api
}

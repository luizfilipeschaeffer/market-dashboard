import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Wifi, 
  Database,
  Server,
  FileText,
  HelpCircle,
  ExternalLink,
  Shield
} from 'lucide-react'

interface FAQPageProps {
  onNavigateToHome: () => void
  onLoadComplete?: () => void
  initialErrorCode?: string | null
  onErrorProcessed?: () => void
}

interface ErrorCode {
  code: string
  title: string
  description: string
  category: 'api' | 'network' | 'data' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  solutions: string[]
  prevention: string[]
}

const errorCodes: ErrorCode[] = [
  {
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
    ]
  },
  {
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
    ]
  },
  {
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
    ]
  },
  {
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
    ]
  },
  {
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
    ]
  },
  {
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
    ]
  },
  {
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
    ]
  },
  {
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
    ]
  },
  {
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
    ]
  }
]

const categories = {
  api: { label: 'API', icon: Server, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  network: { label: 'Rede', icon: Wifi, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  data: { label: 'Dados', icon: Database, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  system: { label: 'Sistema', icon: AlertTriangle, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
}

const severityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export function FAQPage({ onNavigateToHome, onLoadComplete, initialErrorCode, onErrorProcessed }: FAQPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedError, setSelectedError] = useState<ErrorCode | null>(null)

  // Chamar onLoadComplete quando a página carregar
  useEffect(() => {
    onLoadComplete?.()
  }, [onLoadComplete])

  // Processar código de erro inicial se fornecido
  useEffect(() => {
    if (initialErrorCode) {
      const error = errorCodes.find(e => e.code === initialErrorCode)
      if (error) {
        setSelectedError(error)
        // Limpar o hash da URL após processar
        window.history.replaceState(null, '', window.location.pathname)
        // Notificar que o erro foi processado
        onErrorProcessed?.()
      }
    }
  }, [initialErrorCode, onErrorProcessed])

  const filteredErrors = errorCodes.filter(error => {
    const matchesSearch = error.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || error.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleErrorClick = (error: ErrorCode) => {
    setSelectedError(error)
  }

  const handleBackToList = () => {
    setSelectedError(null)
  }

  if (selectedError) {
    const categoryInfo = categories[selectedError.category]
    const CategoryIcon = categoryInfo.icon

    return (
      <PageWrapper>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToList}
              >
                ← Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedError.code} - {selectedError.title}
                </h1>
                <p className="text-muted-foreground">{selectedError.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={categoryInfo.color}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {categoryInfo.label}
              </Badge>
              <Badge className={severityColors[selectedError.severity]}>
                {selectedError.severity.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Soluções
                </CardTitle>
                <CardDescription>
                  Passos para resolver este problema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {selectedError.solutions.map((solution, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-foreground">{solution}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Prevenção
                </CardTitle>
                <CardDescription>
                  Como evitar este problema no futuro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {selectedError.prevention.map((prevention, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-foreground">{prevention}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Informações Adicionais
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Código do Erro</Label>
                  <p className="text-muted-foreground">{selectedError.code}</p>
                </div>
                <div>
                  <Label className="font-medium">Categoria</Label>
                  <p className="text-muted-foreground">{categoryInfo.label}</p>
                </div>
                <div>
                  <Label className="font-medium">Severidade</Label>
                  <p className="text-muted-foreground capitalize">{selectedError.severity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper pageTitle="FAQ - Códigos de Erro">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Encontre soluções para problemas comuns e códigos de erro
            </p>
          </div>
          <Button onClick={onNavigateToHome} variant="outline">
            ← Voltar ao Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Buscar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search">Buscar por código ou descrição</Label>
                  <Input
                    id="search"
                    placeholder="Ex: API-001, timeout..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Categoria</Label>
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="all">Todas</TabsTrigger>
                      <TabsTrigger value="api">API</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-2">
                      <div className="space-y-2">
                        {Object.entries(categories).map(([key, category]) => {
                          const Icon = category.icon
                          return (
                            <Button
                              key={key}
                              variant={selectedCategory === key ? "default" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => setSelectedCategory(key)}
                            >
                              <Icon className="h-4 w-4 mr-2" />
                              {category.label}
                            </Button>
                          )
                        })}
                      </div>
                    </TabsContent>
                    <TabsContent value="api" className="mt-2">
                      <div className="space-y-2">
                        <Button
                          variant={selectedCategory === 'all' ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory('all')}
                        >
                          <HelpCircle className="h-4 w-4 mr-2" />
                          Todas as Categorias
                        </Button>
                        {Object.entries(categories).map(([key, category]) => {
                          const Icon = category.icon
                          return (
                            <Button
                              key={key}
                              variant={selectedCategory === key ? "default" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => setSelectedCategory(key)}
                            >
                              <Icon className="h-4 w-4 mr-2" />
                              {category.label}
                            </Button>
                          )
                        })}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredErrors.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Nenhum erro encontrado
                    </h3>
                    <p className="text-muted-foreground">
                      Tente ajustar os filtros de busca ou categoria
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredErrors.map((error) => {
                  const categoryInfo = categories[error.category]
                  const CategoryIcon = categoryInfo.icon
                  
                  return (
                    <Card 
                      key={error.code} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleErrorClick(error)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={categoryInfo.color}>
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {categoryInfo.label}
                              </Badge>
                              <Badge className={severityColors[error.severity]}>
                                {error.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="font-mono">
                                {error.code}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {error.title}
                            </h3>
                            <p className="text-muted-foreground mb-3">
                              {error.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                {error.solutions.length} soluções
                              </span>
                              <span className="flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                {error.prevention.length} prevenções
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

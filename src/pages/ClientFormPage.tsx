import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { PageWrapper } from '@/components/PageWrapper'
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  User,
  FileText,
  Loader2
} from 'lucide-react'
import { api } from '@/services/api'

interface ClientFormPageProps {
  clientId?: string
  onNavigateBack: () => void
  onLoadStart?: () => void
  onLoadComplete?: () => void
}

interface ClientFormData {
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  status: 'active' | 'inactive' | 'pending'
  join_date: string
  logo: string
}

export function ClientFormPage({ clientId, onNavigateBack, onLoadStart, onLoadComplete }: ClientFormPageProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    join_date: new Date().toISOString().split('T')[0],
    logo: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)


  useEffect(() => {
    const loadClient = async () => {
      if (clientId) {
        try {
          onLoadStart?.()
          setLoading(true)
          const client = await api.clients.getById(clientId)
          if (client) {
            setFormData({
              name: client.name,
              cnpj: client.cnpj,
              email: client.email,
              phone: client.phone,
              address: client.address,
              status: client.status,
              join_date: client.join_date,
              logo: client.logo
            })
            setIsEditMode(true)
          }
        } catch (error) {
          console.error('Erro ao carregar cliente:', error)
        } finally {
          setLoading(false)
          onLoadComplete?.()
        }
      }
    }

    loadClient()
  }, [clientId, onLoadStart, onLoadComplete])

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // Aqui seria implementada a lógica de salvamento
      console.log('Salvando cliente:', formData)
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Após salvar, voltar para a listagem
      onNavigateBack()
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando cliente...</span>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onNavigateBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditMode ? 'Editar Cliente' : 'Novo Cliente'}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? 'Edite as informações do cliente' : 'Cadastre um novo cliente no sistema'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cadastral" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="cadastral" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados Cadastrais
            </TabsTrigger>
          </TabsList>

          {/* Aba Dados Cadastrais */}
          <TabsContent value="cadastral" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informações Básicas */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                  <CardDescription>
                    Dados principais da empresa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Empresa</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Digite o nome da empresa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => handleInputChange('cnpj', e.target.value)}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(00) 0000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'pending') => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Digite o endereço completo"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Informações Adicionais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informações Adicionais
                  </CardTitle>
                  <CardDescription>
                    Dados complementares
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="join_date">Data de Cadastro</Label>
                    <Input
                      id="join_date"
                      type="date"
                      value={formData.join_date}
                      onChange={(e) => handleInputChange('join_date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">URL do Logo</Label>
                    <Input
                      id="logo"
                      value={formData.logo}
                      onChange={(e) => handleInputChange('logo', e.target.value)}
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </div>

                  {formData.logo && (
                    <div className="space-y-2">
                      <Label>Preview do Logo</Label>
                      <div className="w-20 h-20 border rounded-lg overflow-hidden">
                        <img 
                          src={formData.logo} 
                          alt="Logo preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onNavigateBack}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Atualizar' : 'Salvar'}
              </>
            )}
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}

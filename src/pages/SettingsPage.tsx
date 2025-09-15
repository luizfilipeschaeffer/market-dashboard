import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { PageWrapper } from '@/components/PageWrapper'
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Bell, 
  Shield, 
  HardDrive,
  Server,
  Loader2
} from 'lucide-react'
import { api } from '@/services/api'

interface SettingsPageProps {
  onNavigateToHome: () => void
  onLoadStart?: () => void
  onLoadComplete?: () => void
}

export function SettingsPage({ onLoadStart, onLoadComplete }: SettingsPageProps) {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        onLoadStart?.()
        const settingsData = await api.settings.getAll()
        setSettings(settingsData)
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      } finally {
        setLoading(false)
        onLoadComplete?.()
      }
    }

    loadSettings()
  }, [onLoadStart, onLoadComplete])

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const success = await api.settings.update(settings)
      if (success) {
        console.log('Configurações salvas com sucesso')
        // Aqui poderia mostrar uma notificação de sucesso
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      // Aqui poderia mostrar uma notificação de erro
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    // Recarregar configurações do servidor
    window.location.reload()
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando configurações...</span>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Configurações do Sistema</h1>
          <p className="text-muted-foreground">Gerencie as configurações gerais, backups e notificações do sistema</p>
        </div>

        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Informações básicas da empresa e preferências do sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Empresa</label>
                <Input
                  value={settings.company_name || ''}
                  onChange={(e) => handleSettingChange('company_name', e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email de Contato</label>
                <Input
                  type="email"
                  value={settings.company_email || ''}
                  onChange={(e) => handleSettingChange('company_email', e.target.value)}
                  placeholder="contato@empresa.com.br"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={settings.company_phone || ''}
                  onChange={(e) => handleSettingChange('company_phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fuso Horário</label>
                <Select value={settings.timezone || 'America/Sao_Paulo'} onValueChange={(value) => handleSettingChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                    <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tóquio (GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Idioma</label>
                <Select value={settings.language || 'pt-BR'} onValueChange={(value) => handleSettingChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Backup */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HardDrive className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Configurações de Backup</CardTitle>
                <CardDescription>Configure a frequência, retenção e segurança dos backups</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequência de Backup</label>
                <Select value={settings.backup_frequency || 'daily'} onValueChange={(value) => handleSettingChange('backup_frequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">A cada hora</SelectItem>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Retenção (dias)</label>
                <Input
                  type="number"
                  value={settings.backup_retention || '30'}
                  onChange={(e) => handleSettingChange('backup_retention', e.target.value)}
                  placeholder="30"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Compressão de Backup</label>
                  <p className="text-sm text-muted-foreground">Reduz o tamanho dos arquivos de backup</p>
                </div>
                <Switch
                  checked={settings.backup_compression || false}
                  onCheckedChange={(checked) => handleSettingChange('backup_compression', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Criptografia de Backup</label>
                  <p className="text-sm text-muted-foreground">Protege os dados com criptografia</p>
                </div>
                <Switch
                  checked={settings.backup_encryption || false}
                  onCheckedChange={(checked) => handleSettingChange('backup_encryption', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Notificações de Backup</label>
                  <p className="text-sm text-muted-foreground">Receba alertas sobre status dos backups</p>
                </div>
                <Switch
                  checked={settings.backup_notifications || false}
                  onCheckedChange={(checked) => handleSettingChange('backup_notifications', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configure como e quando receber notificações do sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Notificações por Email</label>
                  <p className="text-sm text-muted-foreground">Receba alertas por email</p>
                </div>
                <Switch
                  checked={settings.email_notifications || false}
                  onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Notificações por SMS</label>
                  <p className="text-sm text-muted-foreground">Receba alertas por SMS</p>
                </div>
                <Switch
                  checked={settings.sms_notifications || false}
                  onCheckedChange={(checked) => handleSettingChange('sms_notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Notificações no Slack</label>
                  <p className="text-sm text-muted-foreground">Integração com Slack</p>
                </div>
                <Switch
                  checked={settings.slack_notifications || false}
                  onCheckedChange={(checked) => handleSettingChange('slack_notifications', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Frequência de Notificações</label>
              <Select value={settings.notification_frequency || 'immediate'} onValueChange={(value) => handleSettingChange('notification_frequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Imediato</SelectItem>
                  <SelectItem value="hourly">A cada hora</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Configure as políticas de segurança e autenticação</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Autenticação de Dois Fatores</label>
                  <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Timeout de Sessão (minutos)</label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                  placeholder="30"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Política de Senha</label>
                <Select value={settings.passwordPolicy} onValueChange={(value) => handleSettingChange('passwordPolicy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weak">Fraca</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="strong">Forte</SelectItem>
                    <SelectItem value="very-strong">Muito Forte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Lista Branca de IP</label>
                  <p className="text-sm text-muted-foreground">Restrinja acesso por endereço IP</p>
                </div>
                <Switch
                  checked={settings.ipWhitelist}
                  onCheckedChange={(checked) => handleSettingChange('ipWhitelist', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Server className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Sistema</CardTitle>
                <CardDescription>Configurações avançadas do sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Modo de Manutenção</label>
                  <p className="text-sm text-muted-foreground">Desabilite o acesso durante manutenções</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Modo Debug</label>
                  <p className="text-sm text-muted-foreground">Ative logs detalhados para desenvolvimento</p>
                </div>
                <Switch
                  checked={settings.debugMode}
                  onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Atualizações Automáticas</label>
                  <p className="text-sm text-muted-foreground">Instale atualizações automaticamente</p>
                </div>
                <Switch
                  checked={settings.autoUpdates}
                  onCheckedChange={(checked) => handleSettingChange('autoUpdates', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nível de Log</label>
              <Select value={settings.logLevel} onValueChange={(value) => handleSettingChange('logLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Erro</SelectItem>
                  <SelectItem value="warn">Aviso</SelectItem>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}

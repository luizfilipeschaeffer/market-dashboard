# Sistema de Temas - Market - Automações Dashboard

## 🎨 Visão Geral

O sistema de temas implementado permite que a aplicação se adapte automaticamente ao tema do sistema operacional do usuário e também oferece controle manual para escolher entre tema claro, escuro ou seguir o sistema.

## ✨ Funcionalidades

### 🔄 Detecção Automática
- **Tema do Sistema**: Detecta automaticamente se o usuário está usando tema claro ou escuro no sistema operacional
- **Mudanças Dinâmicas**: Atualiza automaticamente quando o usuário muda o tema do sistema
- **Persistência**: Salva a preferência do usuário no localStorage

### 🎛️ Controles Manuais
- **Toggle Rápido**: Botão para alternar entre os temas rapidamente
- **Seletor Completo**: Interface com botões para escolher entre Claro, Escuro ou Sistema
- **Indicadores Visuais**: Ícones que mostram o tema atual

## 🏗️ Arquitetura

### Contexto de Tema (`ThemeContext.tsx`)
```typescript
interface ThemeContextType {
  theme: Theme           // Tema selecionado (light/dark/system)
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark'  // Tema real sendo aplicado
}
```

### Componentes
- **`ThemeProvider`**: Provedor do contexto de tema
- **`ThemeToggle`**: Botão de alternância rápida
- **`ThemeSelect`**: Seletor completo com opções

## 🎯 Como Usar

### 1. Configuração Básica
```tsx
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <YourApp />
    </ThemeProvider>
  )
}
```

### 2. Usando o Hook
```tsx
import { useTheme } from './contexts/ThemeContext'

function MyComponent() {
  const { theme, setTheme, actualTheme } = useTheme()
  
  return (
    <div>
      <p>Tema atual: {actualTheme}</p>
      <button onClick={() => setTheme('dark')}>
        Mudar para escuro
      </button>
    </div>
  )
}
```

### 3. Componentes de Interface
```tsx
import { ThemeToggle, ThemeSelect } from '@/components/ThemeToggle'

function Header() {
  return (
    <header>
      <h1>Meu App</h1>
      <ThemeToggle />      {/* Toggle rápido */}
      <ThemeSelect />      {/* Seletor completo */}
    </header>
  )
}
```

## 🎨 Temas Disponíveis

### 🌞 Tema Claro
- Fundo branco
- Texto escuro
- Cores suaves e contrastes adequados
- Ideal para uso durante o dia

### 🌙 Tema Escuro
- Fundo escuro
- Texto claro
- Cores vibrantes em fundo escuro
- Ideal para uso noturno

### 🖥️ Tema Sistema
- Segue automaticamente o tema do SO
- Atualiza em tempo real
- Melhor experiência do usuário

## 🔧 Personalização

### Variáveis CSS
O sistema usa variáveis CSS que podem ser personalizadas:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... outras variáveis */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  /* ... outras variáveis */
}
```

### Transições Suaves
```css
* {
  transition-property: color, background-color, border-color;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 📱 Responsividade

- **Mobile**: Toggle compacto no header
- **Desktop**: Seletor completo com labels
- **Tablet**: Adaptação automática baseada no espaço

## 🔍 Acessibilidade

- **Screen Readers**: Labels apropriados para leitores de tela
- **Keyboard Navigation**: Suporte completo ao teclado
- **High Contrast**: Cores com contraste adequado
- **Focus Indicators**: Indicadores visuais de foco

## 🚀 Performance

- **Lazy Loading**: Contexto carregado apenas quando necessário
- **Minimal Re-renders**: Otimizado para evitar re-renderizações desnecessárias
- **CSS Transitions**: Transições suaves sem impacto na performance
- **localStorage**: Persistência eficiente das preferências

## 🐛 Troubleshooting

### Problema: Tema não persiste
**Solução**: Verifique se o localStorage está habilitado no navegador

### Problema: Transições não funcionam
**Solução**: Verifique se as classes CSS de transição estão aplicadas

### Problema: Tema do sistema não detecta
**Solução**: Verifique se `window.matchMedia` está disponível

## 🔮 Futuras Melhorias

- [ ] Temas personalizados pelo usuário
- [ ] Mais opções de transição
- [ ] Temas sazonais automáticos
- [ ] Integração com preferências do sistema
- [ ] Temas de alto contraste

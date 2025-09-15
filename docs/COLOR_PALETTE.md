# Paleta de Cores - Market - Automações Dashboard

## 🎨 Cor Principal

**#2B6198** - Azul corporativo principal

## 🎯 Paleta Harmoniosa

### Cores Base
- **Primary**: `hsl(210, 100%, 30%)` - #2B6198 (cor principal)
- **Hue**: 210° (azul)
- **Saturation**: 100% (saturado)
- **Lightness**: 30% (escuro)

### Paleta Completa

#### 🌞 Tema Claro
```css
--primary: 210 100% 30%;        /* #2B6198 - Azul principal */
--primary-foreground: 0 0% 100%; /* Branco */
--secondary: 210 20% 95%;        /* Azul muito claro */
--accent: 210 30% 90%;           /* Azul claro */
--muted: 210 15% 96%;            /* Azul muito suave */
--foreground: 210 100% 20%;      /* Azul escuro */
--background: 0 0% 100%;         /* Branco */
```

#### 🌙 Tema Escuro
```css
--primary: 210 100% 50%;        /* Azul mais claro */
--primary-foreground: 210 100% 8%; /* Azul muito escuro */
--secondary: 210 30% 15%;        /* Azul escuro */
--accent: 210 40% 20%;           /* Azul médio escuro */
--muted: 210 20% 12%;            /* Azul muito escuro */
--foreground: 210 20% 95%;       /* Azul muito claro */
--background: 210 100% 8%;       /* Azul muito escuro */
```

### Cores de Gráficos
```css
--chart-1: 210 100% 30%;  /* Azul principal */
--chart-2: 180 60% 45%;   /* Azul-verde */
--chart-3: 150 50% 40%;   /* Verde-azulado */
--chart-4: 30 80% 55%;    /* Laranja */
--chart-5: 320 70% 50%;   /* Roxo */
```

### Cores de Status
- **Sucesso**: `hsl(150, 50%, 40%)` - Verde-azulado
- **Falha**: `hsl(0, 70%, 50%)` - Vermelho
- **Em Progresso**: `hsl(30, 80%, 55%)` - Laranja
- **Pendente**: `hsl(210, 20%, 45%)` - Azul acinzentado

## 🎨 Cores Personalizadas do Tailwind

### Brand Colors
```javascript
brand: {
  50: "hsl(210, 100%, 95%)",   // Azul muito claro
  100: "hsl(210, 100%, 90%)",  // Azul claro
  200: "hsl(210, 100%, 80%)",  // Azul médio claro
  300: "hsl(210, 100%, 70%)",  // Azul médio
  400: "hsl(210, 100%, 60%)",  // Azul médio escuro
  500: "hsl(210, 100%, 50%)",  // #2B6198 (cor principal)
  600: "hsl(210, 100%, 40%)",  // Azul escuro
  700: "hsl(210, 100%, 30%)",  // Azul mais escuro
  800: "hsl(210, 100%, 20%)",  // Azul muito escuro
  900: "hsl(210, 100%, 10%)",  // Azul quase preto
  950: "hsl(210, 100%, 5%)",   // Azul preto
}
```

## 🎯 Uso das Cores

### Componentes Principais
- **Botões Primários**: `bg-primary text-primary-foreground`
- **Botões Secundários**: `bg-secondary text-secondary-foreground`
- **Cards**: `bg-card text-card-foreground`
- **Inputs**: `bg-input border-input`

### Status e Feedback
- **Sucesso**: `text-chart-3` (verde-azulado)
- **Erro**: `text-destructive` (vermelho)
- **Aviso**: `text-chart-4` (laranja)
- **Info**: `text-muted-foreground` (azul acinzentado)

### Gráficos
- **Linha Principal**: `stroke="hsl(210, 100%, 30%)"`
- **Sucesso**: `stroke="hsl(150, 50%, 40%)"`
- **Falha**: `stroke="hsl(0, 70%, 50%)"`
- **Progresso**: `stroke="hsl(30, 80%, 55%)"`

## 🔄 Adaptação de Temas

### Tema Claro
- Fundo branco com texto azul escuro
- Cores vibrantes e contrastantes
- Ideal para uso durante o dia

### Tema Escuro
- Fundo azul escuro com texto claro
- Cores mais suaves e menos saturadas
- Ideal para uso noturno

### Tema Sistema
- Segue automaticamente o tema do SO
- Transições suaves entre temas
- Melhor experiência do usuário

## 🎨 Princípios de Design

### Harmonia
- Todas as cores baseadas no matiz 210° (azul)
- Variações de saturação e luminosidade
- Cores complementares para contraste

### Acessibilidade
- Contraste adequado entre texto e fundo
- Cores que funcionam para daltônicos
- Indicadores visuais além da cor

### Consistência
- Uso consistente das cores em toda a aplicação
- Hierarquia visual clara
- Feedback visual apropriado

## 🛠️ Personalização

### Modificar a Cor Principal
Para alterar a cor principal, modifique as variáveis CSS:

```css
:root {
  --primary: 210 100% 30%; /* Altere o matiz (210°) */
}
```

### Adicionar Novas Cores
```css
:root {
  --custom-color: 180 50% 40%; /* Nova cor personalizada */
}
```

### Usar no Tailwind
```html
<div class="bg-custom-color text-white">
  Conteúdo com cor personalizada
</div>
```

## 📱 Responsividade

### Mobile
- Cores mais contrastantes para melhor legibilidade
- Tamanhos de fonte adequados
- Espaçamento otimizado

### Desktop
- Cores mais sutis e elegantes
- Maior variedade de tons
- Detalhes visuais refinados

## 🎯 Resultado Final

A paleta de cores baseada em #2B6198 oferece:

- **✅ Identidade Visual Forte**: Cor principal consistente
- **✅ Harmonia Visual**: Todas as cores trabalham juntas
- **✅ Acessibilidade**: Contraste adequado e legibilidade
- **✅ Flexibilidade**: Funciona em temas claro e escuro
- **✅ Profissionalismo**: Aparência corporativa e moderna

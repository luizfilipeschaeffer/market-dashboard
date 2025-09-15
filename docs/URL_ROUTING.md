# Sistema de Roteamento por URL

## Visão Geral

O sistema agora suporta navegação direta via URL com hash para códigos de erro específicos. Isso permite que usuários acessem diretamente a página FAQ com um erro específico usando URLs como `http://192.168.60.16:3000/faq#API-001`.

## Como Funciona

### 1. Detecção de Hash
- O sistema monitora mudanças no hash da URL (`window.location.hash`)
- Quando um hash é detectado, extrai o código de erro (ex: `#API-001` → `API-001`)
- Valida se o código segue o padrão `[A-Z]+-\d+` (ex: API-001, NET-002, etc.)

### 2. Navegação Automática
- Se um código de erro válido for detectado, o sistema:
  - Navega automaticamente para a página FAQ
  - Define o código de erro inicial
  - Mostra os detalhes do erro específico

### 3. Processamento do Erro
- A FAQPage recebe o código de erro inicial
- Busca o erro correspondente na lista de códigos
- Exibe automaticamente os detalhes do erro
- Limpa o hash da URL após processar

## Exemplos de Uso

### URLs Válidas
```
http://192.168.60.16:3000/faq#API-001
http://192.168.60.16:3000/faq#NET-001
http://192.168.60.16:3000/faq#DATA-002
http://192.168.60.16:3000/faq#SYS-001
```

### URLs Inválidas (ignoradas)
```
http://192.168.60.16:3000/faq#invalid
http://192.168.60.16:3000/faq#123
http://192.168.60.16:3000/faq#API
```

## Implementação Técnica

### App.tsx
- `useEffect` para monitorar mudanças no hash
- Estado `initialErrorCode` para passar o código para FAQPage
- Função `handleErrorProcessed` para limpar o estado

### FAQPage.tsx
- Prop `initialErrorCode` para receber o código inicial
- Prop `onErrorProcessed` para notificar processamento
- `useEffect` para processar o código e mostrar o erro
- Limpeza automática do hash da URL

## Benefícios

1. **Links Diretos**: Usuários podem compartilhar links diretos para erros específicos
2. **Navegação Intuitiva**: URLs amigáveis e fáceis de lembrar
3. **Experiência Melhorada**: Acesso direto às soluções sem navegação manual
4. **Compatibilidade**: Funciona com o sistema de navegação existente

## Limitações

- Apenas códigos de erro válidos são processados
- O hash é limpo após processar (não persiste na URL)
- Requer que a página FAQ esteja carregada para funcionar

## Testes

Para testar a funcionalidade:

1. Acesse `http://192.168.60.16:3000/faq#API-001`
2. Verifique se a página FAQ carrega automaticamente
3. Confirme se o erro API-001 é exibido
4. Teste com outros códigos válidos
5. Teste com códigos inválidos (devem ser ignorados)

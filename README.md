# Portfolio Dinâmico do GitHub

Este repositório contém um portfolio pessoal que busca dados dinamicamente da API do GitHub, apresentando seus repositórios, estatísticas e informações de perfil de forma elegante e profissional.

## ✨ Características

- **Totalmente Dinâmico**: Todos os dados são buscados em tempo real da API do GitHub
- **Tema Escuro Profissional**: Design moderno e responsivo
- **Estatísticas Automatizadas**: Contadores animados para repositórios, stars, forks e seguidores
- **Filtros Inteligentes**: Busca e filtragem por linguagem de programação
- **Detecção Automática de Linguagens**: Visualização das tecnologias mais usadas
- **Links Sociais Dinâmicos**: Extração automática de links do perfil do GitHub
- **Tratamento de Erros**: Sistema robusto com retry automático e mensagens amigáveis
- **Performance Otimizada**: Lazy loading e paginação para grandes quantidades de repositórios

## 🚀 Configuração Rápida

1. **Clone ou fork este repositório**

2. **Configure seu username do GitHub** no arquivo `app.js`:
   ```javascript
   // ===== CONFIGURATION =====
   // Change this to your GitHub username
   this.githubUsername = 'SEU_USERNAME_AQUI';
   ```

3. **Configure links sociais adicionais** (opcional):
   ```javascript
   this.socialLinks = {
       linkedin: 'https://www.linkedin.com/in/seu-perfil/',
       twitter: 'https://twitter.com/seu_usuario',
       website: 'https://seusite.com',
       email: 'seu.email@example.com'
   };
   ```

4. **Personalize as informações** no HTML (opcional):
   - Edite o título da página em `<title>`
   - Ajuste meta tags para SEO
   - Customize textos da seção "Sobre"

5. **Deploy**: 
   - Para GitHub Pages: Ative nas configurações do repositório
   - Para outros serviços: Faça upload dos arquivos

## 🔧 Como Funciona

### Busca de Dados
O sistema faz chamadas paralelas para a API do GitHub:
- `/users/{username}` - Informações do perfil
- `/users/{username}/repos` - Lista de repositórios (até 100)

### Processamento Automático
- **Estatísticas**: Calcula automaticamente total de stars, forks e linguagens
- **Perfil**: Extrai nome, bio, localização e links sociais
- **Projetos**: Processa repositórios com ordenação e filtros

### Tratamento de Erros
- **Retry Logic**: 3 tentativas automáticas com backoff exponencial
- **Rate Limiting**: Tratamento especial para limites da API
- **Fallback**: Sistema gracioso de degradação em caso de falha
- **Feedback Visual**: Mensagens informativas para o usuário

## 🎨 Personalização

### Cores e Tema
Edite as variáveis CSS em `style.css`:
```css
:root {
  --primary-blue: #3b82f6;
  --secondary-purple: #8b5cf6;
  /* ... outras cores */
}
```

### Linguagens de Programação
Adicione novas cores e ícones em `app.js`:
```javascript
const languageColors = {
  'SuaLinguagem': '#cor-hex',
  // ...
};
```

### Seções Customizadas
Modifique diretamente o HTML para:
- Adicionar novas seções
- Alterar textos e descrições
- Incluir projetos em destaque

## 📱 Responsividade

O design é totalmente responsivo com breakpoints para:
- **Desktop**: Layout completo com grid de múltiplas colunas
- **Tablet**: Layout adaptado com menos colunas
- **Mobile**: Layout em coluna única otimizado para toque

## 🔒 Limitações da API

- **Rate Limit**: 60 requisições/hora para usuários não autenticados
- **Repositórios Privados**: Apenas repositórios públicos são exibidos
- **Cache**: Implementar cache local para reduzir chamadas à API (futuro)

## 🚀 Deploy

### GitHub Pages
1. Vá em Settings > Pages no seu repositório
2. Selecione o branch `main` como fonte
3. Seu site estará disponível em `https://seuusername.github.io`

### Outros Serviços
- **Netlify**: Conecte seu repositório GitHub
- **Vercel**: Import do GitHub repository
- **Servidor Próprio**: Upload dos arquivos para pasta web

## 🤝 Contribuição

Contribuições são bem-vindas! Áreas para melhorias:
- Cache local com localStorage
- Autenticação GitHub para rate limits maiores
- Mais opções de personalização
- Otimizações de performance
- Novos temas visuais

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.

---

**Feito com ❤️ e ☕ por Lucas Oliveira**

> 💡 **Dica**: Para melhores resultados, mantenha sua biografia do GitHub atualizada e use tópicos (topics) nos seus repositórios!
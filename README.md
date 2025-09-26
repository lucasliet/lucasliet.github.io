# GitHub Portfolio

Uma aplicação web moderna e interativa para visualizar repositórios do GitHub com interface elegante e funcionalidades avançadas de filtragem.

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4.8-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.13-06B6D4?logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11.3.17-0055FF?logo=framer)

## ✨ Funcionalidades

- **🔍 Busca em tempo real** - Pesquise por nome, descrição ou tópicos dos repositórios
- **🏷️ Filtro por linguagem** - Filtre repositórios por linguagem de programação
- **📊 Ordenação flexível** - Ordene por data de atualização, estrelas ou nome
- **🎨 Duas visualizações** - Alterne entre visualização em cards e lista
- **⚡ Sistema de cache** - Cache inteligente com TTL de 15 minutos
- **📱 Interface responsiva** - Design adaptável para todos os dispositivos
- **🌙 Tema dark** - Interface moderna com gradientes visuais
- **🔄 Atualização manual** - Botão para forçar atualização dos dados
- **🎭 Animações suaves** - Transições fluidas com Framer Motion

## 🛠️ Tecnologias

- **Frontend**: React 18 + Vite
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **API**: GitHub REST API
- **Deploy**: GitHub Pages

## 🚀 Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/lucasliet/lucasliet.github.io.git

# Entre no diretório
cd lucasliet.github.io

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview

# Deploy para GitHub Pages
npm run deploy
```

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes de interface
│   ├── Card.jsx         # Card de repositório
│   ├── Header.jsx       # Cabeçalho da aplicação
│   ├── Toolbar.jsx      # Barra de ferramentas
│   └── ...
├── hooks/               # Hooks customizados
│   └── useGithubRepos.js # Hook para API do GitHub
├── lib/                 # Utilitários e constantes
│   ├── constants.js     # Constantes da aplicação
│   └── utils.js         # Funções utilitárias
└── App.jsx              # Componente principal
```

## 🎯 Funcionalidades Técnicas

### Sistema de Cache
- **TTL**: 15 minutos
- **Storage**: sessionStorage
- **Fallback**: Busca da API em caso de cache inválido/expirado

### Gerenciamento de Estado
- Hook customizado `useGithubRepos` para lógica de API
- Estado local para filtros e preferências de UI
- Abort controller para cancelamento de requisições

### Performance
- Memoização com `useMemo` para cálculos pesados
- Lazy loading de componentes
- Otimização de re-renders

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Executa em modo desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Preview da build local |
| `npm run deploy` | Deploy para GitHub Pages |

## 📊 API do GitHub

A aplicação consome os seguintes endpoints:
- `GET /users/{username}` - Dados do perfil
- `GET /users/{username}/repos` - Lista de repositórios

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📞 Contato

Você pode entrar em contato através das informações disponíveis no meu [Perfil do GitHub](https://github.com/lucasliet).

## 📄 Licença

Este projeto está licenciado sob os termos do arquivo [LICENSE](LICENSE).
# AGENTS.md

Este arquivo fornece diretrizes para agentes de IA que trabalham neste repositório. Seguir estas instruções garante que as contribuições mantenham a consistência, qualidade e sigam os padrões do projeto.

## 1. Visão Geral do Projeto

Este é um portfólio de projetos do GitHub, moderno e interativo. A aplicação busca os repositórios de um usuário específico via API do GitHub e os exibe em uma interface elegante e responsiva, com funcionalidades de busca, filtro e ordenação.

## 2. Stack de Tecnologias

-   **Framework:** React com Vite
-   **Linguagem:** JavaScript (ES6+) com JSX
-   **Estilização:** Tailwind CSS
-   **Animações:** Framer Motion
-   **Ícones:** Lucide React

## 3. Estrutura do Projeto

A organização dos arquivos é crucial. A estrutura principal dentro de `src/` é:

-   `src/components/`: Contém os componentes React da aplicação.
    -   `src/components/ui/`: Subdiretório para componentes de UI genéricos e reutilizáveis (ex: `Badge.jsx`, `Select.jsx`).
    -   Componentes maiores e específicos da aplicação ficam diretamente em `src/components/` (ex: `Header.jsx`, `Card.jsx`).
-   `src/hooks/`: Contém hooks customizados que encapsulam lógica de negócio e estado.
    -   `useGithubRepos.js`: Hook principal que gerencia a busca de dados da API do GitHub, cache, loading e erros.
-   `src/lib/`: Contém funções utilitárias e constantes.
    -   `constants.js`: Constantes globais da aplicação (chaves de cache, TTL, etc.).
    -   `utils.js`: Funções puras e utilitárias (formatação de data, ordenação, etc.).

## 4. Fluxo de Desenvolvimento

Para configurar e rodar o projeto localmente:

1.  **Instalar dependências:**
    ```bash
    npm install
    ```
2.  **Rodar o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

## 5. Convenções de Código e Boas Práticas

-   **Componente por Arquivo:** Cada componente React deve residir em seu próprio arquivo (`.jsx`).
-   **Responsabilidade Única:** Mantenha os componentes pequenos e focados em uma única responsabilidade.
-   **Documentação com JSDoc:** Todos os componentes e funções exportadas devem ter um bloco de comentário JSDoc (`/** ... */`) explicando seu propósito, parâmetros (`@param`) e o que retornam (`@returns`).
-   **Não use comentários `//`:** Para documentação, prefira JSDoc. Para anotações temporárias, remova-as antes de finalizar.
-   **Lógica de Dados em Hooks:** Centralize a lógica de estado complexa, especialmente a que envolve data fetching e efeitos colaterais, em hooks customizados na pasta `src/hooks/`.
-   **Estilização com Tailwind:** Utilize as classes utilitárias do Tailwind CSS diretamente no JSX. Evite escrever CSS customizado em `index.css` sempre que possível.
-   **API e Cache:** Toda a interação com a API do GitHub é gerenciada pelo hook `useGithubRepos`. Este hook também implementa um cache via `sessionStorage` com 15 minutos de duração para otimizar o carregamento. Qualquer nova interação com a API deve ser adicionada a este hook.

/**
 * Portfolio application that dynamically loads GitHub data
 * @class PortfolioApp
 * @description Creates a dynamic portfolio website using GitHub API data
 */
class PortfolioApp {
    /**
     * Initialize the Portfolio Application
     * @constructor
     * @description Sets up configuration, initializes properties, and starts the application
     */
    constructor() {
        /** @type {string} GitHub username to fetch data from */
        this.githubUsername = 'lucasliet';
        
        /** @type {Object} Manual social media links configuration */
        this.socialLinks = {
            linkedin: 'https://www.linkedin.com/in/lucas-souza-de-oliveira/'
        };
        
        /** @type {Object|null} Complete portfolio data from GitHub API */
        this.portfolioData = null;
        
        /** @type {Array} All repositories from GitHub */
        this.allProjects = [];
        
        /** @type {Array} Filtered repositories based on search/filters */
        this.filteredProjects = [];
        
        /** @type {Array} Currently displayed repositories (pagination) */
        this.displayedProjects = [];
        
        /** @type {string} Current language filter selection */
        this.currentLanguageFilter = 'all';
        
        /** @type {string} Current sort option */
        this.currentSort = 'updated';
        
        /** @type {string} Current search query */
        this.currentSearchQuery = '';
        
        /** @type {number} Number of projects to load per page */
        this.projectsPerLoad = 12;
        
        /** @type {number} Current pagination page */
        this.currentPage = 0;
        
        /** @type {string} GitHub API base URL */
        this.githubAPIBase = 'https://api.github.com';
        
        /** @type {boolean} Loading state indicator */
        this.isLoading = false;
        
        /** @type {number} Current retry attempt count */
        this.retryCount = 0;
        
        /** @type {number} Maximum retry attempts for API calls */
        this.maxRetries = 3;

        /** @type {string} Cache key for sessionStorage */
        this.cacheKey = `github_portfolio_${this.githubUsername}`;

        this.init();
    }

    /**
     * Initialize the application
     * @async
     * @method init
     * @description Orchestrates the complete initialization process
     * @returns {Promise<void>}
     * @throws {Error} When GitHub API calls fail or user not found
     */
    async init() {
        
        try {
            this.showLoadingMessage('Conectando com GitHub API...');
            
            await this.loadPortfolioData();
            
            this.showLoadingMessage('Configurando perfil...');
            this.populateUserProfile();

            this.showLoadingMessage('Calculando estatísticas...');
            this.populateStatistics();

            this.showLoadingMessage('Carregando sobre mim...');
            await this.populateAboutSection();

            this.showLoadingMessage('Inicializando componentes...');
            this.initializeComponents();
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Error during initialization:', error);
            
            let errorMessage = 'Erro ao carregar dados do GitHub.';
            if (error.message.includes('Rate limited')) {
                errorMessage = 'Limite de requisições atingido. Aguarde um momento...';
            } else if (error.message.includes('404')) {
                errorMessage = `Usuário '${this.githubUsername}' não encontrado no GitHub.`;
            } else if (error.name === 'AbortError') {
                errorMessage = 'Conexão muito lenta. Tentando novamente...';
            }
            
            this.handleError(errorMessage);
            return;
            
        } finally {
            if (!this.isLoading) {
                setTimeout(() => this.hideLoadingOverlay(), 500);
            }
        }
        
    }

    /**
     * Get data from sessionStorage cache
     * @method getCachedData
     * @returns {Object|null} Cached data or null if not found
     */
    getCachedData() {
        try {
            const cached = sessionStorage.getItem(this.cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.warn('Error reading from cache:', error);
            return null;
        }
    }

    /**
     * Save data to sessionStorage cache
     * @method setCachedData
     * @param {Object} data - Data to cache
     * @returns {void}
     */
    setCachedData(data) {
        try {
            sessionStorage.setItem(this.cacheKey, JSON.stringify(data));
        } catch (error) {
            console.warn('Error saving to cache:', error);
        }
    }

    /**
     * Clear cached data and refresh from API
     * @method refreshData
     * @returns {Promise<void>}
     */
    async refreshData() {
        try {
            sessionStorage.removeItem(this.cacheKey);
            this.showLoadingMessage('Atualizando dados...');
            await this.loadPortfolioData();
            this.populateUserProfile();
            this.populateStatistics();
            await this.populateAboutSection();
            this.initializeComponents();
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }

    /**
     * Fetch README.md content from GitHub profile repository
     * @async
     * @method fetchReadmeContent
     * @returns {Promise<string>} README content or fallback text
     */
    async fetchReadmeContent() {
        try {
            const response = await this.fetchWithRetry(
                `https://raw.githubusercontent.com/${this.githubUsername}/${this.githubUsername}/refs/heads/main/README.md`
            );

            if (response.ok) {
                const content = await response.text();
                return content;
            }
        } catch (error) {
            console.warn('Error fetching README:', error);
        }

        return null;
    }

    /**
     * Parse README markdown and extract about section content
     * @method parseReadmeContent
     * @param {string} markdown - Raw markdown content
     * @returns {Object} Parsed content sections
     */
    parseReadmeContent(markdown) {
        if (!markdown) return this.getDefaultAboutContent();

        const lines = markdown.split('\n');
        const content = { greeting: '', intro: '', sections: [] };
        const skipSections = ['estatísticas do github', 'github stats', 'stats', 'contato', 'contact', 'redes sociais', 'social media'];

        let currentSection = null;
        let collectingContent = false;

        for (let line of lines) {
            line = line.trim();

            if (!line || line.match(/^(!\[|http|<|```)/)) continue;

            if (line.match(/^[-=]{3,}$/)) {
                currentSection?.content.push('<hr>');
                continue;
            }

            if (line.match(/^#{1,3}\s+/)) {
                if (currentSection) content.sections.push(currentSection);

                const title = line.replace(/^#{1,3}\s+/, '').trim();

                if (skipSections.some(skip => title.toLowerCase().includes(skip))) {
                    currentSection = null;
                    collectingContent = false;
                    continue;
                }

                currentSection = { title, content: [] };
                collectingContent = true;
            } else if ((line.startsWith('-') || line.startsWith('*')) && currentSection) {
                currentSection.content.push(line.replace(/^[-*]\s+/, ''));
            } else if (line.length > 0 && collectingContent && !line.startsWith('#')) {
                if (currentSection && line.length > 10) {
                    currentSection.content.push(line);
                }
            }
        }

        if (currentSection) content.sections.push(currentSection);

        if (!content.greeting && !content.intro && content.sections.length === 0) {
            return this.getDefaultAboutContent();
        }

        return content;
    }

    /**
     * Get default about content as fallback
     * @method getDefaultAboutContent
     * @returns {Object} Default content structure
     */
    getDefaultAboutContent() {
        return {
            greeting: 'Olá! 👋',
            intro: 'Bem-vindo ao meu perfil do GitHub! Aqui você encontrará os projetos que refletem minha paixão por tecnologia, inovação e desenvolvimento contínuo.',
            sections: [
                {
                    title: 'Sobre mim',
                    content: ['Sou um entusiasta de tecnologia focado em aprender e compartilhar conhecimento. Meu objetivo é transformar ideias em aplicações funcionais e eficientes.']
                },
                {
                    title: 'O que você vai encontrar aqui',
                    content: [
                        'Repositórios com soluções inovadoras',
                        'Projetos open-source que demonstram experiência técnica',
                        'Exemplos práticos de boas práticas de programação',
                        'Iniciativas colaborativas e experimentos criativos'
                    ]
                },
                {
                    title: 'Aprendizado contínuo',
                    content: ['Estou sempre explorando novas tecnologias, frameworks e metodologias para me manter atualizado e entregar o melhor resultado possível.']
                }
            ]
        };
    }

    /**
     * Load portfolio data from GitHub API with cache support
     * @async
     * @method loadPortfolioData
     * @description Fetches user profile and repositories from GitHub API in parallel, with localStorage cache
     * @returns {Promise<void>}
     * @throws {Error} When API requests fail or return non-OK status
     */
    async loadPortfolioData() {
        this.isLoading = true;

        const cachedData = this.getCachedData();
        if (cachedData) {
            this.portfolioData = cachedData;
            this.allProjects = this.portfolioData.repositories;
            this.filteredProjects = [...this.allProjects];
            this.isLoading = false;
            return;
        }


        try {
            const [userResponse, reposResponse] = await Promise.all([
                this.fetchWithRetry(`${this.githubAPIBase}/users/${this.githubUsername}`),
                this.fetchWithRetry(`${this.githubAPIBase}/users/${this.githubUsername}/repos?sort=updated&per_page=100`)
            ]);

            if (!userResponse.ok || !reposResponse.ok) {
                throw new Error(`GitHub API error: ${userResponse.status} / ${reposResponse.status}`);
            }

            const userData = await userResponse.json();
            const reposData = await reposResponse.json();

            this.portfolioData = this.processGitHubData(userData, reposData);
            this.allProjects = this.portfolioData.repositories;
            this.filteredProjects = [...this.allProjects];

            this.setCachedData(this.portfolioData);

            
        } catch (error) {
            console.error('Error loading from GitHub API:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Fetch URL with retry logic and timeout
     * @async
     * @method fetchWithRetry
     * @param {string} url - The URL to fetch
     * @param {Object} [options={}] - Fetch options
     * @returns {Promise<Response>} The fetch response
     * @throws {Error} After max retries exceeded
     * @description Implements exponential backoff retry logic with 10s timeout
     */
    async fetchWithRetry(url, options = {}) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    return response;
                } else if (response.status === 403) {
                    console.warn('Rate limited by GitHub API, waiting before retry...');
                    await this.sleep(5000 * attempt);
                    lastError = new Error(`Rate limited: ${response.status}`);
                } else {
                    lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                lastError = error;
                console.warn(`Attempt ${attempt} failed:`, error.message);
                
                if (attempt < this.maxRetries) {
                    await this.sleep(1000 * Math.pow(2, attempt));
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Sleep for specified duration
     * @method sleep
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>} Promise that resolves after the delay
     * @description Utility function for implementing delays in retry logic
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Process raw GitHub API data into portfolio structure
     * @method processGitHubData
     * @param {Object} userData - Raw user data from GitHub API
     * @param {Array} reposData - Raw repositories data from GitHub API
     * @returns {Object} Processed portfolio data with user info, stats, and repositories
     * @description Transforms GitHub API responses into structured portfolio data
     */
    processGitHubData(userData, reposData) {
        const totalStars = reposData.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        const totalForks = reposData.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
        const languages = {};
        
        reposData.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });

        const processedRepos = reposData.map(repo => ({
            id: repo.id,
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            html_url: repo.html_url,
            updated_at: repo.updated_at,
            created_at: repo.created_at,
            homepage: repo.homepage,
            topics: repo.topics || [],
            private: repo.private
        })).filter(repo => !repo.private);
        
        return {
            user: {
                name: userData.name || userData.login,
                username: userData.login,
                title: this.extractTitle(userData.bio),
                bio: userData.bio || 'Desenvolvedor apaixonado por tecnologia',
                location: userData.location || 'Brasil',
                followers: userData.followers || 0,
                following: userData.following || 0,
                public_repos: userData.public_repos || 0,
                avatar_url: userData.avatar_url,
                html_url: userData.html_url,
                blog: userData.blog,
                twitter_username: userData.twitter_username,
                company: userData.company,
                email: userData.email
            },
            statistics: {
                total_repos: processedRepos.length,
                total_stars: totalStars,
                total_forks: totalForks,
                languages: languages
            },
            repositories: processedRepos
        };
    }

    /**
     * Extract professional title from GitHub bio
     * @method extractTitle
     * @param {string|null} bio - User's GitHub bio
     * @returns {string} Extracted title or default 'Desenvolvedor'
     * @description Uses regex patterns to identify professional titles in bio text
     */
    extractTitle(bio) {
        if (!bio) return 'Desenvolvedor';
        
        const titlePatterns = [
            /desenvolvedor/i,
            /developer/i,
            /engineer/i,
            /engenheiro/i,
            /programador/i,
            /fullstack/i,
            /frontend/i,
            /backend/i
        ];
        
        for (const pattern of titlePatterns) {
            if (pattern.test(bio)) {
                const words = bio.split(' ');
                const titleWords = words.filter(word => 
                    /^(full|front|back|software|senior|junior|pleno|desenvolvedor|developer|engineer|engenheiro)$/i.test(word)
                );
                if (titleWords.length > 0) {
                    return titleWords.join(' ');
                }
            }
        }
        
        return 'Desenvolvedor';
    }

    /**
     * Load fallback data when API fails
     * @method loadFallbackData
     * @description Provides minimal portfolio structure when GitHub API is unavailable
     * @returns {void}
     */
    loadFallbackData() {
        
        this.portfolioData = {
            user: {
                name: 'Lucas Oliveira',
                username: 'lucasliet',
                title: 'FullStack Developer',
                bio: '🎯 Transformando ideias em aplicações funcionais',
                location: 'Brasil',
                followers: 0,
                following: 0,
                public_repos: 0,
                avatar_url: 'https://avatars.githubusercontent.com/u/49222261?v=4',
                html_url: 'https://github.com/lucasliet'
            },
            statistics: {
                total_repos: 0,
                total_stars: 0,
                total_forks: 0,
                languages: {}
            },
            repositories: []
        };
        
        this.allProjects = [];
        this.filteredProjects = [];
        this.populateUserProfile();
        this.populateStatistics();
        this.initializeComponents();
    }

    /**
     * Populate user profile information in the UI
     * @method populateUserProfile
     * @description Updates DOM elements with user data from GitHub API
     * @returns {void}
     */
    populateUserProfile() {
        if (!this.portfolioData) return;
        
        const user = this.portfolioData.user;
        
        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar && user.avatar_url) {
            profileAvatar.src = user.avatar_url;
            profileAvatar.alt = user.name;
            profileAvatar.onload = () => {
                profileAvatar.classList.add('loaded');
            };
        }
        
        const heroName = document.getElementById('heroName');
        if (heroName) {
            heroName.textContent = user.name || user.username;
        }
        
        const heroBio = document.getElementById('heroBio');
        if (heroBio) {
            heroBio.textContent = user.bio || '🎯 Desenvolvedor apaixonado por tecnologia';
        }
        
        const heroLocation = document.getElementById('heroLocation');
        if (heroLocation && user.location) {
            const locationSpan = heroLocation.querySelector('span');
            if (locationSpan) {
                locationSpan.textContent = user.location;
            }
        }
        
        
        this.populateHeroActions();
        
        this.populateSocialLinks();
    }

    /**
     * Populate hero action buttons
     * @method populateHeroActions
     * @description Creates GitHub and LinkedIn links for hero section
     * @returns {void}
     */
    populateHeroActions() {
        const heroActions = document.getElementById('heroActions');
        const user = this.portfolioData.user;

        if (!heroActions) return;

        let actionsHTML = '';

        if (user.html_url) {
            actionsHTML += `
                <a href="${user.html_url}" target="_blank" class="btn btn--primary">
                    <i class="fab fa-github"></i>
                    <span>Ver GitHub</span>
                </a>
            `;
        }

        const linkedinUrl = this.socialLinks.linkedin || this.extractLinkedInFromBio(user.bio);
        if (linkedinUrl) {
            actionsHTML += `
                <a href="${linkedinUrl}" target="_blank" class="btn btn--outline">
                    <i class="fab fa-linkedin"></i>
                    <span>LinkedIn</span>
                </a>
            `;
        }

        heroActions.innerHTML = actionsHTML;
    }

    /**
     * Populate social media links in contact section
     * @method populateSocialLinks
     * @description Creates social media links from GitHub profile and manual config
     * @returns {void}
     */
    populateSocialLinks() {
        const socialLinks = document.getElementById('socialLinks');
        const user = this.portfolioData.user;

        if (!socialLinks) return;

        let linksHTML = '';

        if (user.html_url) {
            linksHTML += `
                <a href="${user.html_url}" target="_blank" class="social-link dark-social">
                    <i class="fab fa-github"></i>
                    <span>GitHub</span>
                </a>
            `;
        }

        const linkedinUrl = this.socialLinks.linkedin || this.extractLinkedInFromBio(user.bio);
        if (linkedinUrl) {
            linksHTML += `
                <a href="${linkedinUrl}" target="_blank" class="social-link dark-social">
                    <i class="fab fa-linkedin"></i>
                    <span>LinkedIn</span>
                </a>
            `;
        }

        const email = user.email || this.socialLinks.email;
        if (email) {
            linksHTML += `
                <a href="mailto:${email}" class="social-link dark-social">
                    <i class="fas fa-envelope"></i>
                    <span>Email</span>
                </a>
            `;
        }

        socialLinks.innerHTML = linksHTML;
    }

    /**
     * Populate about section with content from README.md
     * @async
     * @method populateAboutSection
     * @returns {Promise<void>}
     */
    async populateAboutSection() {
        try {
            const readmeContent = await this.fetchReadmeContent();
            const parsedContent = this.parseReadmeContent(readmeContent);

            const aboutGreeting = document.getElementById('aboutGreeting');
            const aboutText = document.getElementById('aboutText');
            const aboutTextContainer = document.querySelector('.about-text-container');

            if (aboutGreeting) {
                aboutGreeting.textContent = parsedContent.greeting;
            }

            if (aboutText) {
                aboutText.textContent = parsedContent.intro;
            }

            if (aboutTextContainer) {
                const existingBlocks = aboutTextContainer.querySelectorAll('.about-section-block');
                existingBlocks.forEach(block => block.remove());

                parsedContent.sections.forEach((section) => {
                    const blockElement = document.createElement('div');
                    blockElement.className = 'about-section-block';

                    const title = document.createElement('h4');
                    title.textContent = section.title;
                    blockElement.appendChild(title);

                    // Check if content has multiple distinct items (suggesting a list)
                    const nonHrContent = section.content.filter(item => item !== '<hr>' && item.length > 0);
                    const shouldBeList = nonHrContent.length > 1 && nonHrContent.every(item => item.length < 150 && !item.includes('.'));

                    if (shouldBeList) {
                        // Render as list with HR support
                        const container = document.createElement('div');
                        let currentList = null;

                        section.content.forEach(item => {
                            if (item === '<hr>') {
                                const hr = document.createElement('hr');
                                container.appendChild(hr);
                                currentList = null; // Break list continuity
                            } else if (item.length > 0) {
                                if (!currentList) {
                                    currentList = document.createElement('ul');
                                    currentList.className = 'about-list';
                                    container.appendChild(currentList);
                                }
                                const listItem = document.createElement('li');
                                listItem.textContent = item;
                                currentList.appendChild(listItem);
                            }
                        });

                        blockElement.appendChild(container);
                    } else {
                        // Render as paragraphs with HR support
                        section.content.forEach(item => {
                            if (item === '<hr>') {
                                const hr = document.createElement('hr');
                                blockElement.appendChild(hr);
                            } else if (item.length > 0) {
                                const paragraph = document.createElement('p');
                                paragraph.textContent = item;
                                blockElement.appendChild(paragraph);
                            }
                        });
                    }

                    aboutTextContainer.appendChild(blockElement);
                });
            }

        } catch (error) {
            console.warn('Error populating about section:', error);
        }
    }

    /**
     * Extract LinkedIn URL from GitHub bio
     * @method extractLinkedInFromBio
     * @param {string|null} bio - User's GitHub bio text
     * @returns {string|null} LinkedIn URL if found, null otherwise
     * @description Searches for LinkedIn profile URLs in user bio using regex
     */
    extractLinkedInFromBio(bio) {
        if (!bio) return null;
        
        const linkedinMatch = bio.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/);
        if (linkedinMatch) {
            return linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
        }
        
        return null;
    }

    populateStatistics() {
        if (!this.portfolioData) return;
        
        const stats = this.portfolioData.statistics;
        
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 4) {
            statNumbers[0].setAttribute('data-target', stats.total_repos);
            statNumbers[1].setAttribute('data-target', stats.total_stars);
            statNumbers[2].setAttribute('data-target', stats.total_forks);
            statNumbers[3].setAttribute('data-target', this.portfolioData.user.followers);
        }
        
        this.updateProjectCount();
    }

    /**
     * Handle application errors with auto-retry mechanism
     * @method handleError
     * @param {string} message - Error message to display to user
     * @description Shows styled error message in loading overlay and automatically retries initialization after 3 seconds
     * @returns {void}
     */
    handleError(message) {
        console.error(message);
        
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            const loadingContent = loadingOverlay.querySelector('.loading-content');
            if (loadingContent) {
                loadingContent.innerHTML = `
                    <div class="loading-spinner" style="border-top-color: #f56565;"></div>
                    <p style="color: #f56565;">${message}</p>
                    <p style="font-size: 14px; margin-top: 10px; opacity: 0.8;">
                        Tentando novamente em alguns segundos...
                    </p>
                `;
            }
        }
        
        setTimeout(() => {
            this.init();
        }, 3000);
    }

    /**
     * Update loading overlay message
     * @method showLoadingMessage
     * @param {string} message - Message to display in loading overlay
     * @description Updates the loading overlay with current status message
     * @returns {void}
     */
    showLoadingMessage(message) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            const loadingContent = loadingOverlay.querySelector('.loading-content p');
            if (loadingContent) {
                loadingContent.textContent = message;
            }
        }
    }

    /**
     * Update project count display
     * @method updateProjectCount
     * @description Updates the project counter in the UI with current filtered count
     * @returns {void}
     */
    updateProjectCount() {
        const projectCountEl = document.getElementById('projectCount');
        if (projectCountEl) {
            projectCountEl.textContent = `(${this.filteredProjects.length})`;
        }
    }

    /**
     * Initialize all UI components
     * @method initializeComponents
     * @description Sets up typing effect, animations, language rendering, and filters
     * @returns {void}
     */
    initializeComponents() {
        this.initTypingEffect();
        this.initCounterAnimations();
        this.renderLanguages();
        this.populateLanguageFilter();
        this.loadInitialProjects();
    }

    /**
     * Populate language filter dropdown
     * @method populateLanguageFilter
     * @description Creates language filter options from repository languages
     * @returns {void}
     */
    populateLanguageFilter() {
        const languageSelect = document.getElementById('languageSelect');
        if (!languageSelect) return;

        languageSelect.innerHTML = '<option value="all">Todas as linguagens</option>';

        const sortedLanguages = Object.entries(this.portfolioData.statistics.languages)
            .sort(([,a], [,b]) => b - a);

        sortedLanguages.forEach(([language, count]) => {
            const option = document.createElement('option');
            option.value = language;
            option.textContent = `${language} (${count})`;
            languageSelect.appendChild(option);
        });

    }

    /**
     * Set up all event listeners
     * @method setupEventListeners
     * @description Attaches event handlers for search, filters, pagination, and navigation
     * @returns {void}
     */
    setupEventListeners() {
        
        const searchInput = document.getElementById('searchInput');
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearchQuery = e.target.value.trim();
                this.toggleClearButton();
                this.applyFilters();
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.currentLanguageFilter = e.target.value;
                this.applyFilters();
            });
        }

        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.currentPage = 0;
                this.displayedProjects = [];
                this.loadMoreProjects();
            });
        }

        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProjects();
            });
        }

        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                const icon = refreshBtn.querySelector('i');
                icon.classList.add('fa-spin');
                refreshBtn.disabled = true;

                try {
                    await this.refreshData();
                } finally {
                    icon.classList.remove('fa-spin');
                    refreshBtn.disabled = false;
                }
            });
        }

        document.addEventListener('click', (e) => {
            const projectCard = e.target.closest('.project-card');
            if (projectCard && projectCard.dataset.url) {
                window.open(projectCard.dataset.url, '_blank');
            }
        });

        this.setupScrollIndicator();
    }

    /**
     * Toggle clear search button visibility based on input content
     * @method toggleClearButton
     * @description Shows clear button when search query exists, hides when empty
     * @returns {void}
     */
    toggleClearButton() {
        const clearBtn = document.getElementById('clearSearchBtn');
        if (clearBtn) {
            clearBtn.style.display = this.currentSearchQuery ? 'block' : 'none';
        }
    }

    /**
     * Clear search input and reset filters with focus return
     * @method clearSearch
     * @description Empties search input, resets currentSearchQuery, toggles clear button, reapplies filters, and returns focus to search input
     * @returns {void}
     */
    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            this.currentSearchQuery = '';
            this.toggleClearButton();
            this.applyFilters();
            searchInput.focus();
        }
    }

    /**
     * Setup scroll indicator functionality
     * @method setupScrollIndicator
     * @description Configures scroll indicator visibility and smooth scrolling
     * @returns {void}
     */
    setupScrollIndicator() {
        const scrollIndicator = document.getElementById('scrollIndicator');

        if (!scrollIndicator) return;

        scrollIndicator.addEventListener('click', () => {
            const statsSection = document.getElementById('stats');
            if (statsSection) {
                statsSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });

        window.addEventListener('scroll', this.handleScrollIndicatorVisibility.bind(this));

        this.handleScrollIndicatorVisibility();
    }

    /**
     * Handle scroll indicator visibility based on scroll position
     * @method handleScrollIndicatorVisibility
     * @description Shows indicator when at top, hides when scrolled down
     * @returns {void}
     */
    handleScrollIndicatorVisibility() {
        const scrollIndicator = document.getElementById('scrollIndicator');

        if (!scrollIndicator) return;

        const scrollThreshold = 100;
        const isNearTop = window.scrollY < scrollThreshold;

        if (isNearTop) {
            scrollIndicator.classList.remove('hidden');
        } else {
            scrollIndicator.classList.add('hidden');
        }
    }

    /**
     * Apply current search and language filters
     * @method applyFilters
     * @description Filters projects based on search query and language selection
     * @returns {void}
     */
    applyFilters() {
        this.filteredProjects = this.allProjects.filter(project => {
            const searchLower = this.currentSearchQuery.toLowerCase();
            const matchesSearch = !this.currentSearchQuery ||
                project.name.toLowerCase().includes(searchLower) ||
                (project.description && project.description.toLowerCase().includes(searchLower)) ||
                (project.topics && project.topics.some(topic => topic.toLowerCase().includes(searchLower)));

            const matchesLanguage = this.currentLanguageFilter === 'all' ||
                (project.language && project.language === this.currentLanguageFilter);

            return matchesSearch && matchesLanguage;
        });

        this.currentPage = 0;
        this.displayedProjects = [];
        this.loadMoreProjects();
        this.updateProjectCount();
        
    }

    /**
     * Load initial set of projects
     * @method loadInitialProjects
     * @description Initializes pagination and loads first batch of projects
     * @returns {void}
     */
    loadInitialProjects() {
        this.currentPage = 0;
        this.displayedProjects = [];
        this.loadMoreProjects();
    }

    /**
     * Load more projects for pagination
     * @method loadMoreProjects
     * @description Loads next batch of projects and updates UI
     * @returns {void}
     */
    loadMoreProjects() {
        const sortedProjects = this.getSortedProjects(this.filteredProjects);
        const startIndex = this.currentPage * this.projectsPerLoad;
        const endIndex = startIndex + this.projectsPerLoad;
        const newProjects = sortedProjects.slice(startIndex, endIndex);
        
        this.displayedProjects.push(...newProjects);
        this.currentPage++;
        
        this.renderProjects();
        this.updateLoadMoreButton();
        
    }

    /**
     * Update load more button state and remaining count display
     * @method updateLoadMoreButton
     * @description Shows/hides load more button and updates remaining project count in button text
     * @returns {void}
     */
    updateLoadMoreButton() {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        const hasMoreProjects = this.displayedProjects.length < this.filteredProjects.length;
        
        if (loadMoreContainer) {
            if (hasMoreProjects) {
                loadMoreContainer.classList.remove('hidden');
                const loadMoreBtn = document.getElementById('loadMoreBtn');
                if (loadMoreBtn) {
                    const remaining = this.filteredProjects.length - this.displayedProjects.length;
                    loadMoreBtn.querySelector('span').textContent = `Carregar Mais (${remaining} restantes)`;
                }
            } else {
                loadMoreContainer.classList.add('hidden');
            }
        }
    }

    /**
     * Render projects in the grid
     * @method renderProjects
     * @description Updates the projects grid with currently displayed projects
     * @returns {void}
     */
    renderProjects() {
        const projectsContainer = document.getElementById('projectsGrid');
        if (!projectsContainer) return;

        projectsContainer.innerHTML = this.displayedProjects.map(project => 
            this.createProjectCard(project)
        ).join('');
    }

    /**
     * Create HTML for a project card
     * @method createProjectCard
     * @param {Object} project - Project data object
     * @returns {string} HTML string for the project card
     * @description Generates HTML markup for individual project cards with stats and metadata
     */
    createProjectCard(project) {
        const languageColor = this.getLanguageColor(project.language);
        const updatedDate = project.updated_at ? new Date(project.updated_at).toLocaleDateString('pt-BR') : 'N/A';
        const projectName = project.name || 'Unnamed Project';
        const homepageUrl = project.homepage?.startsWith('http') ? project.homepage : `https://${project.homepage}`;

        const renderTopics = () => {
            if (!project.topics?.length) return '';
            const visibleTopics = project.topics.slice(0, 5).map(topic => `<span class="topic-tag">${topic}</span>`).join('');
            const extraCount = project.topics.length > 5 ? `<span class="topic-tag more-topics">+${project.topics.length - 5}</span>` : '';
            return `<div class="project-topics">${visibleTopics}${extraCount}</div>`;
        };

        return `
            <div class="project-card" data-url="${project.html_url}" data-language="${(project.language || '').toLowerCase()}">
                <div class="project-header">
                    <h3 class="project-name">${projectName}</h3>
                    <div class="project-stats">
                        <span><i class="fas fa-star"></i> ${project.stars || 0}</span>
                        <span><i class="fas fa-code-branch"></i> ${project.forks || 0}</span>
                    </div>
                </div>
                <p class="project-description">${project.description || 'No description available'}</p>
                ${renderTopics()}
                <div class="project-meta">
                    <div class="project-info">
                        ${project.language ? `<div class="language-badge"><span class="language-dot" style="background-color: ${languageColor}"></span>${project.language}</div>` : ''}
                        <span class="project-date">Atualizado em ${updatedDate}</span>
                    </div>
                    ${project.homepage ? `<div class="project-actions"><a href="${homepageUrl}" target="_blank" class="homepage-btn" onclick="event.stopPropagation()"><i class="fas fa-external-link-alt"></i><span>Website</span></a></div>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Get sorted projects based on current sort option
     * @method getSortedProjects
     * @param {Array} projects - Array of project objects to sort
     * @returns {Array} Sorted array of projects
     * @description Sorts projects by stars, name, or update date
     */
    getSortedProjects(projects) {
        const sorted = [...projects];
        
        switch (this.currentSort) {
            case 'stars':
                return sorted.sort((a, b) => (b.stars || 0) - (a.stars || 0));
            case 'name':
                return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            case 'updated':
            default:
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.updated_at || 0);
                    const dateB = new Date(b.updated_at || 0);
                    return dateB - dateA;
                });
        }
    }

    /**
     * Get color code for programming language
     * @method getLanguageColor
     * @param {string|null} language - Programming language name
     * @returns {string} Hex color code for the language
     * @description Maps programming languages to their conventional display colors
     */
    getLanguageColor(language) {
        const colors = {
            'typescript': '#3178c6', 'javascript': '#f7df1e', 'html': '#e34f26',
            'css': '#1572b6', 'java': '#ed8b00', 'dart': '#0175c2',
            'shell': '#89e051', 'ruby': '#cc342d', 'lua': '#2c2d72',
            'c++': '#00599c', 'python': '#3776ab', 'go': '#00add8',
            'php': '#777bb4', 'markdown': '#083fa1', 'vue': '#4fc08d',
            'dockerfile': '#2496ed'
        };
        return colors[language?.toLowerCase()] || '#6b7280';
    }

    /**
     * Initialize dynamic typing effect with user-specific titles
     * @method initTypingEffect
     * @description Creates animated typing effect that cycles through professional titles, including user's GitHub bio title if available
     * @returns {void}
     */
    initTypingEffect() {
        const typingText = document.getElementById('typingText');
        if (!typingText) return;

        const user = this.portfolioData?.user;
        const baseTitles = ['Desenvolvedor', 'Software Engineer', 'Tech Enthusiast'];
        
        const texts = [];
        if (user?.title && user.title !== 'Desenvolvedor') {
            texts.push(user.title);
        }
        texts.push(...baseTitles);
        
        const uniqueTexts = [...new Set(texts)];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const typeEffect = () => {
            const currentText = uniqueTexts[textIndex];
            
            if (isDeleting) {
                typingText.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingText.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            let timeout = isDeleting ? 50 : 80;

            if (!isDeleting && charIndex === currentText.length) {
                timeout = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % uniqueTexts.length;
                timeout = 500;
            }

            setTimeout(typeEffect, timeout);
        };

        if (user?.title) {
            typingText.textContent = user.title;
            setTimeout(typeEffect, 2000);
        } else {
            setTimeout(typeEffect, 1000);
        }
    }

    /**
     * Initialize counter animations with intersection observer
     * @method initCounterAnimations
     * @description Sets up intersection observer to trigger counter animations when stats section becomes visible
     * @returns {void}
     */
    initCounterAnimations() {
        const observerOptions = { threshold: 0.3 };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    /**
     * Animate statistics counters with staggered timing
     * @method animateCounters
     * @description Creates incremental counting animation for each statistic with 200ms delay between counters
     * @returns {void}
     */
    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach((counter, index) => {
            const target = parseInt(counter.dataset.target || counter.textContent);
            if (isNaN(target)) return;
            
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            setTimeout(() => {
                counter.textContent = '0';
                updateCounter();
            }, index * 200);
        });
    }

    /**
     * Render programming languages grid
     * @method renderLanguages
     * @description Creates language cards with icons, names, and repository counts
     * @returns {void}
     */
    renderLanguages() {
        const languagesGrid = document.getElementById('languagesGrid');
        if (!languagesGrid || !this.portfolioData?.statistics?.languages) return;

        const languages = this.portfolioData.statistics.languages;
        
        const languageColors = {
            'TypeScript': '#3178c6', 'JavaScript': '#f7df1e', 'HTML': '#e34f26',
            'CSS': '#1572b6', 'Java': '#ed8b00', 'Dart': '#0175c2',
            'Shell': '#89e051', 'Ruby': '#cc342d', 'Lua': '#2c2d72',
            'Python': '#3776ab', 'Vue': '#4fc08d', 'Dockerfile': '#2496ed',
            'Go': '#00add8', 'Rust': '#dea584', 'C++': '#00599c',
            'C': '#a8b9cc', 'PHP': '#777bb4', 'Swift': '#fa7343',
            'Kotlin': '#7f52ff', 'C#': '#239120', 'Scala': '#dc322f',
            'R': '#198ce7', 'MATLAB': '#e16737', 'Perl': '#0298c3',
            'Haskell': '#5e5086', 'Erlang': '#b83998', 'Elixir': '#6e4a7e',
            'Clojure': '#db5855', 'F#': '#b845fc', 'OCaml': '#3be133',
            'Nim': '#ffc200', 'Crystal': '#000100', 'Zig': '#ec915c',
            'VHDL': '#adb2cb', 'Verilog': '#b2b7f8', 'Assembly': '#6e4c13',
            'Makefile': '#427819', 'CMake': '#da3434', 'Nix': '#7e7eff',
            'Jsonnet': '#0064bd', 'HCL': '#844fba', 'Starlark': '#76d275',
            'Markdown': '#083fa1', 'YAML': '#cb171e', 'JSON': '#292929',
            'XML': '#0060ac', 'TOML': '#9c4221', 'INI': '#d1dbe0'
        };

        if (Object.keys(languages).length === 0) {
            languagesGrid.innerHTML = `
                <div class="language-item">
                    <div class="language-icon" style="background-color: #6b7280">
                        <i class="fas fa-code"></i>
                    </div>
                    <span class="language-name">Carregando...</span>
                    <span class="language-count">-</span>
                </div>
            `;
            return;
        }

        languagesGrid.innerHTML = Object.entries(languages)
            .sort(([,a], [,b]) => b - a)
            .map(([language, count]) => `
                <div class="language-item">
                    <div class="language-icon" style="background-color: ${languageColors[language] || '#6b7280'}">
                        ${this.getLanguageIcon(language)}
                    </div>
                    <span class="language-name">${language}</span>
                    <span class="language-count">${count} repos</span>
                </div>
            `).join('');
    }

    /**
     * Get icon for programming language
     * @method getLanguageIcon
     * @param {string} language - Programming language name
     * @returns {string} Font Awesome icon HTML for the language
     * @description Maps programming languages to their representative icons
     */
    getLanguageIcon(language) {
        const icons = {
            'TypeScript': '<i class="fab fa-js-square"></i>',
            'JavaScript': '<i class="fab fa-js-square"></i>',
            'HTML': '<i class="fab fa-html5"></i>',
            'CSS': '<i class="fab fa-css3-alt"></i>',
            'Java': '<i class="fab fa-java"></i>',
            'Python': '<i class="fab fa-python"></i>',
            'Shell': '<i class="fas fa-terminal"></i>',
            'Ruby': '<i class="fas fa-gem"></i>',
            'Lua': '<i class="fas fa-code"></i>',
            'Vue': '<i class="fab fa-vuejs"></i>',
            'Dockerfile': '<i class="fab fa-docker"></i>',
            'Go': '<i class="fas fa-bolt"></i>',
            'Rust': '<i class="fas fa-cog"></i>',
            'C++': '<i class="fas fa-microchip"></i>',
            'C': '<i class="fas fa-microchip"></i>',
            'PHP': '<i class="fab fa-php"></i>',
            'Swift': '<i class="fab fa-swift"></i>',
            'Kotlin': '<i class="fas fa-mobile-alt"></i>',
            'C#': '<i class="fas fa-code"></i>',
            'Markdown': '<i class="fab fa-markdown"></i>',
            'YAML': '<i class="fas fa-file-code"></i>',
            'JSON': '<i class="fas fa-brackets-curly"></i>'
        };
        return icons[language] || '<i class="fas fa-code"></i>';
    }

    /**
     * Hide loading overlay with animation
     * @method hideLoadingOverlay
     * @description Smoothly fades out and hides the loading overlay
     * @returns {void}
     */
    hideLoadingOverlay() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
            }, 300);
        }
    }
}

/**
 * Portfolio App initialization and DOM event handlers
 * @description Main application entry point and global event listeners
 */

document.addEventListener('DOMContentLoaded', () => {
    try {
        new PortfolioApp();
    } catch (error) {
        console.error('Error initializing app:', error);
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }
});

/**
 * Failsafe timeout to hide loading overlay
 * @description Ensures loading overlay is hidden after maximum wait time
 */
setTimeout(() => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
        loadingOverlay.classList.add('hidden');
    }
}, 3000);

/**
 * Set application theme
 * @description Configure the application to use dark theme
 */
document.documentElement.setAttribute('data-color-scheme', 'dark');

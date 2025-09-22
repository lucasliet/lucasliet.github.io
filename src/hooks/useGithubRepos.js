import { useState, useRef, useCallback } from 'react';
import { CACHE_KEY, CACHE_TTL } from '../lib/constants';

/**
 * @typedef {'object'} GithubUser
 * @property {string} name
 * @property {string} bio
 */

/**
 * @typedef {'object'} GithubRepo
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string} html_url
 * @property {number} stargazers_count
 * @property {number} forks_count
 * @property {string} language
 * @property {string[]} topics
 * @property {string} updated_at
 */

/**
 * Hook customizado para buscar e gerenciar dados do GitHub (perfil e repositórios).
 * @param {string} username - O nome de usuário do GitHub.
 * @returns {{user: GithubUser | null, repos: GithubRepo[], loading: boolean, error: string, fetchRepos: (force?: boolean) => void}}
 */
export function useGithubRepos(username) {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  /**
   * Busca os dados, utilizando o cache se disponível e válido.
   * @param {boolean} [force=false] - Se true, ignora o cache e busca novos dados da API.
   */
  const fetchRepos = useCallback((force = false) => {
    if (!force) {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { timestamp, data } = JSON.parse(cached);
          // Validate cache structure before using it
          if (data && data.user && data.repos && Date.now() - timestamp < CACHE_TTL) {
            setUser(data.user);
            setRepos(data.repos);
            setLoading(false);
            console.log("Loaded user and repos from sessionStorage cache.");
            return;
          } else {
            // Invalid or expired cache, remove it
            sessionStorage.removeItem(CACHE_KEY);
          }
        } catch (e) {
          console.error("Failed to parse cache", e);
          sessionStorage.removeItem(CACHE_KEY);
        }
      }
    }

    setLoading(true);
    setError("");
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    const userUrl = `https://api.github.com/users/${username}`;
    const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&direction=desc`;

    Promise.all([
      fetch(userUrl, { signal: controller.signal }),
      fetch(reposUrl, { signal: controller.signal })
    ])
      .then(async ([userRes, reposRes]) => {
        if (!userRes.ok) throw new Error(`GitHub API (user) ${userRes.status}`);
        if (!reposRes.ok) throw new Error(`GitHub API (repos) ${reposRes.status}`);
        const userData = await userRes.json();
        const reposData = await reposRes.json();
        return { userData, reposData };
      })
      .then(({ userData, reposData }) => {
        const repoData = Array.isArray(reposData) ? reposData : [];
        setUser(userData);
        setRepos(repoData);
        try {
          const cachePayload = { timestamp: Date.now(), data: { user: userData, repos: repoData } };
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
          console.log("Fetched data from API and cached in sessionStorage.");
        } catch (e) {
          console.error("Failed to write to cache", e);
        }
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setError(e.message || "Erro ao buscar dados");
        }
      })
      .finally(() => setLoading(false));
  }, [username]);

  return { user, repos, loading, error, fetchRepos };
}
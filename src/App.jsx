import React, { useEffect, useMemo, useState } from "react";
import { useGithubRepos } from "./hooks/useGithubRepos";
import { createSorter, runSelfTests } from "./lib/utils";

import Header from "./components/Header";
import Toolbar from "./components/Toolbar";
import RepoGrid from "./components/RepoGrid";
import RepoList from "./components/RepoList";
import SkeletonGrid from "./components/SkeletonGrid";
import EmptyState from "./components/EmptyState";
import Footer from "./components/Footer";

/**
 * Componente principal da aplicação.
 * Orquestra o estado da UI (filtros, ordenação) e renderiza os componentes principais.
 * A lógica de busca de dados foi abstraída para o hook `useGithubRepos`.
 */
export default function App() {
  const username = "lucasliet";
  const { user, repos, loading, error, fetchRepos } = useGithubRepos(username);

  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("All");
  const [sort, setSort] = useState("updated");
  const [view, setView] = useState("cards");

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  useEffect(() => {
    runSelfTests();
  }, []);

  const languages = useMemo(() => {
    const set = new Set(repos.map((r) => r.language).filter(Boolean));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [repos]);

  const filteredRepos = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = repos.filter((r) => {
      const byLang = language === "All" || r.language === language;
      if (!byLang) return false;
      if (!q) return true;
      const hay = `${r.name} ${r.description || ""} ${(r.topics || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
    const sorter = createSorter(sort);
    return [...arr].sort(sorter);
  }, [repos, query, language, sort]);

  return (
    <div className="relative min-h-screen text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 select-none">
        <div className="absolute -top-24 right-0 h-64 w-64 rotate-12 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -left-24 top-10 h-64 w-64 -rotate-12 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <Header user={user} onRefresh={() => fetchRepos(true)} loading={loading} />
      <main className="mx-auto max-w-7xl px-4 pb-20">
        <Toolbar
          query={query}
          onQuery={setQuery}
          language={language}
          onLanguage={setLanguage}
          languages={languages}
          sort={sort}
          onSort={setSort}
          view={view}
          onView={setView}
          total={filteredRepos.length}
        />

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            Ocorreu um erro ao carregar os repositórios: <span className="font-semibold">{error}</span>
          </div>
        )}

        {loading ? (
          <SkeletonGrid />
        ) : filteredRepos.length === 0 ? (
          <EmptyState onReset={() => { setQuery(""); setLanguage("All"); setSort("updated"); }} />
        ) : view === "cards" ? (
          <RepoGrid repos={filteredRepos} />
        ) : (
          <RepoList repos={filteredRepos} />
        )}
      </main>
      <Footer />
    </div>
  );
}
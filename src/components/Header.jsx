import React from 'react';
import { motion } from 'framer-motion';
import { Github, RefreshCcw } from 'lucide-react';

/**
 * O cabeçalho da aplicação.
 * @param {{user: import('../hooks/useGithubRepos').GithubUser | null, onRefresh: () => void, loading: boolean}} props
 */
export default function Header({ user, onRefresh, loading }) {
  return (
    <div className="relative border-b border-white/5 backdrop-blur">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-6"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
            <Github className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Projetos de <span className="text-white">{user?.name || "..."}</span></h1>
            <p className="text-xs text-slate-400">{user?.bio || "..."}</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 active:scale-95 disabled:opacity-50 h-10 whitespace-nowrap"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </button>
      </motion.div>
    </div>
  );
}
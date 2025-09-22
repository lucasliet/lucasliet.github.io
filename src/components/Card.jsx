import React from 'react';
import { motion } from 'framer-motion';
import { Github, Star, GitFork, ExternalLink, CalendarClock, Code2, Globe } from 'lucide-react';
import { formatDate } from '../lib/utils';
import Metric from './ui/Metric';
import Badge from './ui/Badge';

/**
 * Card para exibir as informações de um único repositório.
 * @param {{repo: import('../hooks/useGithubRepos').GithubRepo}} props
 */
export default function Card({ repo }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -3 }}
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-2xl shadow-black/40 ring-1 ring-white/5"
    >
      <div className="flex-grow">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <Github className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <a href={repo.html_url} target="_blank" rel="noreferrer" className="focus:outline-none">
              <h3 className="truncate text-sm font-semibold tracking-tight text-white/90 group-hover:text-white group-focus:text-white">
                {repo.name}
              </h3>
            </a>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {formatDate(repo.updated_at)}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1"><Code2 className="h-3.5 w-3.5" /> {repo.language || "-"}</span>
            </div>
          </div>
        </div>
        {repo.description ? (
          <p className="line-clamp-2 text-sm text-slate-300/90">{repo.description}</p>
        ) : (
          <p className="text-sm text-slate-500">Sem descrição</p>
        )}
      </div>

      {repo.homepage && (
        <div className="mt-4 pt-4">
          <a
            href={repo.homepage}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex w-full items-center justify-center rounded-lg bg-sky-500/10 py-2 text-center text-sm font-semibold text-sky-300 ring-1 ring-inset ring-sky-500/20 transition hover:bg-sky-500/20"
          >
            <Globe className="mr-2 h-4 w-4" />
            Homepage
          </a>
        </div>
      )}

      <div className="mt-4 flex items-start justify-between gap-4 border-t border-white/10 pt-4">
        <div className="flex flex-shrink-0 items-center gap-3">
          <Metric icon={<Star className="h-4 w-4" />} value={repo.stargazers_count} />
          <Metric icon={<GitFork className="h-4 w-4" />} value={repo.forks_count} />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {(repo.topics || []).slice(0, 3).map((t) => (
            <Badge key={t}>#{t}</Badge>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/0 to-sky-500/10"
      />
    </motion.li>
  );
}

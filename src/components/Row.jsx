import React from 'react';
import { motion } from 'framer-motion';
import { Star, GitFork, ExternalLink, Globe } from 'lucide-react';
import Badge from './ui/Badge';
import Metric from './ui/Metric';

/**
 * Linha para exibir as informações de um repositório em uma lista.
 * @param {{repo: import('../hooks/useGithubRepos').GithubRepo}} props
 */
export default function Row({ repo }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group grid grid-cols-12 items-center gap-3 bg-white/[0.02] px-4 py-4 hover:bg-white/[0.04]"
    >
      <div className="col-span-4 flex min-w-0 items-center gap-3">
        <span className="truncate font-medium tracking-tight">{repo.name}</span>
        {repo.private ? (
          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">privado</span>
        ) : null}
      </div>
      <div className="col-span-2 hidden items-center gap-2 sm:flex">
        <Badge>{repo.language || "-"}</Badge>
      </div>
      <div className="col-span-2 flex items-center gap-3">
        <Metric icon={<Star className="h-4 w-4" />} value={repo.stargazers_count} />
        <Metric icon={<GitFork className="h-4 w-4" />} value={repo.forks_count} />
      </div>
      <div className="col-span-4 flex items-center justify-end gap-4">
        {repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-300 hover:underline"
          >
            <Globe className="h-4 w-4" />
            Homepage
          </a>
        )}
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          GitHub
        </a>
      </div>
    </motion.li>
  );
}

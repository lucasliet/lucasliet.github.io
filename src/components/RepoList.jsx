import React from 'react';
import Row from './Row';

/**
 * Lista que exibe os repositórios em formato de linha.
 * @param {{repos: import('../hooks/useGithubRepos').GithubRepo[]}} props
 */
export default function RepoList({ repos }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <ul className="divide-y divide-white/5">
        {repos.map((r) => (
          <Row key={r.id} repo={r} />
        ))}
      </ul>
    </div>
  );
}

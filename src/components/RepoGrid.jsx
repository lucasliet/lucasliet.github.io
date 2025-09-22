import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

/**
 * Grid que exibe os repositórios em formato de cartão.
 * @param {{repos: import('../hooks/useGithubRepos').GithubRepo[]}} props
 */
export default function RepoGrid({ repos }) {
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {repos.map((r) => (
        <Card key={r.id} repo={r} />
      ))}
    </motion.ul>
  );
}

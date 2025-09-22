import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

/**
 * O rodapé da aplicação.
 */
export default function Footer() {
  const username = "lucasliet";
  return (
    <footer className="mx-auto mt-12 max-w-7xl px-4 pb-10 text-xs text-slate-500">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2"><Github className="h-4 w-4" /> Dados em tempo real da API pública do GitHub</span>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-slate-300 hover:underline"
        >
          Ver perfil <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </footer>
  );
}

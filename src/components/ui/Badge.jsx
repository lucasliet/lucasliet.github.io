import React from 'react';

/**
 * Componente de Badge para exibir informações curtas, como tópicos ou linguagem.
 * @param {{children: React.ReactNode}} props
 */
export default function Badge({ children }) {
  return (
    <span className="break-words rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
      {children}
    </span>
  );
}

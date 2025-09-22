import React from 'react';

/**
 * Componente para exibir uma métrica com ícone e valor (e.g., estrelas, forks).
 * @param {{icon: React.ReactNode, value: number | string}} props
 */
export default function Metric({ icon, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
      {icon}
      <span className="tabular-nums">{value}</span>
    </span>
  );
}

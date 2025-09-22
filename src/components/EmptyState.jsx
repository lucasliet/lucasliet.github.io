import React from 'react';

/**
 * Componente para exibir quando nenhum resultado é encontrado.
 * @param {{onReset: () => void}} props
 */
export default function EmptyState({ onReset }) {
  return (
    <div className="mt-10 grid place-items-center rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
      <p className="mb-4 text-sm text-slate-300">Nenhum repositório encontrado com os filtros atuais.</p>
      <button onClick={onReset} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
        Limpar filtros
      </button>
    </div>
  );
}

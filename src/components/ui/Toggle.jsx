import React from 'react';

/**
 * Componente de Toggle para alternar entre duas visualizações (e.g., Cards/Lista).
 * @param {{value: string, onChange: (value: string) => void}} props
 */
export default function Toggle({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
      <button
        onClick={() => onChange("cards")}
        className={`rounded-lg px-3 py-1.5 text-xs ${value === "cards" ? "bg-white/10 text-white" : "text-slate-300"}`}>
        Cards
      </button>
      <button
        onClick={() => onChange("list")}
        className={`rounded-lg px-3 py-1.5 text-xs ${value === "list" ? "bg-white/10 text-white" : "text-slate-300"}`}>
        Lista
      </button>
    </div>
  );
}

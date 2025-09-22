import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * Componente de Select (Dropdown) customizado e animado.
 * @param {{value: string, onChange: (value: string) => void, label: React.ReactNode, children: React.ReactNode}} props
 */
export default function Select({ value, onChange, label, children }) {
  const [open, setOpen] = useState(false);
  const selected = React.Children.toArray(children).find((c) => c.props.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-200 hover:bg-white/10 whitespace-nowrap"
      >
        {label}
        <span className="text-slate-400 truncate max-w-[140px]">{selected?.props?.label || value}</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-20 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 p-1 shadow-2xl backdrop-blur"
          >
            {React.Children.map(children, (child) => (
              <li>
                <button
                  onClick={() => {
                    onChange(child.props.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-white/5 ${value === child.props.value ? "text-white" : "text-slate-300"}`}>
                  <span>{child.props.label || child.props.value}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * Componente Option para ser usado dentro do Select. Renderiza dados invisíveis para o Select ler.
 * @param {{value: string, label?: string}} props
 */
export function Option({ value, label }) {
  return <span data-value={value} data-label={label} className="hidden" />;
}

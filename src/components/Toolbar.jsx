import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Code2, X } from 'lucide-react';
import Select, { Option } from './ui/Select';
import Toggle from './ui/Toggle';

/**
 * Barra de ferramentas com filtros de busca, linguagem, ordenação e visualização.
 * @param {object} props
 * @param {string} props.query
 * @param {(q: string) => void} props.onQuery
 * @param {string} props.language
 * @param {(l: string) => void} props.onLanguage
 * @param {string[]} props.languages
 * @param {string} props.sort
 * @param {(s: string) => void} props.onSort
 * @param {string} props.view
 * @param {(v: string) => void} props.onView
 * @param {number} props.total
 */
export default function Toolbar({ query, onQuery, language, onLanguage, languages, sort, onSort, view, onView, total }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-10 -mx-4 mb-6 px-4 py-4 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Buscar por nome, descrição ou tópico..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-10 text-sm outline-none ring-white/10 placeholder:text-slate-500 focus:ring"
            />
            {query && (
              <button onClick={() => onQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <Select value={language} onChange={onLanguage} label={<span className="inline-flex items-center gap-2"><Filter className="h-4 w-4" /> Linguagem</span>}>
              {languages.map((l) => (
                <Option key={l} value={l} />
              ))}
            </Select>
          </div>
          <div className="relative">
            <Select value={sort} onChange={onSort} label={<span className="inline-flex items-center gap-2"><Code2 className="h-4 w-4" /> Ordenar</span>}>
              <Option value="updated" label="Atualizados recentemente" />
              <Option value="stars" label="Mais estrelas" />
              <Option value="name" label="Nome (A→Z)" />
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">{total} repositório(s)</span>
          <Toggle value={view} onChange={onView} />
        </div>
      </div>
    </motion.div>
  );
}

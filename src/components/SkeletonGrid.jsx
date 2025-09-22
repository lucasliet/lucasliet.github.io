import React from 'react';

/**
 * Grid de esqueletos de UI para indicar o carregamento.
 */
export default function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/5" />
      ))}
    </div>
  );
}

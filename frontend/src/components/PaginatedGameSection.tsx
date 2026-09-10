import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Game } from '../lib/types/types';
import { GameCard } from './GameCard';

interface PaginatedGameSectionProps {
  title: string;
  subtitle?: string;
  games: Game[];
  loading?: boolean;
  categoryRoute?: string;
}

export const PaginatedGameSection: React.FC<PaginatedGameSectionProps> = ({
  title,
  subtitle,
  games,
  loading = false,
  categoryRoute,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className="py-6 border-b border-[#222] last:border-none">
        <div className="h-6 w-48 bg-[#181818] animate-pulse rounded mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-44 aspect-[3/4] shrink-0 bg-[#181818] border border-[#2a2a2a] animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (games.length === 0) return null;

  return (
    <section className="py-6 border-b border-[#222] last:border-none">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-neutral-100 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {title}
            </h2>
            {categoryRoute && (
              <Link
                to={categoryRoute}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
              >
                Ver mais →
              </Link>
            )}
          </div>
          {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* Setas de Rolagem */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#181818] border border-[#333] text-neutral-300 hover:bg-[#252525] hover:text-amber-400 transition-colors"
            title="Anterior"
          >
            ‹
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#181818] border border-[#333] text-neutral-300 hover:bg-[#252525] hover:text-amber-400 transition-colors"
            title="Próximo"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 no-scrollbar"
      >
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
};
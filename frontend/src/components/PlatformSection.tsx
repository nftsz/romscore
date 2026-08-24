import React, { useEffect, useState } from 'react';
import { Game } from '../lib/types/types';
import { getGamesByPlatform } from '../services/api';
import { GameCard } from './GameCard';

interface PlatformSectionProps {
  platform: string;
  title: string;
  onSelectGame?: (game: Game) => void;
}

export const PlatformSection: React.FC<PlatformSectionProps> = ({ platform, title, onSelectGame }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getGamesByPlatform(platform, 8)
      .then((data) => {
        if (isMounted) setGames(data);
      })
      .catch((err) => console.error(`Erro ao carregar jogos de ${platform}:`, err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [platform]);

  if (loading) {
    return (
      <div className="py-6">
        <h2 className="mb-4 text-xl font-bold text-slate-200">{title}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-slate-800/50" />
          ))}
        </div>
      </div>
    );
  }

  if (games.length === 0) return null;

  return (
    <section className="py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          {title}
        </h2>
        <span className="text-xs text-slate-400 font-mono">Mais jogados</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {games.map((game) => (
          <GameCard key={game.id} game={game} onSelect={onSelectGame} />
        ))}
      </div>
    </section>
  );
};
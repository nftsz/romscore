import React from 'react';
import { Game } from '../lib/types/types';

interface GameCardProps {
  game: Game;
  onSelect?: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
  return (
    <div
      onClick={() => onSelect && onSelect(game)}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-slate-900/80 border border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
    >
      {/* Container de Imagem / BoxArt */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
        {game.cover_url ? (
          <img
            src={game.cover_url}
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-600">
            Sem Imagem
          </div>
        )}
        
        {/* Badge de Plataforma */}
        <span className="absolute top-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-xs font-semibold text-slate-200 backdrop-blur-md border border-white/10">
          {game.platform}
        </span>

        {/* Badge de Mods/Hacks Disponíveis */}
        {game.total_hacks > 0 && (
          <span className="absolute top-2 right-2 rounded-md bg-emerald-500/90 px-2 py-0.5 text-xs font-bold text-white shadow-md">
            {game.total_hacks} {game.total_hacks === 1 ? 'Hack' : 'Hacks'}
          </span>
        )}
      </div>

      {/* Detalhes do Jogo */}
      <div className="flex flex-1 flex-col justify-between p-3">
        <h3 className="line-clamp-1 font-medium text-slate-100 group-hover:text-indigo-400 transition-colors">
          {game.title}
        </h3>

        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          {/* Jogadores reais do RetroAchievements */}
          <span className="flex items-center gap-1 font-mono">
            👥 {game.total_players > 0 ? game.total_players.toLocaleString() : '—'}
          </span>

          {game.released_date && (
            <span>{game.released_date.substring(0, 4)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
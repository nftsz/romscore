import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../lib/types/types';

interface GameCardProps {
  game: Game;
  onSelect?: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onSelect) {
      onSelect(game);
    } else {
      navigate(`/game/${game.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer select-none"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
        {game.cover_url ? (
          <img
            src={game.cover_url}
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-600">
            Sem Imagem
          </div>
        )}

        {game.total_hacks > 0 && (
          <span className="absolute top-2 right-2 z-10 rounded-md bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-sm">
            {game.total_hacks} {game.total_hacks === 1 ? 'Hack' : 'Hacks'}
          </span>
        )}

        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-400">{game.platform}</span>
              {game.released_date && (
                <span className="text-slate-400">{game.released_date.substring(0, 4)}</span>
              )}
            </div>

            {game.developer && (
              <p className="line-clamp-1 text-slate-400">
                <strong className="text-slate-200">Dev:</strong> {game.developer}
              </p>
            )}

            {game.genre && (
              <p className="line-clamp-1 text-slate-400">
                <strong className="text-slate-200">Gênero:</strong> {game.genre}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-12 items-center border-t border-slate-800/80 bg-slate-900 px-3">
        <h3
          className="line-clamp-2 text-xs font-semibold leading-tight text-slate-100 group-hover:text-indigo-400 transition-colors"
          title={game.title}
        >
          {game.title}
        </h3>
      </div>
    </div>
  );
};
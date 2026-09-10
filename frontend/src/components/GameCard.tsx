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
      className="group relative flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#181818] transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer select-none"
    >
      {/* BoxArt com Proporção Estrita 3:4 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#101010]">
        {game.cover_url ? (
          <img
            src={game.cover_url}
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-600">
            Sem Imagem
          </div>
        )}

        {/* Badge Dourada estilo Troféu / Conquista RA */}
        {game.total_hacks > 0 && (
          <span className="absolute top-2 right-2 z-10 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-black text-neutral-950 shadow-md">
            {game.total_hacks} {game.total_hacks === 1 ? 'HACK' : 'HACKS'}
          </span>
        )}

        {/* Overlay no Hover */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#121212] via-[#121212]/85 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="space-y-1 text-[11px] text-neutral-300">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400">{game.platform}</span>
              {game.released_date && (
                <span className="text-neutral-400 font-mono text-[10px]">
                  {game.released_date.substring(0, 4)}
                </span>
              )}
            </div>

            {game.developer && (
              <p className="line-clamp-1 text-neutral-400">
                <strong className="text-neutral-200">Dev:</strong> {game.developer}
              </p>
            )}

            {game.genre && (
              <p className="line-clamp-1 text-neutral-400">
                <strong className="text-neutral-200">Gênero:</strong> {game.genre}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Título com Altura Fixa */}
      <div className="flex h-12 items-center border-t border-[#2a2a2a] bg-[#181818] px-3">
        <h3
          className="line-clamp-2 text-xs font-bold leading-tight text-neutral-200 group-hover:text-amber-400 transition-colors"
          title={game.title}
        >
          {game.title}
        </h3>
      </div>
    </div>
  );
};
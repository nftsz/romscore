import React, { useState, useEffect } from 'react';
import { Game } from '../lib/types/types';
import { api } from '../services/api';
import { PlatformSection } from '../components/PlatformSection';
import { GameCard } from '../components/GameCard';

const CONSOLES = [
  { id: 'SNES', title: 'Super Nintendo' },
  { id: 'GBA', title: 'Game Boy Advance' },
  { id: 'PS1', title: 'PlayStation 1' },
  { id: 'PS2', title: 'PlayStation 2' },
  { id: 'N64', title: 'Nintendo 64' },
  { id: 'Mega Drive', title: 'Mega Drive / Genesis' },
];

export const HomePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Busca textual debounce
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const response = await api.get<Game[]>('/games/', {
          params: { search: search.trim() },
        });
        setSearchResults(response.data);
      } catch (err) {
        console.error('Erro ao pesquisar jogos:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Hero Section & Search Header */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-20 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-wider text-indigo-400 font-mono">
              RIDE ANALYTICS
            </h1>
            <p className="text-xs text-slate-400">
              Catálogo de clássicos e ROM hacks da comunidade
            </p>
          </div>

          {/* Campo de Busca */}
          <div className="w-full md:w-96 relative">
            <input
              type="text"
              placeholder="Buscar jogo (ex: Zelda, Mario, Sonic)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-6">
        {/* Visualização de Resultados da Busca */}
        {search.trim() ? (
          <section className="py-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
              Resultados para "{search}" ({searchResults.length})
            </h2>

            {isSearching ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-slate-900 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {searchResults.map((game) => (
                  <GameCard key={game.id} game={game} onSelect={setSelectedGame} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                Nenhum jogo encontrado para o termo pesquisado.
              </div>
            )}
          </section>
        ) : (
          /* Seções por Plataforma (Catálogo Canônico) */
          <div>
            {CONSOLES.map((console) => (
              <PlatformSection
                key={console.id}
                platform={console.id}
                title={console.title}
                onSelectGame={setSelectedGame}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal Rápido de Detalhes / Hacks do Jogo */}
      {selectedGame && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedGame(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedGame(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row gap-6">
              {selectedGame.cover_url && (
                <img
                  src={selectedGame.cover_url}
                  alt={selectedGame.title}
                  className="w-36 h-48 object-cover rounded-lg border border-slate-800 shadow-md mx-auto sm:mx-0"
                />
              )}

              <div className="flex-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  {selectedGame.platform}
                </span>
                <h2 className="text-xl font-bold mt-1 text-slate-100">{selectedGame.title}</h2>

                <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                  <span>👥 {selectedGame.total_players.toLocaleString()} jogadores</span>
                  {selectedGame.released_date && <span>📅 {selectedGame.released_date}</span>}
                  {selectedGame.developer && <span>🛠️ {selectedGame.developer}</span>}
                </div>

                <div className="mt-6 border-t border-slate-800 pt-4">
                  <h3 className="text-sm font-semibold text-slate-300">
                    ROM Hacks & Traduções ({selectedGame.hacks?.length || 0})
                  </h3>
                  {selectedGame.hacks && selectedGame.hacks.length > 0 ? (
                    <ul className="mt-2 divide-y divide-slate-800/60 max-h-40 overflow-y-auto">
                      {selectedGame.hacks.map((hack) => (
                        <li key={hack.id} className="py-2 text-xs flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-indigo-300">{hack.title}</span>
                            <span className="text-slate-500 ml-2">por {hack.author_name}</span>
                          </div>
                          <span className="text-amber-400 font-mono">★ {hack.avg_score.toFixed(1)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      Nenhuma modificação cadastrada para este jogo ainda.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
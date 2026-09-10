import React, { useState, useEffect } from 'react';
import { Game } from '../lib/types/types';
import { api } from '../services/api';
import { Header } from '../components/Header';
import { PaginatedGameSection } from '../components/PaginatedGameSection';
import { GameCard } from '../components/GameCard';

const CONSOLES = [
  { id: 'GBA', title: 'Game Boy Advance' },
  { id: 'SNES', title: 'Super Nintendo' },
  { id: 'NES', title: 'NES (Nintendinho)' },
  { id: 'N64', title: 'Nintendo 64' },
  { id: 'Mega Drive', title: 'Mega Drive / Genesis' },
  { id: 'PS1', title: 'PlayStation 1' },
  { id: 'PS2', title: 'PlayStation 2' },
  { id: 'GBC', title: 'Game Boy Color' },
  { id: 'NDS', title: 'Nintendo DS' },
  { id: 'GameCube', title: 'Nintendo GameCube' },
  { id: 'Game Boy', title: 'Game Boy' },
  { id: 'Wii', title: 'Nintendo Wii' },
  { id: 'PSP', title: 'PlayStation Portable' },
  { id: 'Sega Saturn', title: 'Sega Saturn' },
  { id: 'Master System', title: 'Sega Master System' },
];

export const HomePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [recentHackedGames, setRecentHackedGames] = useState<Game[]>([]);
  const [consoleGames, setConsoleGames] = useState<{ [key: string]: Game[] }>({});
  const [loading, setLoading] = useState(true);

  // Carrega seções iniciais e carrosséis de consoles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [popRes, recentRes] = await Promise.all([
          api.get('/games/', { params: { filter: 'popular', limit: 12 } }),
          api.get('/games/', { params: { filter: 'recent_hacks', limit: 12 } }),
        ]);

        const popData = Array.isArray(popRes.data) ? popRes.data : popRes.data?.results || [];
        const recentData = Array.isArray(recentRes.data) ? recentRes.data : recentRes.data?.results || [];

        setPopularGames(popData);
        setRecentHackedGames(recentData);

        const consoleData: { [key: string]: Game[] } = {};
        await Promise.all(
          CONSOLES.map(async (console) => {
            const res = await api.get('/games/', {
              params: { platform: console.id, filter: 'popular', limit: 12 },
            });
            consoleData[console.id] = Array.isArray(res.data) ? res.data : res.data?.results || [];
          })
        );
        setConsoleGames(consoleData);
      } catch (err) {
        console.error('Erro ao carregar catálogo da Home:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Busca instantânea com debounce
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const response = await api.get('/games/', {
          params: { search: search.trim() },
        });

        const items = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        setSearchResults(items);
      } catch (err) {
        console.error('Erro na pesquisa:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 pb-16">
      <Header search={search} onSearchChange={setSearch} />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {search.trim() ? (
          <section className="py-4">
            <h2 className="text-xl font-bold mb-4 text-neutral-200 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              Resultados para "{search}" ({searchResults.length})
            </h2>

            {isSearching ? (
              <div className="flex flex-wrap gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-44 aspect-[3/4] shrink-0 bg-[#181818] border border-[#2a2a2a] animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {searchResults.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-neutral-500">
                Nenhum título encontrado para o termo pesquisado.
              </div>
            )}
          </section>
        ) : (
          <div className="space-y-4">
            <PaginatedGameSection
              title="🔥 Jogos mais Populares"
              subtitle="Títulos clássicos em destaque na comunidade"
              categoryRoute="/category?filter=popular"
              games={popularGames}
              loading={loading}
            />

            {recentHackedGames.length > 0 && (
              <PaginatedGameSection
                title="⚡ Hacks & Traduções Recentes"
                subtitle="Jogos que acabaram de receber novos patches e modificações"
                categoryRoute="/category?filter=recent_hacks"
                games={recentHackedGames}
                loading={loading}
              />
            )}

            {CONSOLES.map((c) => {
              const gamesList = consoleGames[c.id] || [];
              if (!loading && gamesList.length === 0) return null;

              return (
                <PaginatedGameSection
                  key={c.id}
                  title={c.title}
                  subtitle={`Destaques de ${c.title}`}
                  categoryRoute={`/category?platform=${encodeURIComponent(c.id)}`}
                  games={gamesList}
                  loading={loading}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Game } from '../lib/types/types';
import { api } from '../services/api';
import { Header } from '../components/Header';
import { PaginatedGameSection } from '../components/PaginatedGameSection';
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

  // Estados das seções analíticas
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [recentHackedGames, setRecentHackedGames] = useState<Game[]>([]);
  const [consoleGames, setConsoleGames] = useState<{ [key: string]: Game[] }>({});
  const [loading, setLoading] = useState(true);

  // Carga das listas da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [popRes, recentRes] = await Promise.all([
          api.get<Game[]>('/games/', { params: { filter: 'popular', limit: 12 } }),
          api.get<Game[]>('/games/', { params: { filter: 'recent_hacks', limit: 12 } }),
        ]);

        setPopularGames(popRes.data);
        setRecentHackedGames(recentRes.data);

        // Busca paralela para cada plataforma
        const consoleData: { [key: string]: Game[] } = {};
        await Promise.all(
          CONSOLES.map(async (console) => {
            const res = await api.get<Game[]>('/games/', {
              params: { platform: console.id, filter: 'popular', limit: 12 },
            });
            consoleData[console.id] = res.data;
          })
        );
        setConsoleGames(consoleData);
      } catch (err) {
        console.error('Erro ao carregar catálogo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        console.error('Erro na pesquisa:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Header com ROMScore & Busca */}
      <Header search={search} onSearchChange={setSearch} />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {search.trim() ? (
          /* Resultados da Busca Textual */
          <section className="py-4">
            <h2 className="text-xl font-bold mb-4 text-slate-200 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
              Resultados para "{search}" ({searchResults.length})
            </h2>

            {isSearching ? (
              <div className="flex flex-wrap gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-44 aspect-[3/4] shrink-0 bg-slate-900 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {searchResults.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500">
                Nenhum título encontrado para o termo pesquisado.
              </div>
            )}
          </section>
        ) : (
          /* Listagens por Carrossel com Ver Mais */
          <div className="space-y-2">
            {/* Mais Populares */}
            <PaginatedGameSection
              title="🔥 Mais Populares"
              subtitle="Títulos clássicos em destaque na comunidade"
              categoryRoute="/category?filter=popular"
              games={popularGames}
              loading={loading}
            />

            {/* Hacks Recentes (só renderiza se houver títulos com patches) */}
            {recentHackedGames.length > 0 && (
              <PaginatedGameSection
                title="⚡ Hacks & Traduções Recentes"
                subtitle="Jogos que acabaram de receber novos patches e modificações"
                categoryRoute="/category?filter=recent_hacks"
                games={recentHackedGames}
                loading={loading}
              />
            )}

            {/* Carrosséis de Plataforma */}
            {CONSOLES.map((c) => (
              <PaginatedGameSection
                key={c.id}
                title={c.title}
                subtitle={`Destaques de ${c.title}`}
                categoryRoute={`/category?platform=${encodeURIComponent(c.id)}`}
                games={consoleGames[c.id] || []}
                loading={loading}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
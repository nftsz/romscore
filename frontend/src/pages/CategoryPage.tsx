import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Game, PaginatedResponse } from '../lib/types/types';
import { api } from '../services/api';
import { Header } from '../components/Header';
import { GameCard } from '../components/GameCard';


export const CategoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const filter = searchParams.get('filter') || '';
  const platform = searchParams.get('platform') || '';
  const titleParam = searchParams.get('title') || '';

  const [games, setGames] = useState<Game[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [search, setSearch] = useState('');

  const getPageTitle = () => {
    if (titleParam) return titleParam;
    if (filter === 'popular') return '🔥 Mais Populares';
    if (filter === 'recent_hacks') return '⚡ ROM Hacks & Patches Recentes';
    if (platform) return `🎮 Catálogo ${platform}`;
    return 'Catálogo Completo';
  };

  // Reset e busca da página 1 ao trocar filtros
  useEffect(() => {
    const fetchFirstPage = async () => {
      try {
        setLoading(true);
        setPage(1);

        const params: Record<string, string | number> = { page: 1, limit: 12, };
        if (filter) params.filter = filter;
        if (platform) params.platform = platform;

        const response = await api.get<PaginatedResponse>('/games/', { params });

        setGames(response.data.results);
        setTotalCount(response.data.count);
        setHasMore(!!response.data.next);
      } catch (err) {
        console.error('Erro ao buscar jogos:', err);
        setGames([]);
        setTotalCount(0);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchFirstPage();
  }, [filter, platform]);

  // Carregar Próxima Página (Sob Demanda)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      const params: Record<string, string | number> = { page: nextPage, limit: 12, };
      if (filter) params.filter = filter;
      if (platform) params.platform = platform;

      const response = await api.get<PaginatedResponse>('/games/', { params });

      setGames((prev) => [...prev, ...response.data.results]);
      setPage(nextPage);
      setHasMore(!!response.data.next);
    } catch (err) {
      console.error('Erro ao carregar mais jogos:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 pb-16">
      <Header search={search} onSearchChange={(val) => val && navigate(`/?search=${val}`)} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#181818] border border-[#333] text-neutral-400 hover:text-amber-400 hover:bg-[#252525] transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-black text-neutral-100">{getPageTitle()}</h1>
            <p className="text-xs text-neutral-500">
              Exibindo {games.length} de {totalCount} títulos cadastrados
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-wrap gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-44 aspect-[3/4] shrink-0 bg-[#181818] border border-[#2a2a2a] animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : games.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-4">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            {/* Botão Sob Demanda */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="rounded-xl border border-[#333] bg-[#181818] px-8 py-3 text-xs font-black text-amber-400 shadow-xl hover:bg-[#222] hover:border-amber-500/50 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                      Carregando mais clássicos...
                    </>
                  ) : (
                    `Carregar Mais Jogos (+${totalCount - games.length} restantes)`
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center text-neutral-500">
            Nenhum jogo encontrado para esta categoria.
          </div>
        )}
      </main>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Game } from '../lib/types/types';
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Título da página baseado nos filtros
  const getPageTitle = () => {
    if (titleParam) return titleParam;
    if (filter === 'popular') return '🔥 Mais Populares';
    if (filter === 'most_hacked') return '⚡ Mais ROM Hacks & Modificações';
    if (platform) return `🎮 Catálogo ${platform}`;
    return 'Catálogo Completo';
  };

  useEffect(() => {
    const fetchCategoryGames = async () => {
      try {
        setLoading(true);
        const params: Record<string, string | number> = { limit: 50 };
        if (filter) params.filter = filter;
        if (platform) params.platform = platform;

        const response = await api.get<Game[]>('/games/', { params });
        setGames(response.data);
      } catch (err) {
        console.error('Erro ao buscar categoria:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryGames();
  }, [filter, platform]);

  const handleSearchRedirect = (val: string) => {
    setSearch(val);
    if (val.trim()) {
      navigate(`/?search=${encodeURIComponent(val)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header search={search} onSearchChange={handleSearchRedirect} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb / Botão de Voltar */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-100">{getPageTitle()}</h1>
            <p className="text-xs text-slate-500">
              {games.length} títulos encontrados no catálogo
            </p>
          </div>
        </div>

        {/* Grid com os cards padronizados */}
        {loading ? (
          <div className="flex flex-wrap gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-44 aspect-[3/4] shrink-0 bg-slate-900 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : games.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500">
            Nenhum jogo encontrado para esta categoria.
          </div>
        )}
      </main>
    </div>
  );
};
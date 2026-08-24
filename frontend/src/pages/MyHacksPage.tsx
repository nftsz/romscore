import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RomHack } from '../lib/types/types';
import { getMyHacks, api } from '../services/api';
import { useAuth } from '../lib/context/AuthContext';
import { Header } from '../components/Header';

export const MyHacksPage: React.FC = () => {
  const [hacks, setHacks] = useState<RomHack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchHacks = async () => {
      try {
        setLoading(true);
        const data = await getMyHacks();
        setHacks(data);
      } catch (err) {
        setError('Não foi possível carregar suas modificações.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchHacks();
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleDeleteHack = async (hackId: number) => {
    if (!confirm('Deseja realmente remover esta ROM hack?')) return;

    try {
      await api.delete(`/hacks/${hackId}/`);
      setHacks((prev) => prev.filter((h) => h.id !== hackId));
    } catch {
      alert('Erro ao excluir modificação.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Header search="" onSearchChange={(val) => val && navigate(`/?search=${val}`)} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>👾</span> Minhas Modificações
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Gerencie todas as ROM hacks e patches cadastrados por <strong className="text-indigo-400">{user?.username}</strong>
            </p>
          </div>

          <Link
            to="/"
            className="self-start rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            Explorar Jogos
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 w-full bg-slate-900 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : hacks.length > 0 ? (
          <div className="space-y-4">
            {hacks.map((hack) => (
              <div
                key={hack.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-slate-100">{hack.title}</h2>
                    <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs font-mono font-bold text-amber-400">
                      ★ {hack.avg_score ? hack.avg_score.toFixed(1) : 'Novo'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {hack.description || 'Sem descrição cadastrada.'}
                  </p>

                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span>Autor: <strong className="text-slate-300">{hack.author_name}</strong></span>
                    {hack.patch_url && (
                      <a
                        href={hack.patch_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline"
                      >
                        Link do Patch ↗
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    onClick={() => handleDeleteHack(hack.id)}
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-800 p-16 text-center">
            <p className="text-sm font-semibold text-slate-400 mb-1">Nenhuma modificação enviada ainda</p>
            <p className="text-xs text-slate-600 mb-4">
              Navegue até a página de um jogo clássico para cadastrar seu primeiro patch ou tradução.
            </p>
            <Link
              to="/"
              className="rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Ir para o catálogo
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};
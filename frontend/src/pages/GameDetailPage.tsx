import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Game } from '../lib/types/types';
import { api } from '../services/api';
import { useAuth } from '../lib/context/AuthContext';
import { Header } from '../components/Header';
import { SubmitHackModal } from '../components/SubmitHackModal';

export const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mapeamento de notas do usuário por Hack ID
  const [userRatings, setUserRatings] = useState<{ [hackId: number]: number }>({});
  
  // Lightbox
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);
  
  // Reviews
  const [expandedComments, setExpandedComments] = useState<{ [hackId: number]: boolean }>({});
  const [reviewInputs, setReviewInputs] = useState<{ [hackId: number]: string }>({});
  const [editingRatingId, setEditingRatingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [submitting, setSubmitting] = useState<{ [hackId: number]: boolean }>({});

  const fetchGameDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get<Game>(`/games/${id}/`);
      setGame(response.data);

      // Preenche as estrelas já avaliadas com base no user_rating do backend
      if (response.data.hacks) {
        const initialRatings: { [hackId: number]: number } = {};
        response.data.hacks.forEach((hack) => {
          if (hack.user_rating) {
            initialRatings[hack.id] = hack.user_rating;
          }
        });
        setUserRatings((prev) => ({ ...initialRatings, ...prev }));
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes do jogo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchGameDetails();
  }, [id, isAuthenticated]);

  const toggleComments = (hackId: number) => {
    setExpandedComments((prev) => ({ ...prev, [hackId]: !prev[hackId] }));
  };

  const handleRate = async (hackId: number, score: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setUserRatings((prev) => ({ ...prev, [hackId]: score }));
      await api.post(`/hacks/${hackId}/rate/`, { score });
      fetchGameDetails();
    } catch (err) {
      console.error('Erro ao avaliar:', err);
    }
  };

  const handlePostReview = async (hackId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const text = reviewInputs[hackId]?.trim();
    if (!text) return;

    try {
      setSubmitting((prev) => ({ ...prev, [hackId]: true }));
      const score = userRatings[hackId] || 5;
      await api.post(`/hacks/${hackId}/rate/`, { score, review: text });
      setReviewInputs((prev) => ({ ...prev, [hackId]: '' }));
      fetchGameDetails();
    } catch (err) {
      console.error('Erro ao postar análise:', err);
    } finally {
      setSubmitting((prev) => ({ ...prev, [hackId]: false }));
    }
  };

  const handleSaveEdit = async (hackId: number, currentScore: number) => {
    try {
      await api.post(`/hacks/${hackId}/rate/`, {
        score: currentScore,
        review: editingText.trim(),
      });
      setEditingRatingId(null);
      setEditingText('');
      fetchGameDetails();
    } catch (err) {
      console.error('Erro ao salvar edição:', err);
    }
  };

  const handleDeleteReview = async (hackId: number) => {
    if (!confirm('Deseja realmente apagar sua análise?')) return;

    try {
      await api.post(`/hacks/${hackId}/rate/`, {
        score: userRatings[hackId] || 5,
        review: '',
      });
      fetchGameDetails();
    } catch (err) {
      console.error('Erro ao apagar análise:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-neutral-100">
        <Header search="" onSearchChange={() => {}} />
        <div className="max-w-6xl mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-8 w-64 bg-[#181818] rounded" />
          <div className="h-96 w-full bg-[#181818] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-[#121212] text-neutral-100 flex flex-col items-center justify-center">
        <p className="text-neutral-500 mb-4">Jogo não encontrado.</p>
        <button onClick={() => navigate('/')} className="text-xs text-amber-400 underline">
          Voltar para a Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 pb-16">
      <Header search="" onSearchChange={(val) => val && navigate(`/?search=${val}`)} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-amber-400 transition-colors"
        >
          ← Voltar
        </button>

        {/* Hero Compacto do Jogo Base */}
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#181818] p-5 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex gap-5 items-center flex-1">
              <img
                src={game.cover_url || ''}
                alt={game.title}
                className="w-28 h-40 shrink-0 object-cover rounded-xl border border-[#333] shadow-lg"
              />

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-black text-amber-400 uppercase tracking-wider">
                    {game.platform}
                  </span>
                  {game.released_date && (
                    <span className="rounded bg-[#252525] border border-[#333] px-2 py-0.5 text-xs font-mono text-neutral-300">
                      {game.released_date.substring(0, 4)}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight leading-tight">
                  {game.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-neutral-400">
                  {game.developer && (
                    <div>
                      <span className="text-neutral-500 mr-1">Desenvolvedora:</span>
                      <strong className="text-neutral-200">{game.developer}</strong>
                    </div>
                  )}
                  {game.genre && (
                    <div>
                      <span className="text-neutral-500 mr-1">Gênero:</span>
                      <strong className="text-neutral-200">{game.genre}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(game.title_screen_url || game.ingame_screen_url) && (
              <div className="flex gap-3.5 shrink-0 self-stretch lg:self-auto justify-end border-t lg:border-t-0 lg:border-l border-[#2a2a2a] pt-4 lg:pt-0 lg:pl-6">
                {game.title_screen_url && (
                  <div
                    onClick={() => setActiveImageModal(game.title_screen_url!)}
                    className="relative group cursor-pointer overflow-hidden rounded-xl border border-[#333] bg-[#101010]"
                  >
                    <img
                      src={game.title_screen_url}
                      alt="Title Screen"
                      className="h-32 w-48 sm:w-56 object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold backdrop-blur-[2px]">
                      Title Screen 🔍
                    </div>
                  </div>
                )}
                {game.ingame_screen_url && (
                  <div
                    onClick={() => setActiveImageModal(game.ingame_screen_url!)}
                    className="relative group cursor-pointer overflow-hidden rounded-xl border border-[#333] bg-[#101010]"
                  >
                    <img
                      src={game.ingame_screen_url}
                      alt="Gameplay Screen"
                      className="h-32 w-48 sm:w-56 object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold backdrop-blur-[2px]">
                      Gameplay 🔍
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Seção de ROM Hacks */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-neutral-100 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                ROM Hacks & Patches ({game.hacks?.length || 0})
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Modificações da comunidade com capas e capturas in-game
              </p>
            </div>

            <button
              onClick={() => (isAuthenticated ? setIsModalOpen(true) : navigate('/login'))}
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-black text-neutral-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all"
            >
              + Submeter Hack
            </button>
          </div>

          {game.hacks && game.hacks.length > 0 ? (
            <div className="space-y-6">
              {game.hacks.map((hack) => {
                const isExpanded = !!expandedComments[hack.id];
                const reviewsList = hack.ratings?.filter((r) => r.review && r.review.trim().length > 0) || [];
                const screenshotsList = hack.screenshots || [];
                
                // Nota salva ou persistida do usuário logado
                const currentRating = userRatings[hack.id] || hack.user_rating || 0;

                return (
                  <div
                    key={hack.id}
                    className="rounded-2xl border border-[#2a2a2a] bg-[#181818] p-6 flex flex-col gap-5 shadow-xl"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-48 shrink-0 aspect-[16/9] rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#101010] self-start">
                        {hack.cover_url ? (
                          <img
                            src={hack.cover_url}
                            alt={hack.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center text-neutral-600 text-xs gap-1">
                            <span>🎮</span>
                            <span>Sem Capa</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-black text-neutral-100">{hack.title}</h3>
                              <span className="text-xs font-semibold text-amber-400">por {hack.author_name}</span>
                            </div>
                            <span className="rounded bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-sm font-mono font-bold text-amber-400">
                              ★ {hack.avg_score ? hack.avg_score.toFixed(1) : 'Novo'}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                            {hack.description || 'Sem descrição cadastrada.'}
                          </p>

                          {screenshotsList.length > 0 ? (
                            <div className="mt-4">
                              <span className="text-[11px] font-semibold text-neutral-400 block mb-2">
                                Screenshots da Modificação (clique para ampliar):
                              </span>
                              <div className="flex gap-3 overflow-x-auto pb-2">
                                {screenshotsList.map((screen: any, i: number) => {
                                  const imgUrl = typeof screen === 'string' ? screen : screen?.image_url;
                                  if (!imgUrl) return null;

                                  return (
                                    <div
                                      key={screen?.id || imgUrl || i}
                                      onClick={() => setActiveImageModal(imgUrl)}
                                      className="relative group cursor-pointer overflow-hidden rounded-lg border border-[#333] bg-[#101010] shrink-0"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Screenshot ${i + 1}`}
                                        className="h-20 w-32 object-cover transition-transform duration-200 group-hover:scale-105"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold">
                                        🔍
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-[11px] text-neutral-600">
                              Nenhuma screenshot cadastrada para esta hack.
                            </div>
                          )}
                        </div>

                        {/* Estrelas com Estado Persistente */}
                        <div className="mt-6 border-t border-[#2a2a2a] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-neutral-300">Sua Nota:</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleRate(hack.id, star)}
                                  className={`text-2xl transition-transform hover:scale-125 focus:outline-none ${
                                    currentRating >= star
                                      ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                      : 'text-neutral-700 hover:text-amber-400'
                                  }`}
                                  title={`Nota ${star}`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleComments(hack.id)}
                              className="rounded-lg border border-[#333] bg-[#121212] px-3.5 py-2 text-xs font-bold text-neutral-300 hover:text-white hover:bg-[#252525] transition-colors flex items-center gap-2"
                            >
                              💬 Análises ({reviewsList.length})
                              <span className="text-[10px] text-amber-400">
                                {isExpanded ? '▲ Recolher' : '▼ Expandir'}
                              </span>
                            </button>

                            {hack.patch_url && (
                              <a
                                href={hack.patch_url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-black text-neutral-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-colors"
                              >
                                Baixar Patch ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-[#2a2a2a] pt-4 mt-2 space-y-4">
                        {isAuthenticated ? (
                          <div className="space-y-2 bg-[#121212] p-3 rounded-xl border border-[#2a2a2a]">
                            <textarea
                              rows={2}
                              placeholder="Escreva sua análise crítica sobre jogabilidade, tradução e bugs..."
                              value={reviewInputs[hack.id] || ''}
                              onChange={(e) =>
                                setReviewInputs((prev) => ({ ...prev, [hack.id]: e.target.value }))
                              }
                              className="w-full bg-[#181818] border border-[#333] rounded-lg p-2.5 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
                            />
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-[11px] text-neutral-500">
                                Postando como <strong className="text-amber-400">{user?.username}</strong>
                              </span>
                              <button
                                type="button"
                                disabled={submitting[hack.id] || !reviewInputs[hack.id]?.trim()}
                                onClick={() => handlePostReview(hack.id)}
                                className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-black text-neutral-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              >
                                {submitting[hack.id] ? 'Publicando...' : 'Publicar Análise'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-[#121212] rounded-xl border border-[#2a2a2a] text-center text-xs text-neutral-500">
                            <button
                              onClick={() => navigate('/login')}
                              className="text-amber-400 font-bold hover:underline mr-1"
                            >
                              Faça login
                            </button>
                            para publicar uma análise crítica.
                          </div>
                        )}

                        <div className="space-y-2.5 pt-1">
                          {reviewsList.length > 0 ? (
                            reviewsList.map((rating) => {
                              const authorName = rating.username || user?.username || 'Jogador';
                              const isMyReview = user && rating.username === user.username;
                              const isEditingThis = editingRatingId === rating.id;

                              return (
                                <div
                                  key={rating.id}
                                  className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3.5 flex flex-col gap-2"
                                >
                                  <div className="flex items-center justify-between border-b border-[#252525] pb-2">
                                    <div className="flex items-center gap-2.5">
                                      <div className="h-6 w-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-[10px] font-black">
                                        {authorName.substring(0, 2).toUpperCase()}
                                      </div>
                                      <span className="text-xs font-bold text-neutral-200">
                                        {authorName}
                                      </span>
                                      <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-mono text-amber-400">
                                        ★ {rating.score}/5
                                      </span>
                                    </div>

                                    {isMyReview && !isEditingThis && (
                                      <div className="flex items-center gap-3">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingRatingId(rating.id);
                                            setEditingText(rating.review || '');
                                          }}
                                          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                                        >
                                          Editar
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteReview(hack.id)}
                                          className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
                                        >
                                          Apagar
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {isEditingThis ? (
                                    <div className="space-y-2 pt-1">
                                      <textarea
                                        rows={2}
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                                      />
                                      <div className="flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setEditingRatingId(null)}
                                          className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
                                        >
                                          Cancelar
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSaveEdit(hack.id, rating.score)}
                                          className="px-3 py-1 bg-amber-500 rounded text-xs font-black text-neutral-950 hover:bg-amber-400"
                                        >
                                          Salvar
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
                                      {rating.review}
                                    </p>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-neutral-600 text-center py-2">
                              Ainda não há análises escritas para este patch.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#2a2a2a] p-12 text-center text-xs text-neutral-500">
              Nenhuma ROM hack cadastrada para este clássico. Envie a primeira!
            </div>
          )}
        </section>
      </main>

      {/* Lightbox Modal */}
      {activeImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setActiveImageModal(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute -top-10 right-0 text-white font-bold text-sm bg-[#222] hover:bg-[#333] rounded-full px-3 py-1 transition-colors"
            >
              Fechar ✕
            </button>
            <img
              src={activeImageModal}
              alt="Ampliada"
              className="max-h-[85vh] w-auto rounded-xl border border-[#333] shadow-2xl object-contain"
            />
          </div>
        </div>
      )}

      {/* Modal de Submissão de Hack */}
      {game && (
        <SubmitHackModal
          gameId={game.id}
          gameTitle={game.title}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchGameDetails()}
        />
      )}
    </div>
  );
};
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Game } from "../lib/types/types";
import { api } from "../services/api";
import { useAuth } from "../lib/context/AuthContext";
import { Header } from "../components/Header";
import { SubmitHackModal } from "../components/SubmitHackModal";

export const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRatings, setUserRatings] = useState<{ [hackId: number]: number }>(
    {},
  );

  // Lightbox
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  // Reviews / Análises
  const [expandedComments, setExpandedComments] = useState<{
    [hackId: number]: boolean;
  }>({});
  const [reviewInputs, setReviewInputs] = useState<{
    [hackId: number]: string;
  }>({});
  const [editingRatingId, setEditingRatingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [submitting, setSubmitting] = useState<{ [hackId: number]: boolean }>(
    {},
  );

  const fetchGameDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get<Game>(`/games/${id}/`);
      setGame(response.data);
    } catch (err) {
      console.error("Erro ao carregar detalhes do jogo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchGameDetails();
  }, [id]);

  const toggleComments = (hackId: number) => {
    setExpandedComments((prev) => ({ ...prev, [hackId]: !prev[hackId] }));
  };

  const handleRate = async (hackId: number, score: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await api.post(`/hacks/${hackId}/rate/`, { score });
      setUserRatings((prev) => ({ ...prev, [hackId]: score }));
      fetchGameDetails();
    } catch (err) {
      console.error("Erro ao avaliar:", err);
    }
  };

  const handlePostReview = async (hackId: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const text = reviewInputs[hackId]?.trim();
    if (!text) return;

    try {
      setSubmitting((prev) => ({ ...prev, [hackId]: true }));
      const score = userRatings[hackId] || 5;
      await api.post(`/hacks/${hackId}/rate/`, { score, review: text });
      setReviewInputs((prev) => ({ ...prev, [hackId]: "" }));
      fetchGameDetails();
    } catch (err) {
      console.error("Erro ao postar análise:", err);
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
      setEditingText("");
      fetchGameDetails();
    } catch (err) {
      console.error("Erro ao salvar edição:", err);
    }
  };

  const handleDeleteReview = async (hackId: number) => {
    if (!confirm("Deseja realmente apagar sua análise?")) return;

    try {
      await api.post(`/hacks/${hackId}/rate/`, {
        score: userRatings[hackId] || 5,
        review: "",
      });
      fetchGameDetails();
    } catch (err) {
      console.error("Erro ao apagar análise:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Header search="" onSearchChange={() => {}} />
        <div className="max-w-6xl mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-8 w-64 bg-slate-900 rounded" />
          <div className="h-96 w-full bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <p className="text-slate-500 mb-4">Jogo não encontrado.</p>
        <button
          onClick={() => navigate("/")}
          className="text-xs text-indigo-400 underline"
        >
          Voltar para a Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Header
        search=""
        onSearchChange={(val) => val && navigate(`/?search=${val}`)}
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          ← Voltar
        </button>

        {/* Header / Hero Equilibrado do Jogo Base */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Bloco Esquerdo: Capa Média + Informações */}
            <div className="flex gap-5 items-center flex-1">
              {/* Capa em Tamanho Médio */}
              <img
                src={game.cover_url || ""}
                alt={game.title}
                className="w-28 h-40 shrink-0 object-cover rounded-xl border border-slate-800 shadow-lg"
              />

              {/* Título & Detalhes */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-md bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    {game.platform}
                  </span>
                  {game.released_date && (
                    <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-xs font-mono text-slate-300">
                      {game.released_date.substring(0, 4)}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight leading-tight">
                  {game.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-400">
                  {game.developer && (
                    <div>
                      <span className="text-slate-500 mr-1">
                        Desenvolvedora:
                      </span>
                      <strong className="text-slate-200">
                        {game.developer}
                      </strong>
                    </div>
                  )}
                  {game.genre && (
                    <div>
                      <span className="text-slate-500 mr-1">Gênero:</span>
                      <strong className="text-slate-200">{game.genre}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bloco Direito: Screenshots Oficiais em Widescreen */}
            {(game.title_screen_url || game.ingame_screen_url) && (
              <div className="flex gap-3.5 shrink-0 self-stretch lg:self-auto justify-end border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-6">
                {game.title_screen_url && (
                  <div
                    onClick={() => setActiveImageModal(game.title_screen_url!)}
                    className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
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
                    className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
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
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                ROM Hacks & Patches ({game.hacks?.length || 0})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Modificações da comunidade com capas e capturas in-game
              </p>
            </div>

            <button
              onClick={() =>
                isAuthenticated ? setIsModalOpen(true) : navigate("/login")
              }
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
            >
              + Submeter Hack
            </button>
          </div>

          {game.hacks && game.hacks.length > 0 ? (
            <div className="space-y-6">
              {game.hacks.map((hack) => {
                const isExpanded = !!expandedComments[hack.id];
                const reviewsList =
                  hack.ratings?.filter(
                    (r) => r.review && r.review.trim().length > 0,
                  ) || [];
                const screenshotsList = hack.screenshots || [];

                return (
                  <div
                    key={hack.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col gap-5 shadow-xl"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Capa da ROM Hack Horizontal e Compacta (16:9) */}
                      <div className="w-full md:w-48 shrink-0 aspect-[16/9] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 self-start">
                        {hack.cover_url ? (
                          <img
                            src={hack.cover_url}
                            alt={hack.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center text-slate-600 text-xs gap-1">
                            <span>🎮</span>
                            <span>Sem Capa</span>
                          </div>
                        )}
                      </div>

                      {/* Informações e Screenshots */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-100">
                                {hack.title}
                              </h3>
                              <span className="text-xs text-indigo-400">
                                por {hack.author_name}
                              </span>
                            </div>
                            <span className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-sm font-mono font-bold text-amber-400">
                              ★{" "}
                              {hack.avg_score
                                ? hack.avg_score.toFixed(1)
                                : "Novo"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            {hack.description || "Sem descrição cadastrada."}
                          </p>

                          {/* Screenshots com suporte a Objeto ou String */}
                          {screenshotsList.length > 0 ? (
                            <div className="mt-4">
                              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                                Screenshots da Modificação (clique para
                                ampliar):
                              </span>
                              <div className="flex gap-3 overflow-x-auto pb-2">
                                {screenshotsList.map(
                                  (screen: any, i: number) => {
                                    const imgUrl =
                                      typeof screen === "string"
                                        ? screen
                                        : screen?.image_url;
                                    if (!imgUrl) return null;

                                    return (
                                      <div
                                        key={screen?.id || imgUrl || i}
                                        onClick={() =>
                                          setActiveImageModal(imgUrl)
                                        }
                                        className="relative group cursor-pointer overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shrink-0"
                                      >
                                        <img
                                          src={imgUrl}
                                          alt={`Screenshot ${i + 1}`}
                                          className="h-20 w-32 object-cover transition-transform duration-200 group-hover:scale-105"
                                          onError={(e) => {
                                            (
                                              e.target as HTMLElement
                                            ).style.display = "none";
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold">
                                          🔍
                                        </div>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-[11px] text-slate-600">
                              Nenhuma screenshot cadastrada para esta hack.
                            </div>
                          )}
                        </div>

                        {/* Avaliação por Estrelas e Ações */}
                        <div className="mt-6 border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-slate-300">
                              Sua Nota:
                            </span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleRate(hack.id, star)}
                                  className={`text-2xl transition-transform hover:scale-125 focus:outline-none ${
                                    (userRatings[hack.id] || 0) >= star
                                      ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                      : "text-slate-700 hover:text-amber-400"
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
                              className="rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
                            >
                              💬 Análises ({reviewsList.length})
                              <span className="text-[10px] text-indigo-400">
                                {isExpanded ? "▲ Recolher" : "▼ Expandir"}
                              </span>
                            </button>

                            {hack.patch_url && (
                              <a
                                href={hack.patch_url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-colors"
                              >
                                Baixar Patch ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bloco de Análises estilo Steam */}
                    {isExpanded && (
                      <div className="border-t border-slate-800/80 pt-4 mt-2 space-y-4">
                        {/* Formulário de Análise */}
                        {isAuthenticated ? (
                          <div className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                            <textarea
                              rows={2}
                              placeholder="Escreva sua análise sobre jogabilidade, estabilidade e bugs..."
                              value={reviewInputs[hack.id] || ""}
                              onChange={(e) =>
                                setReviewInputs((prev) => ({
                                  ...prev,
                                  [hack.id]: e.target.value,
                                }))
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-[11px] text-slate-500">
                                Postando como{" "}
                                <strong className="text-indigo-400">
                                  {user?.username}
                                </strong>
                              </span>
                              <button
                                type="button"
                                disabled={
                                  submitting[hack.id] ||
                                  !reviewInputs[hack.id]?.trim()
                                }
                                onClick={() => handlePostReview(hack.id)}
                                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              >
                                {submitting[hack.id]
                                  ? "Publicando..."
                                  : "Publicar Análise"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                            <button
                              onClick={() => navigate("/login")}
                              className="text-indigo-400 font-semibold hover:underline mr-1"
                            >
                              Faça login
                            </button>
                            para publicar uma análise crítica.
                          </div>
                        )}

                        {/* Listagem de Reviews (Cards Steam) */}
                        <div className="space-y-2.5 pt-1">
                          {reviewsList.length > 0 ? (
                            reviewsList.map((rating) => {
                              const authorName =
                                rating.username || user?.username || "Jogador";
                              const isMyReview =
                                user && rating.username === user.username;
                              const isEditingThis =
                                editingRatingId === rating.id;

                              return (
                                <div
                                  key={rating.id}
                                  className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 flex flex-col gap-2"
                                >
                                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                                    <div className="flex items-center gap-2.5">
                                      <div className="h-6 w-6 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                                        {authorName
                                          .substring(0, 2)
                                          .toUpperCase()}
                                      </div>
                                      <span className="text-xs font-bold text-slate-200">
                                        {authorName}
                                      </span>
                                      <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-mono text-amber-400">
                                        ★ {rating.score}/5
                                      </span>
                                    </div>

                                    {/* Botões de Editar e Apagar */}
                                    {isMyReview && !isEditingThis && (
                                      <div className="flex items-center gap-3">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingRatingId(rating.id);
                                            setEditingText(rating.review || "");
                                          }}
                                          className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                                        >
                                          Editar
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteReview(hack.id)
                                          }
                                          className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
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
                                        onChange={(e) =>
                                          setEditingText(e.target.value)
                                        }
                                        className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                                      />
                                      <div className="flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingRatingId(null)
                                          }
                                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                                        >
                                          Cancelar
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleSaveEdit(
                                              hack.id,
                                              rating.score,
                                            )
                                          }
                                          className="px-3 py-1 bg-indigo-600 rounded text-xs font-bold text-white hover:bg-indigo-500"
                                        >
                                          Salvar
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                                      {rating.review}
                                    </p>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-slate-600 text-center py-2">
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
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-xs text-slate-500">
              Nenhuma ROM hack cadastrada para este clássico. Envie a primeira!
            </div>
          )}
        </section>
      </main>

      {/* Lightbox / Zoom da Imagem */}
      {activeImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setActiveImageModal(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute -top-10 right-0 text-white font-bold text-sm bg-slate-800 hover:bg-slate-700 rounded-full px-3 py-1 transition-colors"
            >
              Fechar ✕
            </button>
            <img
              src={activeImageModal}
              alt="Ampliada"
              className="max-h-[85vh] w-auto rounded-xl border border-slate-700 shadow-2xl object-contain"
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

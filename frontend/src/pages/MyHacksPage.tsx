import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RomHack, CategoryChoice } from '../lib/types/types';
import { getMyHacks, api } from '../services/api';
import { useAuth } from '../lib/context/AuthContext';
import { Header } from '../components/Header';

export const MyHacksPage: React.FC = () => {
  const [hacks, setHacks] = useState<RomHack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Estados do Modal de Edição
  const [editingHack, setEditingHack] = useState<RomHack | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editCategory, setEditCategory] = useState<CategoryChoice>('complete_hack');
  const [editDescription, setEditDescription] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editPatchUrl, setEditPatchUrl] = useState('');
  const [editScreenshots, setEditScreenshots] = useState<string[]>(['']);
  const [savingEdit, setSavingEdit] = useState(false);

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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

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

  const handleOpenEditModal = (hack: RomHack) => {
    setEditingHack(hack);
    setEditTitle(hack.title);
    setEditAuthor(hack.author_name);
    setEditCategory(hack.category || 'complete_hack');
    setEditDescription(hack.description || '');
    setEditCoverUrl(hack.cover_url || '');
    setEditPatchUrl(hack.patch_url || '');

    const urls = (hack.screenshots || []).map((s: any) =>
      typeof s === 'string' ? s : s.image_url
    );
    setEditScreenshots(urls.length > 0 ? urls : ['']);
  };

  const handleSaveHack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHack) return;

    setSavingEdit(true);
    const validScreenshots = editScreenshots.map((s) => s.trim()).filter(Boolean);

    try {
      await api.patch(`/hacks/${editingHack.id}/`, {
        title: editTitle.trim(),
        author_name: editAuthor.trim(),
        category: editCategory,
        description: editDescription.trim(),
        cover_url: editCoverUrl.trim() || undefined,
        patch_url: editPatchUrl.trim(),
        screenshots_urls: validScreenshots,
      });

      setEditingHack(null);
      fetchHacks();
    } catch {
      alert('Erro ao atualizar ROM hack.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 pb-16">
      <Header search="" onSearchChange={(val) => val && navigate(`/?search=${val}`)} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-neutral-100 flex items-center gap-2">
              <span>👾</span> Minhas Modificações
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Gerencie todas as ROM hacks e patches cadastrados por <strong className="text-amber-400">{user?.username}</strong>
            </p>
          </div>

          <Link
            to="/"
            className="self-start rounded-lg bg-amber-500 px-4 py-2 text-xs font-black text-neutral-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all"
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
              <div key={i} className="h-28 w-full bg-[#181818] border border-[#2a2a2a] animate-pulse rounded-xl" />
            ))}
          </div>
        ) : hacks.length > 0 ? (
          <div className="space-y-4">
            {hacks.map((hack) => (
              <div
                key={hack.id}
                className="rounded-xl border border-[#2a2a2a] bg-[#181818] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-neutral-100">{hack.title}</h2>
                    <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs font-mono font-bold text-amber-400">
                      ★ {hack.avg_score ? hack.avg_score.toFixed(1) : 'Novo'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {hack.description || 'Sem descrição cadastrada.'}
                  </p>

                  <div className="text-[11px] text-neutral-500 flex items-center gap-3">
                    <span>Autor: <strong className="text-neutral-300">{hack.author_name}</strong></span>
                    {hack.patch_url && (
                      <a
                        href={hack.patch_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline font-bold"
                      >
                        Link do Patch ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* Botões de Ação: Editar e Excluir */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleOpenEditModal(hack)}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteHack(hack.id)}
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#2a2a2a] p-16 text-center">
            <p className="text-sm font-bold text-neutral-400 mb-1">Nenhuma modificação enviada ainda</p>
            <p className="text-xs text-neutral-600 mb-4">
              Navegue até a página de um jogo clássico para cadastrar seu primeiro patch ou tradução.
            </p>
            <Link
              to="/"
              className="rounded-lg bg-[#181818] border border-[#333] px-4 py-2 text-xs font-bold text-neutral-300 hover:text-white hover:bg-[#252525] transition-colors"
            >
              Ir para o catálogo
            </Link>
          </div>
        )}
      </main>

      {/* Modal de Edição de ROM Hack */}
      {editingHack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#2a2a2a] bg-[#181818] p-6 shadow-2xl">
            <button
              onClick={() => setEditingHack(null)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-lg font-black text-neutral-100 font-mono">
              Editar ROM Hack
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Atualize as informações, capa ou links da modificação.
            </p>

            <form onSubmit={handleSaveHack} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">
                  Nome da Modificação *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#333] bg-[#101010] px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1">
                    Autor(es) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full rounded-lg border border-[#333] bg-[#101010] px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as CategoryChoice)}
                    className="w-full rounded-lg border border-[#333] bg-[#101010] px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="complete_hack">Hack Completa</option>
                    <option value="improvement">Melhoria / QoL</option>
                    <option value="translation">Tradução</option>
                    <option value="difficulty">Dificuldade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1">
                    Link da Capa
                  </label>
                  <input
                    type="url"
                    value={editCoverUrl}
                    onChange={(e) => setEditCoverUrl(e.target.value)}
                    className="w-full rounded-lg border border-[#333] bg-[#101010] px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1">
                    Link do Patch (.ips, .bps, .xdelta) *
                  </label>
                  <input
                    type="url"
                    required
                    value={editPatchUrl}
                    onChange={(e) => setEditPatchUrl(e.target.value)}
                    className="w-full rounded-lg border border-[#333] bg-[#101010] px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#333] bg-[#101010] px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Screenshots */}
              <div className="border-t border-[#2a2a2a] pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-300">
                    Screenshots (máx. 3)
                  </label>
                  {editScreenshots.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setEditScreenshots([...editScreenshots, ''])}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300"
                    >
                      + Adicionar ({editScreenshots.length}/3)
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {editScreenshots.map((url, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={url}
                        onChange={(e) => {
                          const updated = [...editScreenshots];
                          updated[idx] = e.target.value;
                          setEditScreenshots(updated);
                        }}
                        className="flex-1 rounded-lg border border-[#333] bg-[#101010] px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                      {editScreenshots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editScreenshots.filter((_, i) => i !== idx);
                            setEditScreenshots(updated.length > 0 ? updated : ['']);
                          }}
                          className="px-2 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingHack(null)}
                  className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-lg bg-amber-500 px-5 py-2 text-xs font-black text-neutral-950 hover:bg-amber-400 disabled:opacity-50 transition-all"
                >
                  {savingEdit ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
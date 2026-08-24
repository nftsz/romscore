import React, { useState } from 'react';
import { api } from '../services/api';
import { RomHack, CategoryChoice } from '../lib/types/types';

interface SubmitHackModalProps {
  gameId: number;
  gameTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newHack: RomHack) => void;
}

export const SubmitHackModal: React.FC<SubmitHackModalProps> = ({
  gameId,
  gameTitle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState<CategoryChoice>('complete_hack');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [patchUrl, setPatchUrl] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleScreenshotChange = (index: number, value: string) => {
    const updated = [...screenshots];
    updated[index] = value;
    setScreenshots(updated);
  };

  const addScreenshotField = () => {
    if (screenshots.length < 3) {
      setScreenshots([...screenshots, '']);
    }
  };

  const removeScreenshotField = (index: number) => {
    const updated = screenshots.filter((_, i) => i !== index);
    setScreenshots(updated.length > 0 ? updated : ['']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Filtra links vazios
    const validScreenshots = screenshots.map((s) => s.trim()).filter(Boolean);

    try {
      const response = await api.post<RomHack>('/hacks/', {
        game: gameId,
        title: title.trim(),
        author_name: authorName.trim(),
        category,
        description: description.trim(),
        cover_url: coverUrl.trim() || undefined,
        patch_url: patchUrl.trim(),
        screenshots_urls: validScreenshots, // 👈 Chave exata que o backend processa
      });

      onSuccess(response.data);
      onClose();
    } catch (err: any) {
      if (err.response?.data) {
        const firstError = Object.values(err.response.data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        setError('Erro ao submeter a modificação. Verifique os campos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-slate-100 font-mono">
          Submeter ROM Hack / Tradução
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Vinculado a: <strong className="text-indigo-400">{gameTitle}</strong>
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Nome da Modificação / Tradução *
            </label>
            <input
              type="text"
              required
              placeholder="ex: Pokemon Emerald Seaglass / PT-BR"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Autor(es) / Grupo *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Drayano / Equipe BR"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryChoice)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
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
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Link da Capa do Hack (opcional)
              </label>
              <input
                type="url"
                placeholder="https://imgur.com/capa.png"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Link do Patch (.ips, .bps, .xdelta) *
              </label>
              <input
                type="url"
                required
                placeholder="https://romhacking.net/..."
                value={patchUrl}
                onChange={(e) => setPatchUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Descrição das Mudanças / Changelog
            </label>
            <textarea
              rows={3}
              placeholder="O que foi alterado (balanceamento, nova engine, tradução completa)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Screenshots (Links Externos - Máx 3) */}
          <div className="border-t border-slate-800/80 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300">
                Screenshots do Hack (Links externos, máx. 3)
              </label>
              {screenshots.length < 3 && (
                <button
                  type="button"
                  onClick={addScreenshotField}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  + Adicionar link ({screenshots.length}/3)
                </button>
              )}
            </div>

            <div className="space-y-2">
              {screenshots.map((url, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="url"
                    placeholder={`https://imgur.com/... (screenshot ${idx + 1})`}
                    value={url}
                    onChange={(e) => handleScreenshotChange(idx, e.target.value)}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  {screenshots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeScreenshotField(idx)}
                      className="px-2 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Preview Instantâneo */}
            {screenshots.some((s) => s.trim().length > 0) && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {screenshots
                  .filter((s) => s.trim().length > 0)
                  .map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt={`Preview ${i + 1}`}
                      className="h-14 w-24 object-cover rounded-md border border-slate-800 bg-slate-950"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Cadastrando Modificação...' : 'Cadastrar Modificação'}
          </button>
        </form>
      </div>
    </div>
  );
};
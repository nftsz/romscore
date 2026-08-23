import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Game, RomHack } from '../lib/types/types';
import { useAuth } from '../lib/context/AuthContext';
import { Star, Plus, LogIn, LogOut } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para envio de nota rápida
  const [selectedHack, setSelectedHack] = useState<number | null>(null);
  const [score, setScore] = useState(5);
  const [review, setReview] = useState('');

  const fetchGames = async () => {
    try {
      const response = await api.get<Game[]>('/games/');
      setGames(response.data);
    } catch (err) {
      console.error('Erro ao buscar jogos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleRate = async (hackId: number) => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado para avaliar!');
      return;
    }
    try {
      await api.post(`/hacks/${hackId}/rate/`, { score, review });
      alert('Avaliação enviada com sucesso!');
      setSelectedHack(null);
      setReview('');
      fetchGames();
    } catch (err) {
      console.error('Erro ao avaliar hack:', err);
      alert('Erro ao enviar avaliação.');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: '#fff' }}>Carregando catálogo...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* Header com Auth */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>🎮 Ride Analytics</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#888' }}>Descoberta e Avaliações de Hacks, Traduções e Mods</p>
        </div>
        <div>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>Olá, <strong>{user?.username}</strong>!</span>
              <button onClick={logout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                <LogOut size={16} /> Sair
              </button>
            </div>
          ) : (
            <a href="/login" style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
              <LogIn size={16} /> Entrar / Criar Conta
            </a>
          )}
        </div>
      </header>

      {/* Listagem de Jogos */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        {games.length === 0 ? (
          <p>Nenhum jogo cadastrado ainda. Use o Swagger ou adicione o primeiro jogo!</p>
        ) : (
          games.map((game) => (
            <div key={game.id} style={{ border: '1px solid #333', borderRadius: '8px', padding: '1.5rem', background: '#1a1a1a' }}>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                {game.cover_url && (
                  <img src={game.cover_url} alt={game.title} style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '4px' }} />
                )}
                <div>
                  <h2 style={{ margin: '0 0 0.5rem' }}>{game.title}</h2>
                  <span style={{ fontSize: '0.85rem', color: '#aaa', background: '#333', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                    {game.total_hacks} Mods / Traduções cadastradas
                  </span>
                </div>
              </div>

              {/* Lista de Mods daquele Jogo */}
              <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginTop: '1.5rem' }}>
                Mods & Traduções Disponíveis
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {game.hacks?.map((hack) => (
                  <div key={hack.id} style={{ background: '#252525', padding: '1rem', borderRadius: '6px', border: '1px solid #444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.3rem' }}>{hack.title}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#60a5fa' }}>Por: {hack.author_name} ({hack.category_display})</span>
                        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#ccc' }}>{hack.description}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 'bold' }}>
                          <Star size={16} fill="#f59e0b" /> {hack.avg_score.toFixed(1)} <span style={{ color: '#888', fontSize: '0.8rem' }}>({hack.total_ratings})</span>
                        </div>
                        {hack.patch_url && (
                          <a href={hack.patch_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#10b981', display: 'block', marginTop: '0.5rem' }}>
                            Baixar Patch ↗
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Botão para Avaliar */}
                    <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px dashed #333' }}>
                      {selectedHack === hack.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                          <select value={score} onChange={(e) => setScore(Number(e.target.value))} style={{ padding: '0.3rem' }}>
                            <option value={5}>5 ★ - Excelente</option>
                            <option value={4}>4 ★ - Muito Bom</option>
                            <option value={3}>3 ★ - Regular</option>
                            <option value={2}>2 ★ - Ruim</option>
                            <option value={1}>1 ★ - Péssimo</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Comentário sobre estabilidade/tradução..."
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            style={{ flex: 1, padding: '0.3rem' }}
                          />
                          <button onClick={() => handleRate(hack.id)} style={{ padding: '0.3rem 0.8rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Salvar
                          </button>
                          <button onClick={() => setSelectedHack(null)} style={{ padding: '0.3rem', cursor: 'pointer' }}>Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => setSelectedHack(hack.id)} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>
                          Avaliar este mod
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
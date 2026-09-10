import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../lib/context/AuthContext';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await api.post('/auth/register/', {
          username,
          email: email || undefined,
          password,
        });
      }

      const response = await api.post<{ access: string; refresh: string }>('/auth/login/', {
        username,
        password,
      });

      await login(response.data);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data) {
        const firstError = Object.values(err.response.data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        setError('Não foi possível conectar ao servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 flex flex-col justify-center items-center px-4 py-12">
      <Link
        to="/"
        className="mb-8 flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-amber-400 transition-colors"
      >
        ← Voltar para a página inicial
      </Link>

      <div className="w-full max-w-md bg-[#181818] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 font-black text-2xl shadow-lg shadow-amber-500/20 mb-3">
            🎮
          </div>
          <h1 className="text-xl font-extrabold tracking-wider text-neutral-100 font-mono">
            ROM<span className="text-amber-400">Score</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {isRegister
              ? 'Crie sua conta para enviar e avaliar ROM hacks'
              : 'Entre para gerenciar suas modificações e avaliações'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1.5">
              Nome de Usuário
            </label>
            <input
              type="text"
              required
              placeholder="ex: red_trainer"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#101010] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1.5">
                E-mail (opcional)
              </label>
              <input
                type="email"
                placeholder="ex: trainer@kanto.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#101010] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1.5">
              Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#101010] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-amber-500 py-2.5 text-sm font-black text-neutral-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Processando...' : isRegister ? 'Cadastrar e Entrar' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 border-t border-[#252525] pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors"
          >
            {isRegister
              ? 'Já possui uma conta? Faça Login'
              : 'Não tem uma conta? Crie uma agora'}
          </button>
        </div>
      </div>
    </div>
  );
};
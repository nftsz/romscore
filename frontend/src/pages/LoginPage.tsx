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
        if (Array.isArray(firstError)) {
          setError(firstError[0]);
        } else if (typeof firstError === 'string') {
          setError(firstError);
        } else {
          setError('Erro na requisição. Verifique os dados informados.');
        }
      } else {
        setError('Não foi possível conectar ao servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      {/* Botão de Voltar para a Home */}
      <Link
        to="/"
        className="mb-8 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
      >
        ← Voltar para a página inicial
      </Link>

      {/* Card Principal */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-indigo-950/20">
        {/* Header do Card com a Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-2xl shadow-lg shadow-indigo-600/30 mb-3">
            🎮
          </div>
          <h1 className="text-xl font-extrabold tracking-wider text-slate-100 font-mono">
            ROM<span className="text-indigo-400">Score</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister
              ? 'Crie sua conta para enviar e avaliar ROM hacks'
              : 'Entre para gerenciar suas modificações e avaliações'}
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Nome de Usuário
            </label>
            <input
              type="text"
              required
              placeholder="ex: red_trainer"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                E-mail (opcional)
              </label>
              <input
                type="email"
                placeholder="ex: trainer@kanto.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Processando...' : isRegister ? 'Cadastrar e Entrar' : 'Entrar'}
          </button>
        </form>

        {/* Alternador de Modo Login / Registro */}
        <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
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
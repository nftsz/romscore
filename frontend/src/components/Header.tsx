import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/context/AuthContext';

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ search, onSearchChange }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 text-decoration-none group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-black shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
            🎮
          </div>
          <span className="text-xl font-extrabold tracking-wider text-slate-100 font-mono">
            ROM<span className="text-indigo-400">Score</span>
          </span>
        </Link>

        {/* Barra de Pesquisa Centralizada */}
        <div className="flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            placeholder="Pesquisar clássicos, hacks ou traduções..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-8 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">
            🔍
          </span>
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-2.5 text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Bloco de Usuário / Auth */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/my-hacks"
                className="text-xs font-semibold text-slate-300 hover:text-indigo-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                title="Acessar minhas modificações"
              >
                <span>👾</span>
                <strong className="text-indigo-400">{user.username}</strong>
              </Link>
              <button
                onClick={logout}
                className="text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all duration-200"
            >
              Entrar / Cadastrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
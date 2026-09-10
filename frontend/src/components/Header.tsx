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
    <header className="sticky top-0 z-50 w-full border-b border-[#2a2a2a] bg-[#121212]/95 backdrop-blur-md px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo RA Style */}
        <Link to="/" className="flex items-center gap-2.5 text-decoration-none group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-500/20 group-hover:bg-amber-400 transition-colors">
            🎮
          </div>
          <span className="text-xl font-extrabold tracking-wider text-neutral-100 font-mono">
            ROM<span className="text-amber-400">Score</span>
          </span>
        </Link>

        {/* Busca */}
        <div className="flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            placeholder="Pesquisar jogos, hacks ou patches..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-[#333] rounded-full py-2 pl-10 pr-8 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <span className="absolute left-3.5 top-2.5 text-neutral-500 text-xs">🔍</span>
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-2.5 text-xs text-neutral-500 hover:text-neutral-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Bloco de Usuário */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/my-hacks"
                className="text-xs font-semibold text-neutral-300 hover:text-amber-400 bg-[#1e1e1e] border border-[#333] px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
              >
                <span>👾</span>
                <strong className="text-amber-400">{user.username}</strong>
              </Link>
              <button
                onClick={logout}
                className="text-xs font-medium text-neutral-400 hover:text-rose-400 transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="rounded-full bg-amber-500 px-4 py-2 text-xs font-black text-neutral-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all duration-200"
            >
              Entrar / Cadastrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
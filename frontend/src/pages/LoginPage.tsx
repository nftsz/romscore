import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../lib/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        await api.post('/auth/register/', { username, password });
      }
      const response = await api.post<{ access: string; refresh: string }>('/auth/login/', {
        username,
        password,
      });
      await login(response.data);
      navigate('/');
    } catch {
      setError('Credenciais inválidas ou erro no cadastro.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #333', borderRadius: '8px', background: '#1a1a1a' }}>
      <h2>{isRegister ? 'Criar Conta' : 'Entrar na Plataforma'}</h2>
      {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.3rem' }}>Usuário</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.3rem' }}>Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.7rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {isRegister ? 'Cadastrar e Entrar' : 'Entrar'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
        <button
          onClick={() => setIsRegister(!isRegister)}
          style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isRegister ? 'Já tem uma conta? Faça Login' : 'Não tem conta? Cadastre-se'}
        </button>
      </div>
    </div>
  );
};
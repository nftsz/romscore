import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../lib/context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
        // Rota de registro criada no AuthViewSet
        await api.post('/auth/register/', {
          username,
          email: email || undefined,
          password,
        });
      }

      // Rota de login JWT padrão
      const response = await api.post<{ access: string; refresh: string }>('/auth/login/', {
        username,
        password,
      });

      await login(response.data);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data) {
        // Extrai a mensagem de erro específica do DRF (ex: "A user with that username already exists.")
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
    <div
      style={{
        maxWidth: '420px',
        margin: '4rem auto',
        padding: '2rem',
        border: '1px solid #334155',
        borderRadius: '12px',
        background: '#0f172a',
        color: '#f8fafc',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
      }}
    >
      <h2 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', fontSize: '1.5rem' }}>
        {isRegister ? 'Criar Conta' : 'Entrar na Plataforma'}
      </h2>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            Usuário
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#fff',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {isRegister && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              E-mail (opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '6px',
                border: '1px solid #334155',
                background: '#1e293b',
                color: '#fff',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            Senha (mínimo 6 caracteres)
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#fff',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Processando...' : isRegister ? 'Cadastrar e Entrar' : 'Entrar'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#818cf8',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {isRegister ? 'Já tem uma conta? Faça Login' : 'Não tem conta? Cadastre-se'}
        </button>
      </div>
    </div>
  );
};
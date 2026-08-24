import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/context/AuthContext';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { CategoryPage } from './pages/CategoryPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { MyHacksPage } from './pages/MyHacksPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/game/:id" element={<GameDetailPage />} />
          <Route path="/my-hacks" element={<MyHacksPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
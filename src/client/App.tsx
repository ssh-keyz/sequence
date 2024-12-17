import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GameLobby from './pages/GameLobby';
import GamePage from './pages/GamePage';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            !isAuthenticated ? 
              <LoginPage onLogin={handleLogin} /> : 
              <Navigate to="/lobby" replace />
          } />
          <Route path="/register" element={
            !isAuthenticated ? 
              <RegisterPage onRegister={handleLogin} /> : 
              <Navigate to="/lobby" replace />
          } />
          <Route path="/lobby" element={
            isAuthenticated ? 
              <GameLobby /> : 
              <Navigate to="/login" replace />
          } />
          <Route path="/game/:gameId" element={
            isAuthenticated ? 
              <GamePage /> : 
              <Navigate to="/login" replace />
          } />
          <Route path="/" element={<Navigate to="/lobby" replace />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}; 
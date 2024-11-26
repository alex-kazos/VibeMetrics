import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Dashboard from './pages/Dashboard';
import SpotifyCallback from './pages/SpotifyCallback';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('spotify_access_token');
  const expiration = localStorage.getItem('spotify_token_expiration');

  // If no token or expired, redirect to login
  if (!token || (expiration && Date.now() > parseInt(expiration))) {
    // Clear tokens if they exist
    if (token || expiration) {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_token_expiration');
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const token = localStorage.getItem('spotify_access_token');
  const expiration = localStorage.getItem('spotify_token_expiration');
  const isAuthenticated = token && expiration && Date.now() <= parseInt(expiration);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          <Route path="/callback" element={<SpotifyCallback />} />
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
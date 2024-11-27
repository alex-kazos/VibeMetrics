import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Playlists from './pages/Playlists';
import SpotifyCallback from './pages/SpotifyCallback';
import useSpotifyAuth from './hooks/useSpotifyAuth';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useSpotifyAuth();
  return isAuthenticated ? element : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={<PrivateRoute element={<Dashboard />} />}
            />
            <Route
              path="/playlists"
              element={<PrivateRoute element={<Playlists />} />}
            />
            <Route path="/callback" element={<SpotifyCallback />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
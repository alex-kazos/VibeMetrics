import React from 'react';
import { Music } from 'lucide-react';

const LoginPage: React.FC = () => {
  const handleLogin = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = `${window.location.origin}/callback`;
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'streaming'
    ];

    // Clear any existing tokens
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiration');

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'token',
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      show_dialog: 'true'
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Music className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to VibeMetrics</h1>
        <p className="text-gray-400 text-lg">Your personal Spotify insights dashboard</p>
      </div>
      <button
        onClick={handleLogin}
        className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition shadow-lg"
      >
        Connect with Spotify
      </button>
    </div>
  );
};

export default LoginPage;
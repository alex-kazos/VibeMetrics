import React, { useEffect, useState } from 'react';
import { getAccessToken } from '../utils/spotify';
import { useNavigate } from 'react-router-dom';

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = () => {
      try {
        // First check for error in query parameters
        const queryParams = new URLSearchParams(window.location.search);
        const queryError = queryParams.get('error');
        if (queryError) {
          throw new Error(`Spotify authorization error: ${queryError}`);
        }

        // Then check for error in hash fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashError = hashParams.get('error');
        if (hashError) {
          throw new Error(`Spotify authorization error: ${hashError}`);
        }

        // Get access token from hash fragment
        const token = getAccessToken();
        if (!token) {
          console.error('No token in URL. Hash:', window.location.hash);
          throw new Error('No access token received from Spotify');
        }

        // Store token and redirect
        localStorage.setItem('spotify_access_token', token);
        navigate('/dashboard');
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        // Log the current URL for debugging
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-red-500 mb-4">{error}</p>
        <p className="text-gray-400 mb-2">Redirecting to home...</p>
        <p className="text-sm text-gray-500">
          Please make sure you have allowed the necessary permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );
}
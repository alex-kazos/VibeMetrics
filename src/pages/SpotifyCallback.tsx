import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = () => {
      try {
        // Check if there's an error in the URL
        const searchParams = new URLSearchParams(window.location.search);
        const urlError = searchParams.get('error');
        if (urlError) {
          throw new Error(`Spotify authorization failed: ${urlError}`);
        }

        // Get the hash fragment from the URL
        const hash = window.location.hash.substring(1);
        if (!hash) {
          throw new Error('No authorization data received from Spotify');
        }

        // Parse the hash fragment
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');

        if (!accessToken) {
          throw new Error('No access token found in Spotify response');
        }

        // Store the access token
        localStorage.setItem('spotify_access_token', accessToken);
        
        // Calculate and store expiration time
        if (expiresIn) {
          const expirationTime = Date.now() + parseInt(expiresIn) * 1000;
          localStorage.setItem('spotify_token_expiration', expirationTime.toString());
        }

        // Clear the URL hash
        if (window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        } else {
          window.location.hash = '';
        }
        
        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            Authentication failed: {error}
          </div>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">
        Connecting to Spotify...
      </div>
    </div>
  );
};

export default SpotifyCallback;

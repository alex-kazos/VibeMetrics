import { useState, useEffect } from 'react';

export default function useSpotifyAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(() => 
    localStorage.getItem('spotify_access_token')
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('spotify_access_token');
    const expiration = localStorage.getItem('spotify_token_expiration');
    return !!(token && expiration && Number(expiration) > Date.now());
  });

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('spotify_access_token');
      const expiration = localStorage.getItem('spotify_token_expiration');
      const isValid = token && expiration && Number(expiration) > Date.now();
      
      if (!isValid && isAuthenticated) {
        setIsAuthenticated(false);
        setAccessToken(null);
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiration');
      } else if (isValid && !isAuthenticated) {
        setIsAuthenticated(true);
        setAccessToken(token);
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const logout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiration');
    setAccessToken(null);
    setIsAuthenticated(false);
  };

  return { accessToken, isAuthenticated, logout };
}

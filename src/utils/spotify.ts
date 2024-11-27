const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/callback`;
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-modify-playback-state',
  'user-read-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
];

export const getAuthUrl = () => {
  const state = generateRandomString(16);
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'token',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    state: state,
    show_dialog: 'true', // Force show the auth dialog
  });

  // Store state in localStorage to prevent CSRF attacks
  localStorage.setItem('spotify_auth_state', state);

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const getAccessToken = (): string | null => {
  try {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    // Verify state to prevent CSRF attacks
    const state = params.get('state');
    const storedState = localStorage.getItem('spotify_auth_state');
    
    if (!state || state !== storedState) {
      throw new Error('State mismatch. Possible CSRF attack.');
    }

    // Clear stored state
    localStorage.removeItem('spotify_auth_state');

    const accessToken = params.get('access_token');
    if (!accessToken) {
      throw new Error('No access token found in URL');
    }

    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

// Helper function to generate random string for state
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

// Utility function to check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch {
    return true; // If we can't decode the token, assume it's expired
  }
};

export const fetchUserProfile = async (token: string) => {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
};

export const fetchTopTracks = async (token: string, timeRange = 'short_term') => {
  const response = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=10`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) {
    throw new Error('Failed to fetch top tracks');
  }
  return response.json();
};

export const fetchTopArtists = async (token: string, timeRange = 'short_term') => {
  const response = await fetch(
    `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=10`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) {
    throw new Error('Failed to fetch top artists');
  }
  return response.json();
};
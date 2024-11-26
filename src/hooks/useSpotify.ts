import { useQuery } from 'react-query';
import { fetchUserProfile, fetchTopTracks, fetchTopArtists } from '../utils/spotify';

export function useSpotifyData() {
  const token = localStorage.getItem('spotify_access_token');

  const { data: profile, isLoading: profileLoading } = useQuery(
    'profile',
    () => fetchUserProfile(token!),
    { enabled: !!token }
  );

  const { data: topTracks, isLoading: tracksLoading } = useQuery(
    'topTracks',
    () => fetchTopTracks(token!),
    { enabled: !!token }
  );

  const { data: topArtists, isLoading: artistsLoading } = useQuery(
    'topArtists',
    () => fetchTopArtists(token!),
    { enabled: !!token }
  );

  return {
    profile,
    topTracks,
    topArtists,
    isLoading: profileLoading || tracksLoading || artistsLoading,
    isAuthenticated: !!token,
    accessToken: token,
  };
}
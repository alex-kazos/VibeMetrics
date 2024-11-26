import React, { useState } from 'react';
import { useQuery } from 'react-query';
import useSpotifyAuth from '../hooks/useSpotifyAuth';
import Header from '../components/Header';
import ViewToggle, { ViewMode } from '../components/ViewToggle';
import { formatDuration } from '../utils/formatDuration';
import { Clock, Play, Music } from 'lucide-react';

interface Playlist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
    href: string;
  };
  owner: {
    display_name: string;
  };
  uri: string;
}

const Playlists: React.FC = () => {
  const { accessToken } = useSpotifyAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('grid-3');

  const { data: playlists, isLoading, error } = useQuery<{ items: Playlist[] }>(
    'playlists',
    async () => {
      const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch playlists');
      return response.json();
    },
    {
      enabled: !!accessToken,
      staleTime: 300000,
      retry: 2,
    }
  );

  const { data: playlistsDetails } = useQuery(
    ['playlistsDetails', playlists?.items],
    async () => {
      if (!playlists?.items) return [];
      
      const details = await Promise.all(
        playlists.items.map(async (playlist) => {
          try {
            const response = await fetch(playlist.tracks.href, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            if (!response.ok) return null;
            const data = await response.json();
            return {
              id: playlist.id,
              totalDuration: data.items.reduce(
                (acc: number, item: any) => acc + (item.track?.duration_ms || 0),
                0
              ),
            };
          } catch (error) {
            console.error(`Error fetching details for playlist ${playlist.id}:`, error);
            return null;
          }
        })
      );
      
      return details.filter(Boolean);
    },
    {
      enabled: !!playlists?.items && !!accessToken,
      retry: 2,
    }
  );

  const getPlaylistDuration = (playlistId: string) => {
    const details = playlistsDetails?.find(d => d?.id === playlistId);
    if (!details) return '...';
    return formatDuration(Math.floor(details.totalDuration / (1000 * 60)));
  };

  const handlePlayPlaylist = async (uri: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context_uri: uri,
        }),
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to play playlist');
      }
    } catch (error) {
      console.error('Error playing playlist:', error);
      alert('Failed to play playlist. Make sure you have an active Spotify device.');
    }
  };

  const renderGrid = () => {
    if (!playlists?.items?.length) {
      return (
        <div className="text-center text-gray-400 py-12">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No playlists found</p>
        </div>
      );
    }

    return (
      <div className={`grid gap-6 ${
        viewMode === 'grid-4' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
        viewMode === 'grid-3' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
        'grid-cols-1'
      }`}>
        {playlists.items.map((playlist) => (
          <div
            key={playlist.id}
            className={`bg-gray-800 rounded-xl overflow-hidden ${
              viewMode === 'list' ? 'flex items-center' : ''
            }`}
          >
            <div className={`relative group ${viewMode === 'list' ? 'w-20 h-20' : 'aspect-square'}`}>
              {playlist.images && playlist.images.length > 0 ? (
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <Music className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <button
                onClick={() => handlePlayPlaylist(`spotify:playlist:${playlist.id}`)}
                className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Play className="w-12 h-12 text-white" />
              </button>
            </div>
            <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex items-center justify-between' : ''}`}>
              <div>
                <h3 className="font-bold text-white truncate">{playlist.name}</h3>
                {viewMode !== 'list' && (
                  <p className="text-sm text-gray-400 mt-1 truncate">
                    {playlist.description || `By ${playlist.owner.display_name}`}
                  </p>
                )}
              </div>
              <div className={`flex items-center text-gray-400 text-sm ${viewMode === 'list' ? 'ml-4' : 'mt-2'}`}>
                <Clock className="w-4 h-4 mr-1" />
                <span>{getPlaylistDuration(playlist.id)}</span>
                <span className="mx-2">•</span>
                <span>{playlist.tracks.total} tracks</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            <div className="grid grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl">
                  <div className="aspect-square bg-gray-700"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400 py-12">
            <p>Failed to load playlists. Please try again later.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Your Playlists</h1>
          <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
        </div>
        {renderGrid()}
      </main>
    </div>
  );
};

export default Playlists;

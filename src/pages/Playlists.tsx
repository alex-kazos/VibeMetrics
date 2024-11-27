import React, { useState } from 'react';
import { useQuery } from 'react-query';
import useSpotifyAuth from '../hooks/useSpotifyAuth';
import Header from '../components/Header';
import ViewToggle, { ViewMode } from '../components/ViewToggle';
import { formatDuration } from '../utils/formatDuration';
import { Clock, Play, Music, Share2 } from 'lucide-react';
import PreviewModal from '../components/PreviewModal';
import PlaylistTracksModal from '../components/PlaylistTracksModal';
import ShareModal from '../components/ShareModal';
import NowPlaying from '../components/NowPlaying';
import ErrorBoundary from '../components/ErrorBoundary';

// ... interfaces remain the same ...

const PlaylistsContent: React.FC = () => {
  const { accessToken } = useSpotifyAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('grid-3');
  const [selectedPlaylist, setSelectedPlaylist] = useState<SelectedPlaylist | null>(null);
  const [previewTrack, setPreviewTrack] = useState<PreviewTrack | null>(null);
  const [sharePlaylist, setSharePlaylist] = useState<{ id: string; name: string } | null>(null);

  // Fetch playlists
  const { data: playlists, isLoading: playlistsLoading, error: playlistsError } = useQuery<{ items: Playlist[] }>(
    ['playlists', accessToken],
    async () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch playlists');
      }

      return response.json();
    },
    {
      enabled: !!accessToken,
      staleTime: 300000,
      retry: 2,
      onError: (error) => {
        console.error('Error fetching playlists:', error);
      },
    }
  );

  // Fetch playlist details
  const { data: playlistsDetails } = useQuery<PlaylistDetails[]>(
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
              tracks: data.items,
            };
          } catch (error) {
            console.error(`Error fetching details for playlist ${playlist.id}:`, error);
            return null;
          }
        })
      );

      return details.filter(Boolean) as PlaylistDetails[];
    },
    {
      enabled: !!playlists?.items && !!accessToken,
      retry: 2,
    }
  );

  const getPlaylistDuration = (playlistId: string) => {
    const details = playlistsDetails?.find((d) => d?.id === playlistId);
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

  const handlePreviewTrack = (track: Track['track']) => {
    if (!track.preview_url) {
      alert('No preview available for this track');
      return;
    }

    setPreviewTrack({
      id: track.id,
      name: track.name,
      artistName: track.artists.map((a) => a.name).join(', '),
      previewUrl: track.preview_url,
      albumArt: track.album.images[0]?.url,
    });
  };

  const handlePlayTrack = async (uri: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [uri],
        }),
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to play track');
      }
    } catch (error) {
      console.error('Error playing track:', error);
      alert('Failed to play track. Make sure you have an active Spotify device.');
    }
  };

  const handleShowTracks = async (playlist: Playlist) => {
    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch playlist tracks');
      }

      const data = await response.json();
      
      setSelectedPlaylist({
        id: playlist.id,
        name: playlist.name,
        image: playlist.images[0]?.url,
        tracks: data.items,
      });
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      alert('Failed to load playlist tracks. Please try again.');
    }
  };

  const renderContent = () => {
    if (playlistsLoading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (playlistsError || !playlists?.items) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <p className="text-red-500 mb-4">Error loading playlists</p>
          <p className="text-gray-400">
            {playlistsError instanceof Error ? playlistsError.message : 'Please try again later'}
          </p>
        </div>
      );
    }

    if (!playlists.items.length) {
      return (
        <div className="text-center text-gray-400 mt-8">
          <p>No playlists found</p>
        </div>
      );
    }

    return (
      <div className={`grid gap-4 ${
        viewMode === 'grid-4' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
        viewMode === 'grid-3' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
        'grid-cols-1'
      }`}>
        {playlists?.items?.map((playlist) => (
          playlist && (
            <div
              key={playlist.id}
              className={`bg-gray-800 rounded-xl overflow-hidden ${
                viewMode === 'list' ? 'flex items-center pl-4' : ''
              } transition-all duration-200 hover:bg-gray-750`}
            >
              {/* Cover Art Section */}
              <div className={`relative group ${
                viewMode === 'list' ? 'w-20 h-20 flex-shrink-0' : 'aspect-square'
              }`}>
                {playlist?.images?.[0]?.url ? (
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                    <Music className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4 rounded-lg">
                  <button
                    onClick={() => handlePlayPlaylist(`spotify:playlist:${playlist.id}`)}
                    className="text-white hover:text-green-500 transition-colors"
                  >
                    <Play className="w-8 h-8" />
                  </button>
                  <button
                    onClick={() => setSharePlaylist({ id: playlist.id, name: playlist.name })}
                    className="text-white hover:text-blue-500 transition-colors"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content Section */}
              <div className={`flex ${
                viewMode === 'list' ? 'flex-1 flex-row items-center px-6 py-4' : 'flex-col p-4'
              }`}>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-lg truncate">{playlist.name}</h3>
                  <p className="text-sm text-gray-400 truncate">
                    {playlist.description || `By ${playlist.owner.display_name}`}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center text-gray-400 text-sm space-x-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{getPlaylistDuration(playlist.id)}</span>
                    </div>
                    <div className="flex items-center">
                      <Music className="w-4 h-4 mr-1" />
                      <span>{playlist.tracks.total}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleShowTracks(playlist)}
                    className="ml-4 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                  >
                    Show tracks
                  </button>
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Playlists</h1>
          <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
        </div>
        {renderContent()}
      </main>
      <ShareModal
        isOpen={!!sharePlaylist}
        onClose={() => setSharePlaylist(null)}
        title={sharePlaylist?.name || ''}
        url={`https://open.spotify.com/playlist/${sharePlaylist?.id}`}
        description="Check out this playlist on Spotify"
      />
      <PlaylistTracksModal
        isOpen={!!selectedPlaylist}
        onClose={() => setSelectedPlaylist(null)}
        playlistName={selectedPlaylist?.name || ''}
        playlistImage={selectedPlaylist?.image}
        tracks={selectedPlaylist?.tracks || []}
        onPlayTrack={handlePlayTrack}
        onPreviewTrack={handlePreviewTrack}
        playlistId={selectedPlaylist?.id || ''}
      />
      <PreviewModal
        isOpen={!!previewTrack}
        onClose={() => setPreviewTrack(null)}
        track={previewTrack}
      />
      <NowPlaying accessToken={accessToken} />
    </div>
  );
};

const Playlists: React.FC = () => {
  return (
    <ErrorBoundary>
      <PlaylistsContent />
    </ErrorBoundary>
  );
};

export default Playlists;

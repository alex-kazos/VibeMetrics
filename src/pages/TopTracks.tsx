import React, { useState } from 'react';
import { useQuery } from 'react-query';
import useSpotifyAuth from '../hooks/useSpotifyAuth';
import Header from '../components/Header';
import { formatDuration } from '../utils/formatDuration';
import { Play, Headphones, Share2, Music } from 'lucide-react';
import PreviewModal from '../components/PreviewModal';
import ShareModal from '../components/ShareModal';

interface Track {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  uri: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
}

interface PreviewTrack {
  id: string;
  name: string;
  artistName: string;
  previewUrl: string;
  albumArt?: string;
}

const TopTracks: React.FC = () => {
  const { accessToken } = useSpotifyAuth();
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');
  const [previewTrack, setPreviewTrack] = useState<PreviewTrack | null>(null);
  const [shareTrack, setShareTrack] = useState<Track | null>(null);

  const { data: tracks, isLoading, error } = useQuery<Track[]>(
    ['top-tracks', timeRange],
    async () => {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch top tracks');
      const data = await response.json();
      return data.items;
    },
    {
      enabled: !!accessToken,
      staleTime: 300000,
    }
  );

  const handlePreviewTrack = (track: Track) => {
    if (!track.preview_url) {
      alert('No preview available for this track');
      return;
    }

    setPreviewTrack({
      id: track.id,
      name: track.name,
      artistName: track.artists.map(a => a.name).join(', '),
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-700 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/4"></div>
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
            <p>Failed to load top tracks. Please try again later.</p>
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
          <h1 className="text-2xl font-bold text-white">Your Top Tracks</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setTimeRange('short_term')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === 'short_term'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setTimeRange('medium_term')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === 'medium_term'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Last 6 Months
            </button>
            <button
              onClick={() => setTimeRange('long_term')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === 'long_term'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {tracks?.map((track, index) => (
            <div
              key={track.id}
              className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4 group hover:bg-gray-700 transition-colors"
            >
              <div className="w-16 h-16 relative group">
                {track.album.images[0] ? (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
                    <Music className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 text-lg font-bold w-8">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-white font-medium truncate">{track.name}</h3>
                    <p className="text-gray-400 text-sm truncate">
                      {track.artists.map(a => a.name).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-gray-400 text-sm">
                {formatDuration(Math.floor(track.duration_ms / (1000 * 60)))}
              </div>
              <div className="flex items-center space-x-2">
                {track.preview_url && (
                  <button
                    onClick={() => handlePreviewTrack(track)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Headphones className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handlePlayTrack(track.uri)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Play className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShareTrack(track)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Preview Modal */}
      {previewTrack && (
        <PreviewModal
          isOpen={true}
          onClose={() => setPreviewTrack(null)}
          trackName={previewTrack.name}
          artistName={previewTrack.artistName}
          previewUrl={previewTrack.previewUrl}
          albumArt={previewTrack.albumArt}
        />
      )}

      {/* Share Modal */}
      {shareTrack && (
        <ShareModal
          isOpen={true}
          onClose={() => setShareTrack(null)}
          title={shareTrack.name}
          url={`https://open.spotify.com/track/${shareTrack.id}`}
          description={`By ${shareTrack.artists.map(a => a.name).join(', ')}`}
        />
      )}
    </div>
  );
};

export default TopTracks;

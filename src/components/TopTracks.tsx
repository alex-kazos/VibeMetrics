import React from 'react';
import { useQuery } from 'react-query';
import useSpotifyAuth from '../hooks/useSpotifyAuth';
import { TimeRange } from './DateFilter';
import { formatDuration } from '../utils/formatDuration';
import { Play, Clock } from 'lucide-react';

interface TopTracksProps {
  timeRange: TimeRange;
  selectedGenre: string | null;
}

const TopTracks: React.FC<TopTracksProps> = ({ timeRange, selectedGenre }) => {
  const { accessToken } = useSpotifyAuth();

  const { data: topTracks, isLoading } = useQuery(
    ['topTracks', timeRange],
    async () => {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch top tracks');
      return response.json();
    },
    {
      enabled: !!accessToken,
      staleTime: 300000,
    }
  );

  const { data: trackGenres } = useQuery(
    ['trackGenres', topTracks?.items],
    async () => {
      if (!topTracks?.items) return new Map();

      const artistIds = [...new Set(topTracks.items.flatMap(track => 
        track.artists.map(artist => artist.id)
      ))];

      const response = await fetch(
        `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) return new Map();
      
      const data = await response.json();
      return data.artists.reduce((acc: Map<string, string[]>, artist: any) => {
        acc.set(artist.id, artist.genres);
        return acc;
      }, new Map());
    },
    {
      enabled: !!topTracks?.items && !!accessToken,
    }
  );

  const filteredTracks = React.useMemo(() => {
    if (!topTracks?.items || !trackGenres) return [];
    
    return topTracks.items
      .filter(track => {
        if (!selectedGenre) return true;
        return track.artists.some(artist => {
          const genres = trackGenres.get(artist.id) || [];
          return genres.includes(selectedGenre);
        });
      })
      .slice(0, 10);
  }, [topTracks?.items, trackGenres, selectedGenre]);

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
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-700 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">
        Top Tracks {selectedGenre && `(${selectedGenre})`}
      </h2>
      <div className="space-y-4">
        {filteredTracks.map((track, index) => (
          <div
            key={track.id}
            className="flex items-center gap-4 group hover:bg-gray-700 p-2 rounded-lg transition-colors"
          >
            <div className="w-8 text-gray-400 text-sm">{index + 1}</div>
            <div className="relative w-12 h-12 flex-shrink-0">
              <img
                src={track.album.images[0].url}
                alt={track.name}
                className="w-full h-full object-cover rounded"
              />
              <button
                onClick={() => handlePlayTrack(track.uri)}
                className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded"
              >
                <Play className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">{track.name}</div>
              <div className="text-gray-400 text-sm truncate">
                {track.artists.map(artist => artist.name).join(', ')}
              </div>
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {formatDuration(Math.floor(track.duration_ms / (1000 * 60)))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopTracks;
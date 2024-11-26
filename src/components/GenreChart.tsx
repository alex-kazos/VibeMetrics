import React from 'react';
import { useQuery } from 'react-query';
import useSpotifyAuth from '../hooks/useSpotifyAuth';
import { TimeRange } from './DateFilter';

interface GenreChartProps {
  timeRange: TimeRange;
  onGenreClick: (genre: string) => void;
  selectedGenre: string | null;
}

const GenreChart: React.FC<GenreChartProps> = ({ 
  timeRange, 
  onGenreClick,
  selectedGenre 
}) => {
  const { accessToken } = useSpotifyAuth();

  const { data: topTracks } = useQuery(
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

  const { data: artistGenres } = useQuery(
    ['artistGenres', topTracks?.items],
    async () => {
      if (!topTracks?.items) return new Map();
      
      const artistIds = [...new Set(topTracks.items.flatMap(track => 
        track.artists.map(artist => artist.id)
      ))];

      if (artistIds.length === 0) return new Map();

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

  // Calculate genre frequencies
  const genreFrequencies = React.useMemo(() => {
    if (!topTracks?.items || !artistGenres) return new Map<string, number>();

    const frequencies = new Map<string, number>();
    topTracks.items.forEach(track => {
      track.artists.forEach(artist => {
        const genres = artistGenres.get(artist.id) || [];
        genres.forEach(genre => {
          frequencies.set(genre, (frequencies.get(genre) || 0) + 1);
        });
      });
    });

    return new Map([...frequencies.entries()].sort((a, b) => b[1] - a[1]));
  }, [topTracks, artistGenres]);

  // Get top 10 genres
  const topGenres = React.useMemo(() => {
    return Array.from(genreFrequencies.entries())
      .slice(0, 10)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: Math.round((count / (topTracks?.items?.length || 1)) * 100)
      }));
  }, [genreFrequencies, topTracks?.items?.length]);

  if (!topGenres.length) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Top Genres</h2>
        <div className="text-gray-400 text-center py-4">
          Loading genre data...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Top Genres</h2>
      <div className="space-y-3">
        {topGenres.map(({ genre, count, percentage }) => (
          <button
            key={genre}
            onClick={() => onGenreClick(genre)}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${
                selectedGenre === genre ? 'text-green-500' : 'text-gray-300'
              }`}>
                {genre}
              </span>
              <span className="text-xs text-gray-400">{count} tracks</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  selectedGenre === genre ? 'bg-green-500' : 'bg-gray-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreChart;
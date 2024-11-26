import React from 'react';
import { useQuery } from 'react-query';
import useSpotifyAuth from '../hooks/useSpotifyAuth';
import { TimeRange } from './DateFilter';
import { X } from 'lucide-react';

interface GenreChartProps {
  timeRange: TimeRange;
  onGenreClick: (genre: string | null) => void;
  selectedGenre: string | null;
}

const GenreChart: React.FC<GenreChartProps> = ({ 
  timeRange, 
  onGenreClick,
  selectedGenre 
}) => {
  const { accessToken } = useSpotifyAuth();

  // Fetch top artists with pagination
  const { data: topArtists, isLoading: isLoadingArtists } = useQuery(
    ['topArtists', timeRange],
    async () => {
      const limit = 20; // Reduced from 50 to ensure we don't hit API limits
      const pages = 2; // Fetch 2 pages for a total of 40 artists
      let allArtists = [];

      for (let offset = 0; offset < limit * pages; offset += limit) {
        const response = await fetch(
          `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}&offset=${offset}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch top artists');
        }

        const data = await response.json();
        allArtists = [...allArtists, ...data.items];

        // If we get fewer items than the limit, we've reached the end
        if (data.items.length < limit) break;
      }

      return { items: allArtists };
    },
    {
      enabled: !!accessToken,
      staleTime: 300000,
      retry: 1,
    }
  );

  // Calculate genre frequencies
  const genreFrequencies = React.useMemo(() => {
    if (!topArtists?.items) return new Map<string, number>();

    const frequencies = new Map<string, number>();
    topArtists.items.forEach(artist => {
      artist.genres.forEach(genre => {
        frequencies.set(genre, (frequencies.get(genre) || 0) + 1);
      });
    });

    return new Map([...frequencies.entries()].sort((a, b) => b[1] - a[1]));
  }, [topArtists]);

  // Get top 10 genres
  const topGenres = React.useMemo(() => {
    return Array.from(genreFrequencies.entries())
      .slice(0, 10)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: Math.round((count / (topArtists?.items?.length || 1)) * 100)
      }));
  }, [genreFrequencies, topArtists?.items?.length]);

  const handleGenreClick = (genre: string) => {
    onGenreClick(selectedGenre === genre ? null : genre);
  };

  if (isLoadingArtists) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Top Genres</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-2 bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!topGenres.length) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Top Genres</h2>
        <div className="text-gray-400 text-center py-4">
          No genre data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Top Genres</h2>
        {selectedGenre && (
          <button
            onClick={() => onGenreClick(null)}
            className="text-gray-400 hover:text-white transition-colors flex items-center text-sm"
          >
            Clear filter <X className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>
      <div className="space-y-3">
        {topGenres.map(({ genre, count, percentage }) => (
          <button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className="w-full text-left group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${
                selectedGenre === genre ? 'text-green-500' : 'text-gray-300 group-hover:text-white'
              } transition-colors`}>
                {genre}
              </span>
              <span className="text-xs text-gray-400">{count} artists</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  selectedGenre === genre ? 'bg-green-500' : 'bg-gray-600 group-hover:bg-gray-500'
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
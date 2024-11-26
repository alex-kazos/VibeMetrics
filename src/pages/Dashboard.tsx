import React, { useState } from 'react';
import { useQuery } from 'react-query';
import Header from '../components/Header';
import TopTracks from '../components/TopTracks';
import GenreChart from '../components/GenreChart';
import DateFilter, { TimeRange } from '../components/DateFilter';
import NowPlaying from '../components/NowPlaying';
import useSpotifyAuth from '../hooks/useSpotifyAuth';
import { formatDuration } from '../utils/formatDuration';
import { Clock } from 'lucide-react';
import ListenerPersonality from '../components/ListenerPersonality';

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('short_term');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
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

  const totalMinutes = React.useMemo(() => {
    if (!topTracks?.items) return 0;
    const totalMs = topTracks.items.reduce(
      (acc: number, item: any) => acc + (item.duration_ms || 0),
      0
    );
    return Math.floor(totalMs / (1000 * 60));
  }, [topTracks]);

  const handleGenreClick = (genre: string | null) => {
    setSelectedGenre(genre);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 mb-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Your Music Overview</h1>
          <DateFilter selectedRange={timeRange} onRangeChange={setTimeRange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Total Minutes</h3>
              <p className="text-2xl font-bold text-white mt-1">
                {formatDuration(totalMinutes)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <TopTracks
              timeRange={timeRange}
              selectedGenre={selectedGenre}
            />
          </div>
          <div className="space-y-6">
            <GenreChart
              timeRange={timeRange}
              onGenreClick={handleGenreClick}
              selectedGenre={selectedGenre}
            />
            <ListenerPersonality 
              genres={topTracks?.items.flatMap(track => 
                track.artists.flatMap(artist => artist.genres || [])
              ).filter(Boolean) || []}
            />
          </div>
        </div>
      </main>
      <NowPlaying accessToken={accessToken} />
    </div>
  );
};

export default Dashboard;
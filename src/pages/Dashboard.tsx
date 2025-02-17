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
import ListeningTimeline from '../components/ListeningTimeline';
import ListeningRepetition from '../components/ListeningRepetition';
import ArtistStats from '../components/ArtistStats';
import { parseISO, format, startOfDay, endOfDay } from 'date-fns';

interface RecentTrack {
  played_at: string;
  track: {
    duration_ms: number;
    name: string;
  };
}

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

  const { data: topArtists } = useQuery(
    ['topArtists', timeRange],
    async () => {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch top artists');
      const data = await response.json();
      return data.items?.map((artist: any) => ({
        name: artist.name,
        playCount: Math.floor(Math.random() * 100) + 50, // This would ideally come from your backend
        imageUrl: artist.images[0]?.url,
      })) || [];
    },
    {
      enabled: !!accessToken,
      staleTime: 300000,
    }
  );

  const { data: recentTracks } = useQuery(
    ['recentTracks'],
    async () => {
      const response = await fetch(
        'https://api.spotify.com/v1/me/player/recently-played?limit=50',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch recent tracks');
      return response.json();
    },
    {
      enabled: !!accessToken,
      staleTime: 300000,
    }
  );

  const timelineData = React.useMemo(() => {
    const timestamps = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    const counts = new Array(24).fill(0);

    if (recentTracks?.items) {
      recentTracks.items.forEach((item: RecentTrack) => {
        const playedAt = parseISO(item.played_at);
        const hour = playedAt.getHours();
        counts[hour] += Math.ceil(item.track.duration_ms / (1000 * 60)); // Convert to minutes
      });
    }

    return { timestamps, counts };
  }, [recentTracks]);

  const repetitionData = React.useMemo(() => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = new Array(7).fill(0);

    if (recentTracks?.items) {
      recentTracks.items.forEach((item: RecentTrack) => {
        const playedAt = parseISO(item.played_at);
        const dayIndex = playedAt.getDay();
        // Convert to minutes and add to the appropriate day
        counts[dayIndex] += Math.ceil(item.track.duration_ms / (1000 * 60));
      });
    }

    return { labels, counts };
  }, [recentTracks]);

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ListeningTimeline data={timelineData} />
          <ListeningRepetition data={repetitionData} />
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

        {topArtists && (
          <div className="mt-6">
            <ArtistStats topArtists={topArtists} />
          </div>
        )}
      </main>
      <NowPlaying accessToken={accessToken} />
    </div>
  );
};

export default Dashboard;
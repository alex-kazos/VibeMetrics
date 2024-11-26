import React from 'react';
import { Clock, Users, Disc } from 'lucide-react';
import { useQuery } from 'react-query';
import { TimeRange } from '../components/DateFilter';

interface ListeningStatsProps {
  timeRange: TimeRange;
}

const ListeningStats: React.FC<ListeningStatsProps> = ({ timeRange }) => {
  const token = localStorage.getItem('spotify_access_token');

  const { data: topArtists } = useQuery(
    ['topArtists', timeRange],
    async () => {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch top artists');
      return response.json();
    },
    {
      enabled: !!token,
      staleTime: 300000,
    }
  );

  const { data: topTracks } = useQuery(
    ['topTracks', timeRange],
    async () => {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch top tracks');
      return response.json();
    },
    {
      enabled: !!token,
      staleTime: 300000,
    }
  );

  const stats = [
    {
      label: 'Unique Artists',
      value: topArtists?.items.length || 0,
      icon: Users,
      change: timeRange === 'short_term' ? 'Last 4 Weeks' : timeRange === 'medium_term' ? 'Last 6 Months' : 'All Time',
    },
    {
      label: 'Top Tracks',
      value: topTracks?.items.length || 0,
      icon: Disc,
      change: timeRange === 'short_term' ? 'Last 4 Weeks' : timeRange === 'medium_term' ? 'Last 6 Months' : 'All Time',
    },
    {
      label: 'Total Minutes',
      value: Math.round((topTracks?.items || []).reduce((acc: number, track: any) => acc + track.duration_ms / 1000 / 60, 0)),
      icon: Clock,
      change: timeRange === 'short_term' ? 'Last 4 Weeks' : timeRange === 'medium_term' ? 'Last 6 Months' : 'All Time',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold mt-1 text-white">{stat.value}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <stat.icon className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-400 text-sm">{stat.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListeningStats;
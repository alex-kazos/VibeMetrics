import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ArtistStatsProps {
  topArtists: Array<{
    name: string;
    playCount: number;
    imageUrl: string;
  }>;
}

const ArtistStats: React.FC<ArtistStatsProps> = ({ topArtists = [] }) => {
  if (!Array.isArray(topArtists) || topArtists.length === 0) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg">
        <p className="text-gray-400 text-center">No artist data available</p>
      </div>
    );
  }

  const chartData = {
    labels: topArtists.map(artist => artist.name),
    datasets: [
      {
        label: 'Plays',
        data: topArtists.map(artist => artist.playCount),
        backgroundColor: 'rgb(29, 185, 84)',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Most Played Artists',
        color: '#fff',
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#fff',
        },
      },
    },
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <div className="flex gap-4">
        <div className="w-2/3">
          <Bar data={chartData} options={options} />
        </div>
        <div className="w-1/3">
          <h3 className="text-white text-lg font-semibold mb-4">Top Artists</h3>
          <div className="space-y-4">
            {topArtists.slice(0, 5).map((artist, index) => (
              <div key={artist.name} className="flex items-center gap-3">
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-white font-medium">{artist.name}</p>
                  <p className="text-gray-400 text-sm">{artist.playCount} plays</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistStats; 
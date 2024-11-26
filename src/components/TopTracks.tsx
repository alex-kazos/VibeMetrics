import React, { useState, useEffect } from 'react';
import { PlayCircle, Clock, Heart } from 'lucide-react';
import { useQuery } from 'react-query';
import { TimeRange } from './DateFilter';
import useSpotifyAuth from '../hooks/useSpotifyAuth';

interface Track {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  uri: string;
}

interface TopTracksProps {
  timeRange: TimeRange;
  selectedGenre?: string | null;
}

const TopTracks: React.FC<TopTracksProps> = ({ timeRange, selectedGenre }) => {
  const { accessToken } = useSpotifyAuth();
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);

  const { data: topTracks, isLoading } = useQuery<{ items: Track[] }>(
    ['topTracks', timeRange],
    async () => {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch top tracks');
      }
      return response.json();
    },
    {
      enabled: !!accessToken,
      staleTime: 300000,
    }
  );

  // Fetch genres for tracks
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
      const genreMap = new Map();
      
      data.artists.forEach((artist: { id: string; genres: string[] }) => {
        genreMap.set(artist.id, artist.genres);
      });
      
      return genreMap;
    },
    {
      enabled: !!topTracks?.items && !!accessToken,
    }
  );

  // Filter tracks by genre
  useEffect(() => {
    if (!topTracks?.items) {
      setFilteredTracks([]);
      return;
    }

    if (!selectedGenre) {
      setFilteredTracks(topTracks.items);
      return;
    }

    const filtered = topTracks.items.filter(track => {
      const artistGenresList = track.artists
        .map(artist => artistGenres?.get(artist.id) || [])
        .flat();
      return artistGenresList.includes(selectedGenre);
    });

    setFilteredTracks(filtered);
  }, [topTracks?.items, selectedGenre, artistGenres]);

  const playTrack = async (uri: string) => {
    try {
      const deviceResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (!deviceResponse.ok) {
        throw new Error('Failed to fetch devices');
      }
      
      const devices = await deviceResponse.json();
      
      if (!devices.devices.length) {
        alert('No active Spotify devices found. Please open Spotify on any device first.');
        return;
      }

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
        if (response.status === 401) {
          alert('Your session has expired. Please log out and log back in.');
          return;
        }
        throw new Error('Failed to play track');
      }
    } catch (error) {
      console.error('Error playing track:', error);
      alert('Failed to play track. Make sure you have an active Spotify device and are a Premium user.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-700 rounded-md"></div>
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
    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">
        Top Tracks {selectedGenre && `(${selectedGenre})`}
      </h2>
      <div className="space-y-4">
        {filteredTracks.map((track: Track) => (
          <div
            key={track.id}
            className="flex items-center space-x-4 hover:bg-gray-700 p-2 rounded-lg transition group"
          >
            <img
              src={track.album.images[0].url}
              alt={track.name}
              className="w-16 h-16 rounded-md object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{track.name}</h3>
              <p className="text-gray-400">{track.artists[0].name}</p>
            </div>
            <div className="flex items-center space-x-4 text-gray-400">
              <button
                onClick={() => playTrack(track.uri)}
                className="opacity-0 group-hover:opacity-100 hover:text-green-500 transition"
              >
                <PlayCircle className="w-8 h-8" />
              </button>
              <button className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition">
                <Heart className="w-6 h-6" />
              </button>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-1" />
                <span>
                  {Math.round(track.duration_ms / 1000 / 60)}:
                  {String(Math.round((track.duration_ms / 1000) % 60)).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filteredTracks.length === 0 && (
          <div className="text-gray-400 text-center py-4">
            No tracks found for the selected genre.
          </div>
        )}
      </div>
    </div>
  );
};

export default TopTracks;
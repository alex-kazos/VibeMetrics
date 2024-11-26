import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import useSpotifyAuth from '../hooks/useSpotifyAuth';

interface NowPlayingProps {
  formatDuration: (minutes: number) => string;
}

interface PlaybackState {
  is_playing: boolean;
  item: {
    name: string;
    artists: Array<{ name: string }>;
    album: {
      images: Array<{ url: string }>;
    };
    duration_ms: number;
  };
  progress_ms: number;
  device: {
    name: string;
    volume_percent: number;
  };
}

const NowPlaying: React.FC<NowPlayingProps> = ({ formatDuration }) => {
  const { accessToken } = useSpotifyAuth();
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaybackState = async () => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 204) {
        setError('No active device found');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch playback state');
      }

      const data = await response.json();
      setPlaybackState(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch playback state');
      console.error(err);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchPlaybackState();
      const interval = setInterval(fetchPlaybackState, 1000);
      return () => clearInterval(interval);
    }
  }, [accessToken]);

  const handlePlayPause = async () => {
    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/${playbackState?.is_playing ? 'pause' : 'play'}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      fetchPlaybackState();
    } catch (err) {
      console.error('Failed to toggle playback:', err);
    }
  };

  const handleSkip = async (direction: 'next' | 'previous') => {
    try {
      await fetch(`https://api.spotify.com/v1/me/player/${direction}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      fetchPlaybackState();
    } catch (err) {
      console.error(`Failed to skip ${direction}:`, err);
    }
  };

  if (error || !playbackState?.item) {
    return (
      <div className="bg-gray-900 border-t border-gray-800 backdrop-blur-lg bg-opacity-95 p-4">
        <div className="container mx-auto">
          <div className="text-gray-400 text-center">
            {error || 'No track currently playing'}
          </div>
        </div>
      </div>
    );
  }

  const progress = (playbackState.progress_ms / playbackState.item.duration_ms) * 100;
  const totalMinutes = Math.floor(playbackState.item.duration_ms / (1000 * 60));

  return (
    <div className="bg-gray-900 border-t border-gray-800 backdrop-blur-lg bg-opacity-95">
      {/* Progress bar at the very top */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Player content */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-4">
            <img
              src={playbackState.item.album.images[0].url}
              alt={playbackState.item.name}
              className="w-12 h-12 rounded-md"
            />
            <div>
              <h3 className="text-white font-medium truncate max-w-[200px]">
                {playbackState.item.name}
              </h3>
              <p className="text-gray-400 text-sm truncate max-w-[200px]">
                {playbackState.item.artists[0].name}
              </p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleSkip('previous')}
              className="text-gray-400 hover:text-white transition"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={handlePlayPause}
              className="text-white bg-green-500 p-2 rounded-full hover:bg-green-600 transition"
            >
              {playbackState.is_playing ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => handleSkip('next')}
              className="text-gray-400 hover:text-white transition"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume and Time */}
          <div className="flex items-center space-x-4">
            <div className="text-gray-400 text-sm">
              {formatDuration(Math.floor(playbackState.progress_ms / (1000 * 60)))} /{' '}
              {formatDuration(totalMinutes)}
            </div>
            <div className="flex items-center text-gray-400">
              <Volume2 className="w-5 h-5 mr-2" />
              <span className="text-sm">{playbackState.device?.volume_percent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;

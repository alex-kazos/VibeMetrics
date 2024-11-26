import React, { useState } from 'react';
import { useQuery } from 'react-query';

interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    images: Array<{ url: string }>;
  };
}

interface Playlist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  tracks: { total: number };
}

interface PlaylistRecommendationsProps {
  accessToken: string;
}

const PlaylistRecommendations: React.FC<PlaylistRecommendationsProps> = ({ accessToken }) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const { data: userPlaylists, isLoading: playlistsLoading } = useQuery(
    'userPlaylists',
    async () => {
      const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch playlists');
      return response.json();
    },
    {
      enabled: !!accessToken,
      staleTime: 300000,
    }
  );

  const { data: recommendedTracks, isLoading: recommendationsLoading } = useQuery(
    ['recommendations', selectedPlaylistId],
    async () => {
      if (!selectedPlaylistId) return null;

      // First, get the tracks from the selected playlist
      const tracksResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${selectedPlaylistId}/tracks?limit=5`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!tracksResponse.ok) throw new Error('Failed to fetch playlist tracks');
      const tracksData = await tracksResponse.json();

      // Get seed tracks from the playlist
      const seedTracks = tracksData.items
        .slice(0, 5)
        .map((item: any) => item.track.id)
        .join(',');

      // Get recommendations based on seed tracks
      const recommendationsResponse = await fetch(
        `https://api.spotify.com/v1/recommendations?seed_tracks=${seedTracks}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!recommendationsResponse.ok) throw new Error('Failed to fetch recommendations');
      return recommendationsResponse.json();
    },
    {
      enabled: !!selectedPlaylistId && !!accessToken,
      staleTime: 300000,
    }
  );

  if (playlistsLoading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-white text-xl font-bold mb-4">Your Playlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-700 h-40 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-white text-xl font-bold mb-4">Your Playlists</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {userPlaylists?.items.map((playlist: Playlist) => (
          <div
            key={playlist.id}
            className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
            onClick={() => setSelectedPlaylistId(playlist.id)}
          >
            {playlist.images && playlist.images[0] && (
              <img
                src={playlist.images[0].url}
                alt={playlist.name}
                className="w-full h-40 object-cover rounded-lg mb-2"
              />
            )}
            <h3 className="text-white font-semibold">{playlist.name}</h3>
            <p className="text-gray-400">{playlist.tracks.total} tracks</p>
          </div>
        ))}
      </div>

      {recommendationsLoading && selectedPlaylistId && (
        <div>
          <h2 className="text-white text-xl font-bold mb-4">Loading Recommendations...</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-700 h-40 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendedTracks && recommendedTracks.tracks && (
        <div>
          <h2 className="text-white text-xl font-bold mb-4">Recommended Tracks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedTracks.tracks.map((track: Track) => (
              <div key={track.id} className="bg-gray-700 p-4 rounded-lg">
                {track.album.images && track.album.images[0] && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.name}
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="text-white font-semibold">{track.name}</h3>
                <p className="text-gray-400">
                  {track.artists.map((artist) => artist.name).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistRecommendations;

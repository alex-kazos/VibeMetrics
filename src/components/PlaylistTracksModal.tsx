import React from 'react';
import { X, Play, Headphones, Clock } from 'lucide-react';
import { formatDuration } from '../utils/formatDuration';

interface Track {
  track: {
    id: string;
    name: string;
    duration_ms: number;
    preview_url: string | null;
    uri: string;
    artists: Array<{ name: string }>;
    album: {
      name: string;
      images: Array<{ url: string }>;
    };
  };
}

interface PlaylistTracksModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistName: string;
  playlistImage?: string;
  tracks: Track[];
  onPlayTrack: (uri: string) => void;
  onPreviewTrack: (track: Track['track']) => void;
}

const PlaylistTracksModal: React.FC<PlaylistTracksModalProps> = ({
  isOpen,
  onClose,
  playlistName,
  playlistImage,
  tracks,
  onPlayTrack,
  onPreviewTrack,
}) => {
  if (!isOpen) return null;

  const totalDuration = tracks.reduce(
    (acc, { track }) => acc + (track?.duration_ms || 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 flex items-start border-b border-gray-700">
          <div className="w-32 h-32 flex-shrink-0">
            {playlistImage ? (
              <img
                src={playlistImage}
                alt={playlistName}
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No artwork</span>
              </div>
            )}
          </div>
          <div className="ml-6 flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{playlistName}</h2>
            <p className="text-gray-400">
              {tracks.length} tracks • {formatDuration(Math.floor(totalDuration / (1000 * 60)))}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            <div className="grid grid-cols-[auto,1fr,1fr,auto] gap-4 text-sm text-gray-400 border-b border-gray-700 pb-2">
              <div className="w-8">#</div>
              <div>Title</div>
              <div>Album</div>
              <div className="flex items-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            {tracks.map(({ track }, index) => track && (
              <div
                key={track.id}
                className="grid grid-cols-[auto,1fr,1fr,auto] gap-4 py-2 text-sm hover:bg-gray-700 rounded group items-center"
              >
                <div className="w-8 text-gray-400">{index + 1}</div>
                <div className="min-w-0 pr-4">
                  <div className="text-white truncate">{track.name}</div>
                  <div className="text-gray-400 truncate">
                    {track.artists.map(a => a.name).join(', ')}
                  </div>
                </div>
                <div className="text-gray-400 truncate">
                  {track.album.name}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400 w-12">
                    {formatDuration(Math.floor(track.duration_ms / (1000 * 60)))}
                  </div>
                  <div className="flex items-center space-x-2">
                    {track.preview_url && (
                      <button
                        onClick={() => onPreviewTrack(track)}
                        className="p-2 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Headphones className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onPlayTrack(track.uri)}
                      className="p-2 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistTracksModal;

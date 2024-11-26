import React, { useEffect, useState } from 'react';
import { X, Pause, Play } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackName: string;
  artistName: string;
  previewUrl: string;
  albumArt?: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  trackName,
  artistName,
  previewUrl,
  albumArt,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const audioElement = new Audio(previewUrl);
      audioElement.addEventListener('timeupdate', () => {
        setProgress((audioElement.currentTime / audioElement.duration) * 100);
      });
      audioElement.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });
      setAudio(audioElement);
      return () => {
        audioElement.pause();
        audioElement.remove();
      };
    }
  }, [isOpen, previewUrl]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.remove();
      }
    };
  }, [audio]);

  const handlePlayPause = () => {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 mb-4">
            {albumArt ? (
              <img
                src={albumArt}
                alt={`${trackName} album art`}
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No artwork</span>
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-white text-center mb-1">
            {trackName}
          </h3>
          <p className="text-sm text-gray-400 mb-4">{artistName}</p>
          
          <div className="w-full bg-gray-700 rounded-full h-1 mb-4">
            <div
              className="bg-green-500 h-1 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <button
            onClick={handlePlayPause}
            className="bg-green-500 hover:bg-green-400 text-white rounded-full p-3 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;

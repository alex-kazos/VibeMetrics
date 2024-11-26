import React from 'react';
import { Music, LogOut } from 'lucide-react';
import useSpotifyAuth from '../hooks/useSpotifyAuth';

const Header: React.FC = () => {
  const { logout } = useSpotifyAuth();

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-green-500" />
            <h1 className="text-2xl font-bold text-white">VibeMetrics</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
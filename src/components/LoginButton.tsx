import React from 'react';
import { LogIn } from 'lucide-react';
import { getAuthUrl } from '../utils/spotify';

export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors"
    >
      <LogIn className="w-5 h-5" />
      <span>Connect with Spotify</span>
    </button>
  );
}
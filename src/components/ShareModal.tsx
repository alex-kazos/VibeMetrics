import React, { useState } from 'react';
import { X, Copy, Share2, Twitter, Facebook, Link } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  description?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  description,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTwitterShare = () => {
    const text = `Check out ${title}${description ? `: ${description}` : ''} on Spotify`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Share2 className="w-5 h-5 text-white mr-2" />
              <h2 className="text-xl font-bold text-white">Share</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Share buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleTwitterShare}
                className="flex-1 flex items-center justify-center space-x-2 bg-[#1DA1F2] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                <Twitter className="w-5 h-5" />
                <span>Twitter</span>
              </button>
              <button
                onClick={handleFacebookShare}
                className="flex-1 flex items-center justify-center space-x-2 bg-[#4267B2] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                <Facebook className="w-5 h-5" />
                <span>Facebook</span>
              </button>
            </div>

            {/* Copy link section */}
            <div className="mt-4">
              <div className="text-sm text-gray-400 mb-2">Copy link</div>
              <div className="flex space-x-2">
                <div className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm truncate">
                  {url}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center bg-green-600 text-white px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {copied ? (
                    <span className="text-sm">Copied!</span>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

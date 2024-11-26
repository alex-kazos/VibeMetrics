import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeRange } from '../components/DateFilter';
import DateFilter from '../components/DateFilter';
import TopTracks from '../components/TopTracks';
import NowPlaying from '../components/NowPlaying';
import ViewToggle, { ViewMode } from '../components/ViewToggle';
import Header from '../components/Header';
import { formatDuration } from '../utils/formatDuration';
import GenreChart from '../components/GenreChart';
import ListeningStats from '../components/ListeningStats';
import useSpotifyAuth from '../hooks/useSpotifyAuth';

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('short_term');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid-3');
  const { accessToken, isAuthenticated } = useSpotifyAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const handleGenreClick = (genre: string) => {
    setSelectedGenre(selectedGenre === genre ? null : genre);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="pb-24"> {/* Added padding to account for fixed player */}
        <main className="container mx-auto px-4 py-8">
          {/* Controls Section */}
          <div className="mb-8 bg-gray-800 rounded-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <DateFilter selectedRange={timeRange} onRangeChange={setTimeRange} />
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="xl:col-span-2">
              <TopTracks 
                timeRange={timeRange} 
                selectedGenre={selectedGenre} 
                viewMode={viewMode}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <GenreChart 
                timeRange={timeRange} 
                onGenreClick={handleGenreClick}
                selectedGenre={selectedGenre}
              />
              <ListeningStats timeRange={timeRange} />
            </div>
          </div>
        </main>
      </div>

      {/* Fixed Player at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <NowPlaying accessToken={accessToken} formatDuration={formatDuration} />
      </div>
    </div>
  );
};

export default Dashboard;
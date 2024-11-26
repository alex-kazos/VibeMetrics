import React from 'react';
import { Grid2x2, Grid3x3, List } from 'lucide-react';

export type ViewMode = 'grid-3' | 'grid-4' | 'list';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  const views = [
    { mode: 'grid-3' as ViewMode, icon: Grid2x2, label: '3 per row' },
    { mode: 'grid-4' as ViewMode, icon: Grid3x3, label: '4 per row' },
    { mode: 'list' as ViewMode, icon: List, label: 'List view' },
  ];

  return (
    <div className="flex items-center space-x-2">
      {views.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => onViewChange(mode)}
          className={`p-2 rounded-lg transition-colors ${
            currentView === mode
              ? 'bg-green-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
          title={label}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
};

export default ViewToggle;

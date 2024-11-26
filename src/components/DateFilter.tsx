import React from 'react';

export type TimeRange = 'short_term' | 'medium_term' | 'long_term' | 'last_week';

interface DateFilterProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ selectedRange, onRangeChange }) => {
  const ranges = [
    { value: 'last_week', label: 'Last Week' },
    { value: 'short_term', label: 'Last 4 Weeks' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' },
  ] as const;

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-white mb-2 font-semibold">Time Range</h3>
      <div className="flex gap-2">
        {ranges.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onRangeChange(value)}
            className={`px-4 py-2 rounded ${
              selectedRange === value
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateFilter;

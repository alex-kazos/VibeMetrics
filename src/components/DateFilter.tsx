import React from 'react';

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

interface DateFilterProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ selectedRange, onRangeChange }) => {
  const ranges = [
    { value: 'short_term', label: 'Last Month' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' },
  ] as const;

  return (
    <div className="flex space-x-2">
      {ranges.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onRangeChange(value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedRange === value
              ? 'bg-green-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default DateFilter;

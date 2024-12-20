import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ListeningTimelineProps {
  data: {
    timestamps: string[];
    counts: number[];
  };
}

const ListeningTimeline: React.FC<ListeningTimelineProps> = ({ data }) => {
  const chartData = {
    labels: data.timestamps,
    datasets: [
      {
        label: 'Listening Activity',
        data: data.counts,
        borderColor: 'rgb(29, 185, 84)',
        backgroundColor: 'rgba(29, 185, 84, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Time Listened',
        color: '#fff',
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
        },
      },
    },
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ListeningTimeline; 
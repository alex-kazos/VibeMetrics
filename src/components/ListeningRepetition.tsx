import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ListeningRepetitionProps {
  data: {
    labels: string[];
    counts: number[];
  };
}

const ListeningRepetition: React.FC<ListeningRepetitionProps> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Plays',
        data: data.counts,
        backgroundColor: 'rgb(29, 185, 84)',
        borderRadius: 4,
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
        text: 'Listening Repetitions Over Day',
        color: '#fff',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ListeningRepetition; 
import React from 'react';
import { Brain, Music, Sparkles, Heart } from 'lucide-react';

interface ListenerPersonalityProps {
  genres: string[];
}

interface ListenerType {
  type: string;
  description: string;
  icon: React.ComponentType<any>;
}

const listenerTypes: Record<string, ListenerType> = {
  pop: {
    type: 'The Enthusiast',
    description: 'You are extroverted, honest, and conventional. Your high self-esteem and hardworking nature make you reliable and socially confident.',
    icon: Heart
  },
  rap: {
    type: 'The Confident',
    description: 'You are outgoing with high self-esteem. Contrary to stereotypes, you are emotionally balanced and socially adept.',
    icon: Music
  },
  rock: {
    type: 'The Creative Soul',
    description: 'Despite the energetic nature of your music, you are gentle, creative, and introspective. You have a rich inner world.',
    icon: Sparkles
  },
  indie: {
    type: 'The Deep Thinker',
    description: 'You are introverted, intellectual, and highly creative. Your unique perspective and innovative thinking set you apart.',
    icon: Brain
  },
  dance: {
    type: 'The Free Spirit',
    description: 'You are outgoing, assertive, and open to new experiences. Your energy and enthusiasm are contagious.',
    icon: Music
  },
  classical: {
    type: 'The Old Soul',
    description: 'You are introspective and at ease with yourself. Your creativity and self-awareness make you naturally sophisticated.',
    icon: Sparkles
  },
  jazz: {
    type: 'The Sophisticate',
    description: 'You are creative, intelligent, and socially confident. Your appreciation for complexity shows in your personality.',
    icon: Brain
  }
};

const ListenerPersonality: React.FC<ListenerPersonalityProps> = ({ genres }) => {
  const determineListenerType = () => {
    const genreCounts: Record<string, number> = {};
    
    genres.forEach((genre, index) => {
      const weight = Math.pow(0.8, index); // Give more weight to top genres
      const normalizedGenre = genre.toLowerCase();
      
      Object.keys(listenerTypes).forEach(type => {
        if (normalizedGenre.includes(type)) {
          genreCounts[type] = (genreCounts[type] || 0) + weight;
        }
      });
    });

    // Find the dominant genre
    let dominantGenre = 'pop'; // default
    let maxCount = 0;
    
    Object.entries(genreCounts).forEach(([genre, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantGenre = genre;
      }
    });

    return listenerTypes[dominantGenre];
  };

  const personalityType = determineListenerType();
  const Icon = personalityType.icon;

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center mb-4">
        <Icon className="w-8 h-8 text-green-500 mr-3" />
        <h2 className="text-xl font-bold text-white">Your Listener Type: {personalityType.type}</h2>
      </div>
      <p className="text-gray-300 leading-relaxed">{personalityType.description}</p>
    </div>
  );
};

export default ListenerPersonality;

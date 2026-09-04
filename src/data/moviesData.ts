import { MovieItem } from '../types';

export const INITIAL_MOVIES: MovieItem[] = [
  {
    id: 'big_buck_bunny',
    title: 'Big Buck Bunny',
    year: 2008,
    duration: '9m 56s',
    category: 'animation',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    description: 'A large and lovable rabbit takes vengeance on a mischievous trio of forest bullies: a flying squirrel, a fox, and a chinchilla.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    genre: ['Animation', 'Comedy', 'Adventure']
  },
  {
    id: 'tears_of_steel',
    title: 'Tears of Steel',
    year: 2012,
    duration: '12m 14s',
    category: 'scifi',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    description: 'Set in a dystopian future Amsterdam, a squad of resistance fighters and scientists attempt to save planet Earth from destructive robotic conquerors.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    genre: ['Sci-Fi', 'VFX Action', 'Cyberpunk']
  },
  {
    id: 'sintel',
    title: 'Sintel: The Dragon Hunter',
    year: 2010,
    duration: '14m 48s',
    category: 'fantasy',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    description: 'A fierce solitary young warrior travels across frozen tundra and perilous deserts searching for Scales, her captive companion dragon.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    genre: ['Fantasy', 'Adventure', 'Drama']
  },
  {
    id: 'elephants_dream',
    title: 'Elephants Dream',
    year: 2006,
    duration: '10m 54s',
    category: 'scifi',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    description: 'Two travelers named Proog and Emo journey through the mechanical belly of an infinite clockwork machine that bends the rules of reality.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    genre: ['Sci-Fi', 'Surrealist', 'Art']
  },
  {
    id: 'for_bigger_blazes',
    title: 'High Sierra Expeditions',
    year: 2021,
    duration: '15m 02s',
    category: 'nature',
    poster: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    description: 'Breathtaking 4K cinematography showcasing alpine peaks, glacial streams, and backcountry wilderness exploration.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    genre: ['Documentary', 'Nature', 'Travel']
  },
  {
    id: 'we_are_going_on_bullrun',
    title: 'Speed & Drift: Automotive Odyssey',
    year: 2020,
    duration: '11m 30s',
    category: 'action',
    poster: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
    description: 'Precision performance driving, rally courses, and mechanical engineering excellence pushed to the absolute edge.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    genre: ['Action', 'Motorsports', 'Cinema']
  }
];

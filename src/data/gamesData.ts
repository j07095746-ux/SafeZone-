import { GameItem } from '../types';

export const INITIAL_GAMES: GameItem[] = [
  {
    id: 'subway_surfers',
    title: 'Subway Surfers',
    category: 'arcade',
    description: 'Sprint along subway tracks, dodge oncoming locomotives, grind on elevated rails, and pop hoverboards to outrun the grumpy Inspector.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    type: 'embed',
    embedUrl: '/games/subway-surfers.html',
    instructions: 'Switch lanes swiftly, time jumps over railway blocks, duck under overhead signals, and collect jetpacks, super sneakers, and coin magnets.',
    controls: ['← / → or A / D : Change Lanes Left / Right', '↑ or W : Jump over obstacles', '↓ or S : Roll under barriers', 'Double Space : Hoverboard Shield'],
    plays: 580000,
    rating: 5.0
  },
  {
    id: 'escape_road',
    title: 'Escape Road',
    category: 'action',
    description: 'High-speed police getaway thriller! Drift through city streets, dodge incoming police cruisers, and weave through obstacles.',
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80',
    type: 'embed',
    embedUrl: 'https://azgames.io/game/escape-road/',
    instructions: 'Evade police vehicles, avoid crashing into city buildings, and survive the high-speed pursuit as long as you can.',
    controls: ['A / D or ← → : Steer Left / Right', 'W / ↑ : Accelerate', 'S / ↓ : Reverse / Brake', 'Space : Handbrake Drift'],
    plays: 35820,
    rating: 4.9
  },
  {
    id: 'retro_bowl',
    title: 'Retro Bowl',
    category: 'arcade',
    description: 'Manage your American football franchise, call clutch plays, pass with precision, and lead your team to championship glory in iconic 8-bit style.',
    thumbnail: 'https://cdn.jsdelivr.net/gh/nexora240-lgtm/Nexora-Assets@main/images/clretrobowl.webp',
    type: 'embed',
    embedUrl: '/games/retro-bowl.html',
    instructions: 'Draft franchise talent, manage roster morale, and command the offense on game day. Aim bullet passes and time running cuts to score touchdowns.',
    controls: ['Mouse / Drag : Aim & Throw passes', 'W / S or ↑ / ↓ : Dodge & Evade tackles', 'Space / Click : Dive / Slide', 'Esc : Pause Menu'],
    plays: 89400,
    rating: 4.9
  },
  {
    id: 'golf_orbit',
    title: 'Golf Orbit',
    category: 'casual',
    description: 'Launch golf balls straight into orbit! Hit precision swings, bounce across planetary terrain, and shoot for record-breaking astronomical distances.',
    thumbnail: 'https://cdn.jsdelivr.net/gh/nexora240-lgtm/Nexora-Assets@main/images/clgolforbit.webp',
    type: 'embed',
    embedUrl: '/games/golf-orbit.html',
    instructions: 'Time your swing on the power meter to hit maximum velocity. Upgrade club strength, bounce factor, and ball aerodynamics to reach outer space.',
    controls: ['Click / Space / Tap : Time Swing & Launch', 'Mouse / Drag : Guide Flight & Trajectory'],
    plays: 42100,
    rating: 4.8
  },
  {
    id: 'geometry_dash_lite',
    title: 'Geometry Dash Lite',
    category: 'arcade',
    description: 'Jump, fly, and flip through dangerous passages and spiky hazards in Geometry Dash Lite featuring iconic soundtrack beats and rhythm-based action.',
    thumbnail: 'https://cdn.jsdelivr.net/gh/nexora240-lgtm/Nexora-Assets@main/images/clgeometrydashscratch.webp',
    type: 'embed',
    embedUrl: '/games/geometry-dash.html',
    instructions: 'Synchronize reflexes to the beat. Jump over spikes, bounce on jump rings, invert gravity through portals, and fly rockets to the finish line.',
    controls: ['Space / ↑ / Click : Jump & Fly', 'P / Esc : Pause Game', 'Z : Place Practice Checkpoint', 'X : Delete Checkpoint'],
    plays: 148500,
    rating: 5.0
  }
];

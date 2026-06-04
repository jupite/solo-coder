export interface SkinConfig {
  id: string;
  name: string;
  description: string;
  player: {
    color: string;
    emissive: string;
    emissiveIntensity: number;
    metalness: number;
    roughness: number;
  };
  redPlayer: {
    color: string;
    emissive: string;
    emissiveIntensity: number;
    metalness: number;
    roughness: number;
  };
  box: {
    color: string;
    metalness: number;
    roughness: number;
  };
  boxOnTarget: {
    color: string;
    emissive: string;
    emissiveIntensity: number;
    metalness: number;
    roughness: number;
  };
  wall: {
    color: string;
    metalness: number;
    roughness: number;
  };
  target: {
    color: string;
    emissive: string;
    emissiveIntensity: number;
  };
  switchTile: {
    offColor: string;
    onColor: string;
    emissive: string;
  };
  redGate: {
    color: string;
    emissive: string;
  };
}

export const SKINS: Record<string, SkinConfig> = {
  default: {
    id: 'default',
    name: '经典风格',
    description: '游戏默认的经典配色方案',
    player: {
      color: '#60a5fa',
      emissive: '#3b82f6',
      emissiveIntensity: 0.35,
      metalness: 0.4,
      roughness: 0.4,
    },
    redPlayer: {
      color: '#f87171',
      emissive: '#ef4444',
      emissiveIntensity: 0.35,
      metalness: 0.4,
      roughness: 0.4,
    },
    box: {
      color: '#8b5a2b',
      metalness: 0.1,
      roughness: 0.85,
    },
    boxOnTarget: {
      color: '#fcd34d',
      emissive: '#f59e0b',
      emissiveIntensity: 0.9,
      metalness: 0.7,
      roughness: 0.25,
    },
    wall: {
      color: '#374151',
      metalness: 0.4,
      roughness: 0.7,
    },
    target: {
      color: '#22c55e',
      emissive: '#16a34a',
      emissiveIntensity: 0.6,
    },
    switchTile: {
      offColor: '#f87171',
      onColor: '#4ade80',
      emissive: '#ffffff',
    },
    redGate: {
      color: '#dc2626',
      emissive: '#ef4444',
    },
  },
  neon: {
    id: 'neon',
    name: '霓虹赛博',
    description: '充满未来感的霓虹色彩',
    player: {
      color: '#06b6d4',
      emissive: '#0891b2',
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
    },
    redPlayer: {
      color: '#f472b6',
      emissive: '#ec4899',
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
    },
    box: {
      color: '#8b5cf6',
      metalness: 0.6,
      roughness: 0.3,
    },
    boxOnTarget: {
      color: '#f472b6',
      emissive: '#ec4899',
      emissiveIntensity: 1.2,
      metalness: 0.9,
      roughness: 0.1,
    },
    wall: {
      color: '#1e1b4b',
      metalness: 0.7,
      roughness: 0.3,
    },
    target: {
      color: '#22d3ee',
      emissive: '#06b6d4',
      emissiveIntensity: 1.0,
    },
    switchTile: {
      offColor: '#fb7185',
      onColor: '#34d399',
      emissive: '#ffffff',
    },
    redGate: {
      color: '#f43f5e',
      emissive: '#e11d48',
    },
  },
  forest: {
    id: 'forest',
    name: '森林自然',
    description: '清新自然的森林主题',
    player: {
      color: '#34d399',
      emissive: '#10b981',
      emissiveIntensity: 0.3,
      metalness: 0.2,
      roughness: 0.6,
    },
    redPlayer: {
      color: '#fb923c',
      emissive: '#f97316',
      emissiveIntensity: 0.3,
      metalness: 0.2,
      roughness: 0.6,
    },
    box: {
      color: '#92400e',
      metalness: 0.0,
      roughness: 0.9,
    },
    boxOnTarget: {
      color: '#fbbf24',
      emissive: '#f59e0b',
      emissiveIntensity: 0.7,
      metalness: 0.3,
      roughness: 0.5,
    },
    wall: {
      color: '#166534',
      metalness: 0.1,
      roughness: 0.8,
    },
    target: {
      color: '#4ade80',
      emissive: '#22c55e',
      emissiveIntensity: 0.5,
    },
    switchTile: {
      offColor: '#ef4444',
      onColor: '#22c55e',
      emissive: '#ffffff',
    },
    redGate: {
      color: '#dc2626',
      emissive: '#ef4444',
    },
  },
  ocean: {
    id: 'ocean',
    name: '深海探险',
    description: '神秘深邃的海洋风格',
    player: {
      color: '#60a5fa',
      emissive: '#2563eb',
      emissiveIntensity: 0.5,
      metalness: 0.5,
      roughness: 0.3,
    },
    redPlayer: {
      color: '#f472b6',
      emissive: '#db2777',
      emissiveIntensity: 0.5,
      metalness: 0.5,
      roughness: 0.3,
    },
    box: {
      color: '#1e40af',
      metalness: 0.3,
      roughness: 0.7,
    },
    boxOnTarget: {
      color: '#fcd34d',
      emissive: '#f59e0b',
      emissiveIntensity: 0.8,
      metalness: 0.6,
      roughness: 0.4,
    },
    wall: {
      color: '#1e3a5f',
      metalness: 0.6,
      roughness: 0.4,
    },
    target: {
      color: '#22d3ee',
      emissive: '#0891b2',
      emissiveIntensity: 0.7,
    },
    switchTile: {
      offColor: '#f87171',
      onColor: '#34d399',
      emissive: '#ffffff',
    },
    redGate: {
      color: '#dc2626',
      emissive: '#ef4444',
    },
  },
  sunset: {
    id: 'sunset',
    name: '日落黄昏',
    description: '温暖浪漫的日落色调',
    player: {
      color: '#fbbf24',
      emissive: '#f59e0b',
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.4,
    },
    redPlayer: {
      color: '#f87171',
      emissive: '#dc2626',
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.4,
    },
    box: {
      color: '#9a3412',
      metalness: 0.2,
      roughness: 0.7,
    },
    boxOnTarget: {
      color: '#fde047',
      emissive: '#eab308',
      emissiveIntensity: 0.8,
      metalness: 0.7,
      roughness: 0.3,
    },
    wall: {
      color: '#7c2d12',
      metalness: 0.3,
      roughness: 0.6,
    },
    target: {
      color: '#fb923c',
      emissive: '#ea580c',
      emissiveIntensity: 0.5,
    },
    switchTile: {
      offColor: '#ef4444',
      onColor: '#22c55e',
      emissive: '#ffffff',
    },
    redGate: {
      color: '#dc2626',
      emissive: '#ef4444',
    },
  },
};

export const SKIN_CATEGORIES = [
  { id: 'player', name: '角色皮肤', icon: 'User' },
  { id: 'box', name: '箱子皮肤', icon: 'Package' },
  { id: 'wall', name: '墙壁皮肤', icon: 'Blocks' },
  { id: 'environment', name: '机关皮肤', icon: 'Settings' },
];

export const getSkinById = (id: string): SkinConfig => {
  return SKINS[id] || SKINS.default;
};

export const DEFAULT_SKIN_ID = 'default';

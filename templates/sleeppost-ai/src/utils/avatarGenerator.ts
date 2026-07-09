import type { AvatarStyle, Avatar } from '../types';

interface StyleConfig {
  bgColors: string[];
  faceColor: string;
  featureColor: string;
  accentColor: string;
  eyeStyle: string;
  hairStyle: string;
}

const styleConfigs: Record<AvatarStyle, StyleConfig> = {
  professional: {
    bgColors: ['#1a365d', '#2a4365'],
    faceColor: '#fbd38d',
    featureColor: '#2d3748',
    accentColor: '#4299e1',
    eyeStyle: 'almond',
    hairStyle: 'short',
  },
  creative: {
    bgColors: ['#553c9a', '#805ad5'],
    faceColor: '#f6e05e',
    featureColor: '#2d3748',
    accentColor: '#ed64a6',
    eyeStyle: 'round',
    hairStyle: 'wavy',
  },
  fantasy: {
    bgColors: ['#1a365d', '#22543d'],
    faceColor: '#fefcbf',
    featureColor: '#1a202c',
    accentColor: '#48bb78',
    eyeStyle: 'large',
    hairStyle: 'long',
  },
  minimal: {
    bgColors: ['#1a202c', '#2d3748'],
    faceColor: '#e2e8f0',
    featureColor: '#1a202c',
    accentColor: '#a0aec0',
    eyeStyle: 'dot',
    hairStyle: 'none',
  },
  cyberpunk: {
    bgColors: ['#1a1a2e', '#16213e'],
    faceColor: '#e0f2fe',
    featureColor: '#0f172a',
    accentColor: '#06b6d4',
    eyeStyle: 'glow',
    hairStyle: 'spiky',
  },
};

function generateFace(style: AvatarStyle, seed: number): string {
  const config = styleConfigs[style];
  const rng = createRNG(seed);

  const faceX = 100;
  const faceY = 110;
  const faceR = 35 + rng() * 5;

  let svg = '';

  // Face
  svg += `<circle cx="${faceX}" cy="${faceY}" r="${faceR}" fill="${config.faceColor}" />`;

  // Eyes
  const eyeY = faceY - 5;
  const eyeSpacing = 12;
  const eyeSize = config.eyeStyle === 'large' ? 5 : config.eyeStyle === 'dot' ? 2 : 3.5;

  if (config.eyeStyle === 'glow') {
    svg += `<ellipse cx="${faceX - eyeSpacing}" cy="${eyeY}" rx="${eyeSize}" ry="${eyeSize * 0.7}" fill="${config.accentColor}" filter="url(#glow)" />`;
    svg += `<ellipse cx="${faceX + eyeSpacing}" cy="${eyeY}" rx="${eyeSize}" ry="${eyeSize * 0.7}" fill="${config.accentColor}" filter="url(#glow)" />`;
  } else {
    svg += `<ellipse cx="${faceX - eyeSpacing}" cy="${eyeY}" rx="${eyeSize}" ry="${eyeSize * 0.7}" fill="${config.featureColor}" />`;
    svg += `<ellipse cx="${faceX + eyeSpacing}" cy="${eyeY}" rx="${eyeSize}" ry="${eyeSize * 0.7}" fill="${config.featureColor}" />`;
  }

  // Mouth
  const mouthY = faceY + 10;
  const mouthWidth = 8 + rng() * 4;
  svg += `<path d="M${faceX - mouthWidth / 2},${mouthY} Q${faceX},${mouthY + 6 + rng() * 4} ${faceX + mouthWidth / 2},${mouthY}" stroke="${config.featureColor}" stroke-width="2" fill="none" stroke-linecap="round" />`;

  // Hair
  if (config.hairStyle === 'short') {
    svg += `<path d="M${faceX - faceR + 2},${faceY - 10} Q${faceX},${faceY - faceR - 8} ${faceX + faceR - 2},${faceY - 10}" fill="${config.featureColor}" />`;
  } else if (config.hairStyle === 'wavy') {
    svg += `<path d="M${faceX - faceR},${faceY - 5} Q${faceX - 15},${faceY - faceR - 15} ${faceX},${faceY - faceR - 10} Q${faceX + 15},${faceY - faceR - 15} ${faceX + faceR},${faceY - 5}" fill="${config.featureColor}" />`;
    svg += `<path d="M${faceX - faceR + 2},${faceY - 5} Q${faceX - faceR - 5},${faceY + 10} ${faceX - faceR + 5},${faceY + 20}" stroke="${config.featureColor}" stroke-width="4" fill="none" />`;
    svg += `<path d="M${faceX + faceR - 2},${faceY - 5} Q${faceX + faceR + 5},${faceY + 10} ${faceX + faceR - 5},${faceY + 20}" stroke="${config.featureColor}" stroke-width="4" fill="none" />`;
  } else if (config.hairStyle === 'long') {
    svg += `<path d="M${faceX - faceR - 5},${faceY - 8} Q${faceX},${faceY - faceR - 18} ${faceX + faceR + 5},${faceY - 8}" fill="${config.featureColor}" />`;
    svg += `<path d="M${faceX - faceR - 3},${faceY - 5} Q${faceX - faceR - 8},${faceY + 15} ${faceX - faceR + 2},${faceY + 30}" stroke="${config.featureColor}" stroke-width="5" fill="none" />`;
    svg += `<path d="M${faceX + faceR + 3},${faceY - 5} Q${faceX + faceR + 8},${faceY + 15} ${faceX + faceR - 2},${faceY + 30}" stroke="${config.featureColor}" stroke-width="5" fill="none" />`;
  } else if (config.hairStyle === 'spiky') {
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (i - 2) * 0.4;
      const len = 15 + rng() * 10;
      const sx = faceX + Math.cos(angle) * (faceR - 2);
      const sy = faceY + Math.sin(angle) * (faceR - 2);
      const ex = faceX + Math.cos(angle) * (faceR + len);
      const ey = faceY + Math.sin(angle) * (faceR + len);
      svg += `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${config.accentColor}" stroke-width="3" stroke-linecap="round" />`;
    }
  }

  // Accessories based on style
  if (style === 'professional') {
    svg += `<rect x="${faceX - 18}" y="${faceY + 18}" width="36" height="20" rx="3" fill="${config.accentColor}" opacity="0.8" />`;
    svg += `<line x1="${faceX}" y1="${faceY + 18}" x2="${faceX}" y2="${faceY + 38}" stroke="${config.faceColor}" stroke-width="1" />`;
  } else if (style === 'cyberpunk') {
    svg += `<rect x="${faceX - 18}" y="${eyeY - 6}" width="36" height="12" rx="2" fill="none" stroke="${config.accentColor}" stroke-width="1.5" opacity="0.6" />`;
  }

  return svg;
}

function createRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateAvatarSVG(style: AvatarStyle, name: string): string {
  const seed = hashString(name + style + Date.now());
  const config = styleConfigs[style];
  const rng = createRNG(seed);

  const bgGradId = `bg-${seed}`;
  const faceSvg = generateFace(style, seed);

  const decorativeElements = generateDecorations(style, rng, config);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="${bgGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${config.bgColors[0]}" />
      <stop offset="100%" stop-color="${config.bgColors[1]}" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="200" height="200" fill="url(#${bgGradId})" rx="20" />
  ${decorativeElements}
  <!-- Body -->
  <ellipse cx="100" cy="185" rx="40" ry="25" fill="${config.accentColor}" opacity="0.7" />
  <!-- Neck -->
  <rect x="92" y="140" width="16" height="15" fill="${config.faceColor}" />
  ${faceSvg}
  <!-- Style label -->
  <text x="100" y="195" text-anchor="middle" fill="white" font-size="8" font-family="sans-serif" opacity="0.7">${style}</text>
</svg>`;
}

function generateDecorations(style: AvatarStyle, rng: () => number, config: StyleConfig): string {
  let svg = '';

  if (style === 'professional') {
    for (let i = 0; i < 3; i++) {
      const x = 15 + rng() * 170;
      const y = 15 + rng() * 30;
      svg += `<circle cx="${x}" cy="${y}" r="${1 + rng() * 2}" fill="${config.accentColor}" opacity="${0.2 + rng() * 0.3}" />`;
    }
  } else if (style === 'creative') {
    for (let i = 0; i < 5; i++) {
      const x = 10 + rng() * 180;
      const y = 10 + rng() * 180;
      const size = 3 + rng() * 8;
      svg += `<polygon points="${x},${y - size} ${x + size * 0.3},${y + size * 0.5} ${x - size * 0.3},${y + size * 0.5}" fill="${config.accentColor}" opacity="${0.15 + rng() * 0.2}" />`;
    }
  } else if (style === 'fantasy') {
    for (let i = 0; i < 4; i++) {
      const x = 20 + rng() * 160;
      const y = 20 + rng() * 160;
      svg += `<circle cx="${x}" cy="${y}" r="${1 + rng() * 3}" fill="white" opacity="${0.1 + rng() * 0.3}" />`;
    }
  } else if (style === 'cyberpunk') {
    for (let i = 0; i < 6; i++) {
      const x = rng() * 200;
      const y = rng() * 200;
      const len = 10 + rng() * 30;
      svg += `<line x1="${x}" y1="${y}" x2="${x + len}" y2="${y}" stroke="${config.accentColor}" stroke-width="0.5" opacity="${0.1 + rng() * 0.2}" />`;
    }
    // Grid lines
    for (let i = 0; i < 4; i++) {
      const y = 40 + i * 40;
      svg += `<line x1="0" y1="${y}" x2="200" y2="${y}" stroke="${config.accentColor}" stroke-width="0.3" opacity="0.1" />`;
    }
  }

  return svg;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function createAvatar(name: string, style: AvatarStyle, platforms: string[]): Avatar {
  const svgData = generateAvatarSVG(style, name);
  return {
    id: `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    style,
    svgData,
    platforms: platforms as Avatar['platforms'],
    createdAt: new Date().toISOString(),
    postsGenerated: 0,
  };
}

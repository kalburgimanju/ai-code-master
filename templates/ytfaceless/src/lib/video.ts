import { uploadBuffer } from './storage';

// Free video generation using:
// 1. HTML-based video placeholders
// 2. CSS animations
// 3. SVG animations
// 4. FFmpeg for combining (if available)

export interface VideoGenerationRequest {
  script: { heading: string; content: string }[];
  voiceoverUrl: string;
  style: 'cinematic' | 'documentary' | 'educational';
}

export async function generateVideo(request: VideoGenerationRequest): Promise<string> {
  // Generate HTML-based video with CSS animations
  const html = generateVideoHTML(request.script, request.style);

  const buffer = Buffer.from(html, 'utf-8');
  const url = await uploadBuffer(buffer, `video-${Date.now()}.html`, 'text/html');

  return url;
}

function generateVideoHTML(
  script: { heading: string; content: string }[],
  style: string
): string {
  const styleCSS = getStyleCSS(style);
  const slides = script.map((s, i) => `
    <div class="slide ${i === 0 ? 'active' : ''}" data-index="${i}">
      <h2>${s.heading}</h2>
      <p>${s.content.slice(0, 300)}...</p>
    </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FaceFlow Video</title>
  <style>
    ${styleCSS}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .container {
      width: 100%;
      max-width: 1200px;
      padding: 40px;
      position: relative;
    }
    .slide {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      text-align: center;
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
    }
    .slide.active {
      opacity: 1;
    }
    h2 {
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 20px;
      background: linear-gradient(90deg, #a855f7, #f97316);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    p {
      font-size: 1.5rem;
      color: #94a3b8;
      line-height: 1.6;
    }
    .controls {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 20px;
    }
    button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .prev, .next {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .prev:hover, .next:hover {
      background: rgba(255,255,255,0.2);
    }
    .progress {
      position: fixed;
      bottom: 0;
      left: 0;
      height: 4px;
      background: linear-gradient(90deg, #a855f7, #f97316);
      transition: width 0.3s;
    }
    .slide-counter {
      position: fixed;
      top: 40px;
      right: 40px;
      font-size: 1.2rem;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="slide-counter">
    <span id="current">1</span> / <span id="total">${script.length}</span>
  </div>

  <div class="container">
    ${slides}
  </div>

  <div class="controls">
    <button class="prev" onclick="prevSlide()">← Previous</button>
    <button class="next" onclick="nextSlide()">Next →</button>
  </div>

  <div class="progress" id="progress"></div>

  <script>
    let current = 0;
    const slides = document.querySelectorAll('.slide');
    const total = slides.length;

    function showSlide(index) {
      slides.forEach(s => s.classList.remove('active'));
      slides[index].classList.add('active');
      document.getElementById('current').textContent = index + 1;
      document.getElementById('progress').style.width = ((index + 1) / total * 100) + '%';
    }

    function nextSlide() {
      current = (current + 1) % total;
      showSlide(current);
    }

    function prevSlide() {
      current = (current - 1 + total) % total;
      showSlide(current);
    }

    // Auto-advance every 10 seconds
    setInterval(nextSlide, 10000);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    });
  </script>
</body>
</html>`;
}

function getStyleCSS(style: string): string {
  const styles: Record<string, string> = {
    cinematic: `
      body { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%); }
      h2 { background: linear-gradient(90deg, #e94560, #ff6b6b); -webkit-background-clip: text; background-clip: text; }
    `,
    documentary: `
      body { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); }
      h2 { background: linear-gradient(90deg, #4ade80, #22c55e); -webkit-background-clip: text; background-clip: text; }
    `,
    educational: `
      body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      h2 { background: linear-gradient(90deg, #f093fb, #f5576c); -webkit-background-clip: text; background-clip: text; }
    `,
  };
  return styles[style] || styles.cinematic;
}

// Alternative: Generate SVG-based video frames
export function generateSVGFrame(
  heading: string,
  content: string,
  index: number
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
    <linearGradient id="text" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#a855f7"/>
      <stop offset="100%" style="stop-color:#f97316"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <text x="960" y="400" text-anchor="middle" font-size="72" font-weight="bold" fill="url(#text)">${heading}</text>
  <text x="960" y="600" text-anchor="middle" font-size="36" fill="#94a3b8">${content.slice(0, 100)}...</text>
  <text x="960" y="980" text-anchor="middle" font-size="24" fill="#64748b">FaceFlow AI • Slide ${index + 1}</text>
</svg>`;
}

// Get available free video options
export function getFreeVideoOptions(): { name: string; description: string }[] {
  return [
    { name: 'HTML Video', description: 'Interactive HTML-based video with slides' },
    { name: 'SVG Frames', description: 'Static SVG frames for video editing' },
    { name: 'CSS Animation', description: 'Animated HTML/CSS video' },
  ];
}

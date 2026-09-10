export interface SampleSvg {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const SAMPLE_SVGS: SampleSvg[] = [
  {
    id: 'feather-icon',
    name: 'Compass Icon',
    description: 'Clean geometric vector with paths, circles, and strokes',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="240" height="240" fill="none" stroke="#e4e4e7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle id="outer-rim" cx="12" cy="12" r="10" stroke="#71717a" />
  <polygon id="needle" points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#27272a" stroke="#f43f5e" />
  <circle id="pivot" cx="12" cy="12" r="1" fill="#f43f5e" stroke="none" />
</svg>`,
  },
  {
    id: 'brand-mark',
    name: 'Prism Logo',
    description: 'Layered vector mark with linear gradients, defs, and groups',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="prism-grad-a" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="prism-grad-b" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <linearGradient id="prism-grad-c" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#be123c" />
    </linearGradient>
  </defs>
  <g id="brand-container" transform="translate(100, 100)">
    <polygon id="facet-top" points="0,-70 60,35 -60,35" fill="url(#prism-grad-a)" opacity="0.9" />
    <polygon id="facet-right" points="0,-70 60,35 0,70" fill="url(#prism-grad-b)" opacity="0.8" />
    <polygon id="facet-left" points="0,-70 -60,35 0,70" fill="url(#prism-grad-c)" opacity="0.85" />
    <circle id="core-light" cx="0" cy="0" r="14" fill="#ffffff" opacity="0.95" />
  </g>
</svg>`,
  },
  {
    id: 'technical-diagram',
    name: 'Circuit Schematic',
    description: 'Technical schematic with rects, lines, text nodes, and coordinates',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="400" height="260">
  <g id="background-grid" opacity="0.15">
    <line x1="0" y1="50" x2="400" y2="50" stroke="#a1a1aa" stroke-dasharray="2 2" />
    <line x1="0" y1="130" x2="400" y2="130" stroke="#a1a1aa" stroke-dasharray="2 2" />
    <line x1="0" y1="210" x2="400" y2="210" stroke="#a1a1aa" stroke-dasharray="2 2" />
    <line x1="100" y1="0" x2="100" y2="260" stroke="#a1a1aa" stroke-dasharray="2 2" />
    <line x1="200" y1="0" x2="200" y2="260" stroke="#a1a1aa" stroke-dasharray="2 2" />
    <line x1="300" y1="0" x2="300" y2="260" stroke="#a1a1aa" stroke-dasharray="2 2" />
  </g>
  <g id="main-bus">
    <path id="bus-in" d="M 40 130 L 120 130" stroke="#10b981" stroke-width="2.5" fill="none" />
    <circle id="pin-in" cx="40" cy="130" r="4" fill="#10b981" />
  </g>
  <g id="logic-gate" transform="translate(120, 80)">
    <rect id="gate-body" x="0" y="0" width="100" height="100" rx="6" fill="#18181b" stroke="#52525b" stroke-width="2" />
    <text id="gate-label" x="50" y="48" fill="#e4e4e7" font-family="monospace" font-size="12" text-anchor="middle" font-weight="600">DSP-01</text>
    <text id="gate-sub" x="50" y="66" fill="#71717a" font-family="monospace" font-size="9" text-anchor="middle">500 MHz</text>
  </g>
  <g id="output-bus">
    <path id="bus-out-a" d="M 220 105 L 340 105" stroke="#38bdf8" stroke-width="2" fill="none" />
    <path id="bus-out-b" d="M 220 155 L 300 155 L 300 200 L 340 200" stroke="#f59e0b" stroke-width="2" fill="none" />
    <circle id="pin-out-a" cx="340" cy="105" r="4" fill="#38bdf8" />
    <circle id="pin-out-b" cx="340" cy="200" r="4" fill="#f59e0b" />
  </g>
</svg>`,
  },
  {
    id: 'complex-illustration',
    name: 'Topographic Waves',
    description: 'Curved Bezier vector terrain with dozens of grouped contours',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 320" width="500" height="320">
  <rect width="100%" height="100%" fill="#09090b" />
  <g id="topography-group" stroke-linecap="round">
    <path id="contour-1" d="M 20 280 C 140 240, 220 310, 340 260 S 440 220, 480 240" fill="none" stroke="#27272a" stroke-width="1.5" />
    <path id="contour-2" d="M 20 240 C 120 190, 210 270, 320 220 S 430 180, 480 200" fill="none" stroke="#3f3f46" stroke-width="1.5" />
    <path id="contour-3" d="M 20 200 C 110 140, 190 230, 310 170 S 410 130, 480 160" fill="none" stroke="#52525b" stroke-width="1.5" />
    <path id="contour-4" d="M 20 160 C 90 100, 180 180, 290 130 S 390 90, 480 120" fill="none" stroke="#71717a" stroke-width="2" />
    <path id="contour-5" d="M 20 120 C 100 60, 160 140, 270 90 S 370 50, 480 80" fill="none" stroke="#a1a1aa" stroke-width="2" />
    <path id="peak-crest" d="M 20 80 C 120 20, 180 90, 280 40 S 400 20, 480 50" fill="none" stroke="#e4e4e7" stroke-width="2.5" />
  </g>
  <circle id="elevation-point-a" cx="280" cy="40" r="3.5" fill="#f43f5e" />
  <circle id="elevation-point-b" cx="180" cy="180" r="3" fill="#38bdf8" />
  <circle id="elevation-point-c" cx="340" cy="260" r="3" fill="#10b981" />
</svg>`,
  },
];

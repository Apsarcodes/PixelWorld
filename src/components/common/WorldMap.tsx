import React from 'react'

export function WorldMap({ onCountryClick }: { onCountryClick: (country: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const countries = [
    { id: 'usa', name: 'USA', cx: 160, cy: 195, r: 24, ads: '18,340', color: '#6C5FE6' },
    { id: 'brazil', name: 'Brazil', cx: 240, cy: 355, r: 18, ads: '6,120', color: '#00A882' },
    { id: 'uk', name: 'UK', cx: 462, cy: 120, r: 12, ads: '9,200', color: '#00A882' },
    { id: 'germany', name: 'Germany', cx: 494, cy: 130, r: 11, ads: '7,450', color: '#00A882' },
    { id: 'uae', name: 'UAE', cx: 620, cy: 225, r: 14, ads: '4,230', color: '#F59E0B' },
    { id: 'india', name: 'India', cx: 690, cy: 280, r: 22, ads: '12,450', color: '#6C5FE6' },
    { id: 'china', name: 'China', cx: 775, cy: 195, r: 20, ads: '10,890', color: '#EC4899' },
    { id: 'japan', name: 'Japan', cx: 860, cy: 195, r: 13, ads: '5,670', color: '#00A882' },
    { id: 'australia', name: 'Australia', cx: 840, cy: 390, r: 16, ads: '3,980', color: '#00A882' },
    { id: 'nigeria', name: 'Nigeria', cx: 480, cy: 295, r: 13, ads: '2,140', color: '#00A882' },
    { id: 'saudi', name: 'Saudi Arabia', cx: 600, cy: 240, r: 13, ads: '3,560', color: '#F59E0B' },
    { id: 'canada', name: 'Canada', cx: 160, cy: 130, r: 14, ads: '4,820', color: '#00A882' },
    { id: 'mexico', name: 'Mexico', cx: 150, cy: 240, r: 12, ads: '2,680', color: '#00A882' },
    { id: 'argentina', name: 'Argentina', cx: 220, cy: 420, r: 12, ads: '1,940', color: '#00A882' },
    {
      id: 'southafrica',
      name: 'South Africa',
      cx: 520,
      cy: 420,
      r: 12,
      ads: '1,780',
      color: '#00A882',
    },
    { id: 'singapore', name: 'Singapore', cx: 790, cy: 310, r: 10, ads: '2,210', color: '#00A882' },
    { id: 'indonesia', name: 'Indonesia', cx: 820, cy: 330, r: 14, ads: '3,450', color: '#EC4899' },
    { id: 'kenya', name: 'Kenya', cx: 560, cy: 320, r: 10, ads: '1,120', color: '#00A882' },
    { id: 'france', name: 'France', cx: 474, cy: 145, r: 12, ads: '5,890', color: '#00A882' },
  ]

  return (
    <div className="relative w-full aspect-[2/1] max-w-5xl mx-auto">
      <svg viewBox="0 0 1000 500" className="w-full h-full">
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#D6E8FF" />
            <stop offset="100%" stopColor="#EAF2FF" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softglow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ocean */}
        <rect width="1000" height="500" fill="url(#oceanGrad)" rx="16" />

        {/* Grid lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 50}
            x2="1000"
            y2={i * 50}
            stroke="rgba(60,100,220,0.08)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 50}
            y1="0"
            x2={i * 50}
            y2="500"
            stroke="rgba(60,100,220,0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Continents — simplified outlines */}
        {/* North America */}
        <path
          d="M 70 65 L 240 60 L 280 90 L 275 140 L 250 200 L 240 270 L 210 320 L 185 350 L 155 365 L 135 330 L 110 290 L 75 250 L 60 200 L 65 140 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* South America */}
        <path
          d="M 185 290 L 255 275 L 295 300 L 305 370 L 290 440 L 255 475 L 210 470 L 180 440 L 170 380 L 175 320 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* Europe */}
        <path
          d="M 435 55 L 530 50 L 560 80 L 555 115 L 535 145 L 500 160 L 455 155 L 430 125 L 425 90 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* Africa */}
        <path
          d="M 435 175 L 580 170 L 605 220 L 600 300 L 575 390 L 530 445 L 470 445 L 425 395 L 415 290 L 425 210 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* Middle East */}
        <path
          d="M 560 150 L 645 135 L 680 175 L 668 225 L 630 240 L 580 225 L 558 195 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* Asia (main body) */}
        <path
          d="M 600 60 L 900 55 L 940 100 L 935 200 L 895 270 L 830 300 L 770 300 L 725 260 L 665 240 L 640 195 L 605 175 L 580 130 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* Indian subcontinent */}
        <path
          d="M 645 195 L 730 195 L 760 235 L 755 320 L 710 368 L 668 348 L 640 295 Z"
          fill="rgba(60,100,220,0.14)"
          stroke="rgba(60,100,220,0.22)"
          strokeWidth="0.8"
        />
        {/* SE Asia */}
        <path
          d="M 770 265 L 870 255 L 910 295 L 895 340 L 845 360 L 790 325 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* Australia */}
        <path
          d="M 790 340 L 935 330 L 960 380 L 950 440 L 880 465 L 800 445 L 775 400 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />

        {/* Country active indicators */}
        {countries.map((c) => {
          const isHovered = hovered === c.id
          const isClickable = c.id === 'india'
          return (
            <g
              key={c.id}
              onClick={() => isClickable && onCountryClick(c.name)}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
            >
              {/* Pulse rings */}
              <circle
                cx={c.cx}
                cy={c.cy}
                r={c.r * 1.8}
                fill="none"
                stroke={c.color}
                strokeWidth="1"
                opacity="0.2"
              >
                <animate
                  attributeName="r"
                  values={`${c.r * 1.4};${c.r * 2.8};${c.r * 1.4}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0;0.4"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx={c.cx}
                cy={c.cy}
                r={c.r * 1.2}
                fill="none"
                stroke={c.color}
                strokeWidth="1.5"
                opacity="0.3"
              >
                <animate
                  attributeName="r"
                  values={`${c.r};${c.r * 2.2};${c.r}`}
                  dur="3s"
                  begin="0.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0;0.5"
                  dur="3s"
                  begin="0.5s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Main dot */}
              <circle
                cx={c.cx}
                cy={c.cy}
                r={isHovered ? c.r * 1.15 : c.r}
                fill={c.color}
                opacity={isHovered ? 0.95 : 0.75}
                filter="url(#glow)"
                style={{ transition: 'r 0.2s, opacity 0.2s' }}
              />

              {/* Label on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={c.cx - 55}
                    y={c.cy - c.r - 38}
                    width="110"
                    height="28"
                    rx="6"
                    fill="rgba(255,255,255,0.96)"
                    stroke="rgba(0,0,0,0.10)"
                    strokeWidth="0.8"
                  />
                  <text
                    x={c.cx}
                    y={c.cy - c.r - 28}
                    textAnchor="middle"
                    fill="#0F1117"
                    fontSize="8"
                    fontFamily="Outfit"
                    fontWeight="600"
                  >
                    {c.name}
                  </text>
                  <text
                    x={c.cx}
                    y={c.cy - c.r - 17}
                    textAnchor="middle"
                    fill={c.color}
                    fontSize="7"
                    fontFamily="JetBrains Mono"
                  >
                    {c.ads} active ads
                  </text>
                  {isClickable && (
                    <text
                      x={c.cx}
                      y={c.cy + c.r + 12}
                      textAnchor="middle"
                      fill="#6C5FE6"
                      fontSize="7"
                      fontFamily="Outfit"
                      fontWeight="600"
                    >
                      ↗ Explore
                    </text>
                  )}
                </g>
              )}
            </g>
          )
        })}

        {/* Connection lines between major hubs */}
        {[
          [160, 195, 462, 120],
          [160, 195, 690, 280],
          [690, 280, 775, 195],
          [462, 120, 690, 280],
          [620, 225, 690, 280],
          [160, 195, 240, 355],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(108,95,230,0.22)"
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-4 flex items-center gap-4">
        {[
          { color: '#6C5FE6', label: 'High Activity' },
          { color: '#00A882', label: 'Active' },
          { color: '#F59E0B', label: 'Growing' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Click hint for India */}
      <div className="absolute bottom-3 right-4">
        <span className="text-xs text-[#6C5FE6] font-['Outfit'] font-medium animate-pulse">
          Click India to explore →
        </span>
      </div>
    </div>
  )
}


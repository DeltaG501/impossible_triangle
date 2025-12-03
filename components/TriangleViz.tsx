import React, { useMemo } from 'react';
import { CircleData, IntersectionLabel } from '../types';

interface TriangleVizProps {
  radius: number;
  separation: number;
  rotation: number;
}

export const TriangleViz: React.FC<TriangleVizProps> = ({ radius, separation, rotation }) => {
  // Center of the SVG
  const cx = 400;
  const cy = 300;

  // Calculate centers of the three circles based on an equilateral triangle
  // Centroid at (cx, cy)
  // Distance from centroid to vertex = separation / sqrt(3)
  const distToCenter = separation / Math.sqrt(3);

  const circles: CircleData[] = useMemo(() => {
    // Angles for the three points (Top, Bottom-Right, Bottom-Left)
    // -90 degrees is top
    const angles = [-90, 30, 150].map(a => (a + rotation) * (Math.PI / 180));

    return [
      {
        id: 'fast',
        label: '快',
        description: 'Fast (Speed)',
        x: cx + distToCenter * Math.cos(angles[0]),
        y: cy + distToCenter * Math.sin(angles[0]),
        color: 'rgba(6, 182, 212, 0.6)', // Cyan
      },
      {
        id: 'accurate',
        label: '准',
        description: 'Accurate (Quality)',
        x: cx + distToCenter * Math.cos(angles[1]),
        y: cy + distToCenter * Math.sin(angles[1]),
        color: 'rgba(236, 72, 153, 0.6)', // Pink
      },
      {
        id: 'cheap',
        label: '省',
        description: 'Cheap (Cost)',
        x: cx + distToCenter * Math.cos(angles[2]),
        y: cy + distToCenter * Math.sin(angles[2]),
        color: 'rgba(234, 179, 8, 0.6)', // Yellow
      },
    ];
  }, [cx, cy, distToCenter, rotation]);

  // Calculate intersection labels positions (midpoints between pairs)
  const intersections: IntersectionLabel[] = useMemo(() => {
    return [
      {
        text: 'Expensive',
        description: 'Fast + Accurate',
        x: (circles[0].x + circles[1].x) / 2,
        y: (circles[0].y + circles[1].y) / 2,
      },
      {
        text: 'Slow',
        description: 'Accurate + Cheap',
        x: (circles[1].x + circles[2].x) / 2,
        y: (circles[1].y + circles[2].y) / 2,
      },
      {
        text: 'Low Quality',
        description: 'Fast + Cheap',
        x: (circles[0].x + circles[2].x) / 2,
        y: (circles[0].y + circles[2].y) / 2,
      },
    ];
  }, [circles]);

  // Check if there is a common intersection (Geometric check)
  // In an equilateral arrangement, the hole exists if distToCenter > radius
  // Wait, no. The hole exists if the circles don't cover the centroid.
  // The distance from centroid to circle edge is (distToCenter - radius).
  // If distToCenter > radius, there is a gap in the absolute center.
  // However, for pairwise intersection, we need separation < 2 * radius.
  // The prompt specifically asks for "intersect pairwise but not all sharing a common intersection point".
  // This implies the center point is NOT covered by any circle.
  // So distance from centroid to center of circle must be > radius.
  // i.e., distToCenter > radius.
  const hasCommonIntersection = distToCenter <= radius;

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-800">
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Render Circles */}
        {circles.map((circle) => (
          <g key={circle.id}>
            <circle
              cx={circle.x}
              cy={circle.y}
              r={radius}
              fill={circle.color}
              stroke="white"
              strokeWidth="2"
              strokeOpacity="0.3"
              className="mix-blend-screen transition-all duration-500 ease-out"
            />
            {/* Center Label */}
            <text
              x={circle.x}
              y={circle.y}
              dy="0.35em"
              textAnchor="middle"
              className="text-4xl font-black fill-white pointer-events-none select-none drop-shadow-md"
              style={{ fontWeight: 900 }}
            >
              {circle.label}
            </text>
            <text
              x={circle.x}
              y={circle.y + 40}
              dy="0.35em"
              textAnchor="middle"
              className="text-sm font-medium fill-white/80 pointer-events-none select-none uppercase tracking-widest"
            >
              {circle.description.split(' ')[0]}
            </text>
          </g>
        ))}

        {/* Render Intersection Labels */}
        {intersections.map((item, idx) => (
          <g key={idx}>
            <text
              x={item.x}
              y={item.y}
              dy="0.35em"
              textAnchor="middle"
              className="text-xs sm:text-sm font-bold fill-white pointer-events-none select-none drop-shadow-lg"
            >
              {item.text}
            </text>
          </g>
        ))}

        {/* Center Void/Intersection Marker */}
        <g>
           {hasCommonIntersection ? (
             <text
               x={cx}
               y={cy}
               dy="0.35em"
               textAnchor="middle"
               className="text-lg font-bold fill-white drop-shadow-lg"
             >
               Utopia
             </text>
           ) : (
             <text
                x={cx}
                y={cy}
                dy="0.35em"
                textAnchor="middle"
                className="text-xs font-mono fill-red-400 opacity-80"
             >
               IMPOSSIBLE
             </text>
           )}
           {/* Visual center point marker */}
           <circle cx={cx} cy={cy} r="3" fill={hasCommonIntersection ? "white" : "red"} opacity="0.5" />
        </g>

      </svg>
      
      {/* Legend / Helper Text overlay */}
      <div className="absolute top-4 left-4 text-white/50 text-xs max-w-[200px]">
        <p>Adjust the geometry to see how the trade-offs interact.</p>
      </div>
    </div>
  );
};

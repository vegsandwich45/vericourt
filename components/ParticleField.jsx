'use client';

import { useMemo } from 'react';

export default function ParticleField() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // 0 to 100%
      delay: Math.random() * 10, // 0 to 10s
      duration: 8 + Math.random() * 12, // 8 to 20s
      drift: -30 + Math.random() * 60, // -30px to 30px
      isGold: Math.random() > 0.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes particleDrift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-100vh) translateX(var(--drift)); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-[-10px] rounded-full"
          style={{
            left: `${p.left}%`,
            width: '2px',
            height: '2px',
            backgroundColor: p.isGold ? 'rgba(201, 168, 76, 0.6)' : 'rgba(139, 0, 0, 0.5)',
            animation: `particleDrift ${p.duration}s linear ${p.delay}s infinite`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

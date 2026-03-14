import { useGameStore } from '../../game/store';
import { useState } from 'react';

export function MainMenu() {
  const loadLevel = useGameStore(s => s.loadLevel);
  const [hovered, setHovered] = useState<string | null>(null);

  const menuItems = [
    { id: 'start', label: 'START DEPLOYMENT', action: () => loadLevel(0) },
    { id: 'levels', label: 'LEVEL SELECT', action: () => console.log('Level select') },
    { id: 'options', label: 'OPTIONS', action: () => console.log('Options') },
    { id: 'quit', label: 'QUIT', action: () => console.log('Quit') },
  ];

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden scanlines">
      {/* Moving Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scanlines_4s_linear_infinite]" />
        <div className="absolute top-1/4 left-0 w-full h-1 bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)] animate-[scanlines_6s_linear_infinite_reverse]" />
      </div>

      {/* Main Title */}
      <div className="relative mb-16 transform -skew-x-12">
        <h1 className="text-8xl font-black text-white italic tracking-tighter neon-text select-none">
          SWAT
        </h1>
        <h1 className="text-8xl font-black text-pink-500 italic tracking-tighter neon-text-pink -mt-6 ml-12 select-none">
          TACTICS
        </h1>
        <div className="absolute -top-4 -left-4 w-full h-full border-4 border-blue-500/30 -z-10 animate-pulse" />
      </div>

      {/* Menu Options */}
      <div className="flex flex-col gap-6 items-center">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={item.action}
            className={`
              text-3xl font-black italic tracking-tight transition-all duration-200 cursor-pointer
              ${hovered === item.id 
                ? 'text-white scale-110 skew-x-[-12deg] translate-x-2' 
                : 'text-zinc-500 skew-x-[-12deg]'}
            `}
          >
            <span className={hovered === item.id ? 'neon-text' : ''}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 left-12 transform -skew-x-12 select-none">
        <p className="text-zinc-600 font-bold text-sm tracking-widest uppercase">
          Build v0.4.2 // Protocol: Zero Tolerance
        </p>
      </div>

      <div className="absolute bottom-8 right-12 transform -skew-x-12 select-none">
        <p className="text-pink-600/50 font-black text-xl italic tracking-tighter animate-pulse">
          INSERT COIN
        </p>
      </div>
    </div>
  );
}

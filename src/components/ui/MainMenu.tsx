import { useGameStore } from '../../game/store';
import { useState } from 'react';
import { LEVELS } from '../../game/levels';

type MenuState = 'main' | 'level_select' | 'options' | 'credits';

export function MainMenu() {
  const loadLevel = useGameStore(s => s.loadLevel);
  const [view, setView] = useState<MenuState>('main');
  const [hovered, setHovered] = useState<string | number | null>(null);

  const mainMenuItems = [
    { id: 'start', label: 'START DEPLOYMENT', action: () => loadLevel(0) },
    { id: 'levels', label: 'LEVEL SELECT', action: () => setView('level_select') },
    { id: 'options', label: 'OPTIONS', action: () => setView('options') },
    { id: 'credits', label: 'CREDITS', action: () => setView('credits') },
  ];

  if (view === 'level_select') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden scanlines">
        <h2 className="text-5xl font-black italic text-white mb-12 neon-text transform -skew-x-12">SELECT SECTOR</h2>
        <div className="grid grid-cols-5 gap-4 max-w-2xl transform -skew-x-12">
          {LEVELS.map((_, i) => (
            <button
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => loadLevel(i)}
              className={`
                w-16 h-16 text-2xl font-black transition-all cursor-pointer border-2
                ${hovered === i 
                  ? 'bg-white text-black border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.8)]' 
                  : 'bg-zinc-900 text-zinc-500 border-zinc-700'}
              `}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button 
          className="mt-12 text-xl font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer transform -skew-x-12"
          onClick={() => setView('main')}
        >
          BACK TO HQ
        </button>
      </div>
    );
  }

  if (view === 'options') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden scanlines">
        <h2 className="text-5xl font-black italic text-white mb-12 neon-text transform -skew-x-12">SYSTEM CONFIG</h2>
        <div className="flex flex-col gap-8 w-80 transform -skew-x-12">
          <div className="flex justify-between items-center bg-zinc-900 p-4 border-l-4 border-blue-500">
            <span className="font-bold text-zinc-400 uppercase tracking-widest">Master Volume</span>
            <span className="text-white font-black">100%</span>
          </div>
          <div className="flex justify-between items-center bg-zinc-900 p-4 border-l-4 border-pink-500">
            <span className="font-bold text-zinc-400 uppercase tracking-widest">Graphics</span>
            <span className="text-white font-black">ULTRA</span>
          </div>
          <div className="flex justify-between items-center bg-zinc-900 p-4 border-l-4 border-yellow-500 text-zinc-600">
            <span className="font-bold uppercase tracking-widest">CRT Filter</span>
            <span className="font-black">ACTIVE</span>
          </div>
        </div>
        <button 
          className="mt-12 text-xl font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer transform -skew-x-12"
          onClick={() => setView('main')}
        >
          APPLY & RETURN
        </button>
      </div>
    );
  }

  if (view === 'credits') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden scanlines text-center">
        <h2 className="text-5xl font-black italic text-white mb-12 neon-text transform -skew-x-12 tracking-tighter">INTELLIGENCE</h2>
        
        <div className="flex flex-col gap-8 transform -skew-x-12">
          <div>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] mb-2">Lead Developer</p>
            <p className="text-4xl font-black text-white italic neon-text">Fezcode (Samil)</p>
          </div>
          
          <div>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] mb-2">Digital HQ</p>
            <a 
              href="https://fezcode.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-3xl font-black text-pink-500 italic hover:text-white transition-colors underline decoration-pink-500/30"
            >
              fezcode.com
            </a>
          </div>

          <div className="mt-4 p-4 border border-zinc-800 bg-zinc-900/50">
            <p className="text-zinc-600 text-sm font-bold leading-relaxed max-w-xs uppercase">
              Special thanks to the open source community and the ghosts in the machine.
            </p>
          </div>
        </div>

        <button 
          className="mt-12 text-xl font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer transform -skew-x-12"
          onClick={() => setView('main')}
        >
          BACK TO HQ
        </button>
      </div>
    );
  }

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
        {mainMenuItems.map((item) => (
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
      <div className="absolute bottom-8 left-12 transform -skew-x-12 select-none text-left">
        <p className="text-zinc-600 font-bold text-sm tracking-widest uppercase">
          Build v0.4.2 // Protocol: Zero Tolerance
        </p>
        <p className="text-[10px] text-zinc-800 font-bold uppercase mt-1 tracking-tighter">
          Authorized personnel only. Digital trace active.
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

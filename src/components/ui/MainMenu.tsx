import { useGameStore } from '../../game/store';
import { useState, useEffect } from 'react';
import { LEVELS } from '../../game/levels';
import { SFX } from '../../game/sounds';

type MenuState = 'main' | 'level_select' | 'options' | 'credits';

export function MainMenu() {
  const loadLevel = useGameStore(s => s.loadLevel);
  const isMuted = useGameStore(s => s.isMuted);
  const setMuted = useGameStore(s => s.setMuted);
  const crtEnabled = useGameStore(s => s.crtEnabled);
  const setCrtEnabled = useGameStore(s => s.setCrtEnabled);
  const resetStats = useGameStore(s => s.resetStats);
  const [view, setView] = useState<MenuState>('main');
  const [hovered, setHovered] = useState<string | number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (view !== 'main') {
          SFX.buttonClick();
          setView('main');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  const handleHover = (id: string | number | null) => {
    setHovered(id);
    if (id !== null) SFX.buttonHover();
  };

  const handleClick = (action: () => void) => {
    SFX.buttonClick();
    action();
  };

  const startSurvival = useGameStore(s => s.startSurvival);

  const mainMenuItems = [
    { id: 'survival', label: 'SURVIVAL MODE', action: () => startSurvival() },
    { id: 'start', label: 'START DEPLOYMENT', action: () => loadLevel(0) },
    { id: 'levels', label: 'LEVEL SELECT', action: () => setView('level_select') },
    { id: 'options', label: 'OPTIONS', action: () => setView('options') },
    { id: 'credits', label: 'CREDITS', action: () => setView('credits') },
  ];

  const [levelPage, setLevelPage] = useState(0);
  const levelsPerPage = 40;
  const totalPages = Math.ceil(LEVELS.length / levelsPerPage);
  
  const currentLevels = LEVELS.slice(
    levelPage * levelsPerPage, 
    (levelPage + 1) * levelsPerPage
  );

  if (view === 'level_select') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden">
        {crtEnabled && <div className="menu-crt" />}
        <div className="flex flex-col items-center relative z-10 w-full max-w-5xl px-4">
          <div className="flex items-center justify-between w-full mb-8 transform -skew-x-12">
            <h2 className="text-5xl font-black italic text-white neon-text">SELECT SECTOR</h2>
            <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-2 px-6">
              <span className="text-zinc-500 font-bold text-sm tracking-tighter">PAGE</span>
              <span className="text-white font-black text-2xl neon-text-blue">{levelPage + 1}</span>
              <span className="text-zinc-700 font-black text-xl">/</span>
              <span className="text-zinc-600 font-bold text-sm">{totalPages}</span>
            </div>
          </div>
          <div className="grid grid-cols-10 gap-3 transform -skew-x-12">
            {currentLevels.map((_, i) => {
              const absoluteIndex = levelPage * levelsPerPage + i;
              return (
                <button
                  key={absoluteIndex}
                  onMouseEnter={() => handleHover(absoluteIndex)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleClick(() => loadLevel(absoluteIndex))}
                  className={`w-14 h-14 text-xl font-black transition-all cursor-pointer border-2 ${hovered === absoluteIndex ? 'bg-white text-black border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.8)]' : 'bg-zinc-900 text-zinc-500 border-zinc-700 hover:border-zinc-500'}`}
                >
                  {absoluteIndex + 1}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-8 mt-12 transform -skew-x-12">
            <button disabled={levelPage === 0} onClick={() => handleClick(() => setLevelPage(levelPage - 1))} className={`px-8 py-3 font-black italic tracking-tighter transition-all border-2 ${levelPage === 0 ? 'border-zinc-800 text-zinc-800 cursor-not-allowed' : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`}>PREVIOUS DEPLOYMENT</button>
            <button disabled={levelPage >= totalPages - 1} onClick={() => handleClick(() => setLevelPage(levelPage + 1))} className={`px-8 py-3 font-black italic tracking-tighter transition-all border-2 ${levelPage >= totalPages - 1 ? 'border-zinc-800 text-zinc-800 cursor-not-allowed' : 'border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white cursor-pointer shadow-[0_0_10px_rgba(236,72,153,0.3)]'}`}>NEXT DEPLOYMENT</button>
          </div>
          <button className="mt-12 text-lg font-bold text-zinc-600 hover:text-white transition-colors cursor-pointer transform -skew-x-12 flex items-center gap-2" onClick={() => handleClick(() => setView('main'))}>
            <span className="text-zinc-800 font-black">{'<<'}</span> BACK TO HQ
          </button>
        </div>
      </div>
    );
  }

  if (view === 'options') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden">
        {crtEnabled && <div className="menu-crt" />}
        <h2 className="text-5xl font-black italic text-white mb-12 neon-text transform -skew-x-12 relative z-10">SYSTEM CONFIG</h2>
        <div className="flex flex-col gap-8 w-80 transform -skew-x-12 relative z-10">
          <button onClick={() => setMuted(!isMuted)} onMouseEnter={() => handleHover('mute')} onMouseLeave={() => setHovered(null)} className="flex justify-between items-center bg-zinc-900 p-4 border-l-4 border-blue-500 cursor-pointer hover:bg-zinc-800 transition-colors">
            <span className="font-bold text-zinc-400 uppercase tracking-widest text-xs text-left">Audio System</span>
            <span className={`font-black ${isMuted ? 'text-red-500' : 'text-blue-400'}`}>{isMuted ? 'MUTED' : 'ACTIVE'}</span>
          </button>
          <div className="flex justify-between items-center bg-zinc-900 p-4 border-l-4 border-pink-500">
            <span className="font-bold text-zinc-400 uppercase tracking-widest text-xs">Graphics</span>
            <span className="text-white font-black">ULTRA</span>
          </div>
          <button onClick={() => setCrtEnabled(!crtEnabled)} onMouseEnter={() => handleHover('crt')} onMouseLeave={() => setHovered(null)} className="flex justify-between items-center bg-zinc-900 p-4 border-l-4 border-yellow-500 cursor-pointer hover:bg-zinc-800 transition-colors">
            <span className="font-bold text-zinc-400 uppercase tracking-widest text-xs text-left">CRT Filter</span>
            <span className={`font-black ${crtEnabled ? 'text-yellow-500' : 'text-zinc-500'}`}>{crtEnabled ? 'ACTIVE' : 'OFF'}</span>
          </button>
          <button onClick={() => handleClick(() => resetStats())} onMouseEnter={() => handleHover('reset')} onMouseLeave={() => setHovered(null)} className="flex justify-between items-center bg-red-950/20 p-4 border-l-4 border-red-600 cursor-pointer hover:bg-red-900/40 transition-colors mt-4">
            <span className="font-bold text-red-500/70 uppercase tracking-widest text-xs text-left">Records</span>
            <span className="font-black text-red-500">RESET STATS</span>
          </button>
        </div>
        <button className="mt-12 text-xl font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer transform -skew-x-12 relative z-10" onClick={() => handleClick(() => setView('main'))}>APPLY & RETURN</button>
      </div>
    );
  }

  if (view === 'credits') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden text-center">
        {crtEnabled && <div className="menu-crt" />}
        <h2 className="text-5xl font-black italic text-white mb-12 neon-text transform -skew-x-12 tracking-tighter relative z-10">INTELLIGENCE</h2>
        <div className="flex flex-col gap-8 transform -skew-x-12 relative z-10">
          <div>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] mb-2 text-xs">Lead Developer</p>
            <p className="text-4xl font-black text-white italic neon-text">Fezcode (Samil)</p>
          </div>
          <div>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] mb-2 text-xs">Audio Department</p>
            <p className="text-2xl font-black text-blue-400 italic">Music by Dan, Rockot & Alexgrohl from Pixabay</p>
            <p className="text-zinc-600 text-sm font-bold mt-1 uppercase">Ambient & Tactical Comms</p>
          </div>
          <div>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] mb-2 text-xs">Digital HQ</p>
            <a href="https://fezcode.com" target="_blank" rel="noreferrer" className="text-3xl font-black text-pink-500 italic hover:text-white transition-colors underline decoration-pink-500/30">fezcode.com</a>
          </div>
        </div>
        <button className="mt-12 text-xl font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer transform -skew-x-12 relative z-10" onClick={() => handleClick(() => setView('main'))}>BACK TO HQ</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden">
      {crtEnabled && (
        <>
          <div className="menu-crt" />
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-[scanlines_4s_linear_infinite]" />
            <div className="absolute top-1/2 left-0 w-full h-1 bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,1)] animate-[scanlines_6s_linear_infinite_reverse]" />
          </div>
        </>
      )}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative mb-16 transform -skew-x-12 vhs-distort">
          <h1 className="text-8xl font-black text-white italic tracking-tighter neon-text select-none">SWAT</h1>
          <h1 className="text-8xl font-black text-pink-500 italic tracking-tighter neon-text-pink -mt-6 ml-12 select-none">TACTICS</h1>
          <div className="absolute -top-4 -left-4 w-full h-full border-4 border-blue-500/30 -z-10 animate-pulse" />
        </div>
        <div className="flex flex-col gap-6 items-center">
          {mainMenuItems.map((item) => (
            <button key={item.id} onMouseEnter={() => handleHover(item.id)} onMouseLeave={() => setHovered(null)} onClick={() => handleClick(item.action)} className={`text-3xl font-black italic tracking-tight transition-all duration-200 cursor-pointer ${item.id === 'survival' ? (hovered === item.id ? 'text-white scale-115 skew-x-[-12deg] translate-x-2' : 'skew-x-[-12deg] survival-menu-pulse') : (hovered === item.id ? 'text-white scale-110 skew-x-[-12deg] translate-x-2' : 'text-zinc-500 skew-x-[-12deg]')}`}>
              <span className={item.id === 'survival' ? (hovered === item.id ? 'survival-title-glow' : 'survival-title-glow') : (hovered === item.id ? 'neon-text' : '')}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 left-12 transform -skew-x-12 select-none text-left z-10">
        <p className="text-zinc-600 font-bold text-sm tracking-widest uppercase">Build v0.4.2 // Protocol: Zero Tolerance</p>
        <p className="text-[10px] text-zinc-800 font-bold uppercase mt-1 tracking-tighter">Authorized personnel only. Digital trace active.</p>
      </div>
      <div className="absolute bottom-8 right-12 transform -skew-x-12 select-none z-10">
        <p className="text-pink-600/50 font-black text-xl italic tracking-tighter animate-pulse">INSERT COIN</p>
      </div>
    </div>
  );
}

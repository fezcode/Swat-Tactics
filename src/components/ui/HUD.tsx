import { useGameStore } from '../../game/store';
import { MainMenu } from './MainMenu';
import { SFX } from '../../game/sounds';

export function HUD() {
  const phase = useGameStore(s => s.phase);
  const player = useGameStore(s => s.player);
  const levelIndex = useGameStore(s => s.levelIndex);
  const loadLevel = useGameStore(s => s.loadLevel);
  const restartGame = useGameStore(s => s.restartGame);

  const handleClick = (action: () => void) => {
    SFX.buttonClick();
    action();
  };

  if (phase === 'main_menu') {
    return <MainMenu />;
  }

  if (phase === 'game_over') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 text-white z-50 scanlines overflow-hidden animate-pulse">
        <h1 className="text-9xl font-black italic tracking-tighter text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] mb-12">
          K.I.A.
        </h1>
        <div className="flex flex-col gap-4 items-center transform -skew-x-12">
          <button 
            className="px-12 py-4 bg-white text-black text-2xl font-black hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-[8px_8px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            onClick={() => handleClick(() => restartGame())}
          >
            RETRY DEPLOYMENT
          </button>
          <button 
            className="text-zinc-400 font-bold hover:text-white transition-colors cursor-pointer"
            onClick={() => handleClick(() => useGameStore.setState({ phase: 'main_menu' }))}
          >
            RETURN TO BASE
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'level_complete') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-950/90 text-white z-50 scanlines overflow-hidden">
        <h1 className="text-8xl font-black italic tracking-tighter text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.8)] mb-12 transform -skew-x-12">
          AREA CLEARED
        </h1>
        <button 
          className="px-12 py-4 bg-pink-600 text-white text-2xl font-black hover:bg-pink-500 transition-all cursor-pointer shadow-[8px_8px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none transform -skew-x-12"
          onClick={() => handleClick(() => loadLevel(levelIndex + 1))}
        >
          NEXT MISSION
        </button>
      </div>
    );
  }

  if (phase === 'victory') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white z-50 scanlines overflow-hidden">
        <div className="relative mb-12 animate-bounce">
          <h1 className="text-8xl font-black italic tracking-tighter neon-text">VICTORY</h1>
        </div>
        <p className="text-2xl font-bold text-zinc-400 mb-12 tracking-widest uppercase transform -skew-x-12">
          All Sectors Secured. Tactical Superiority Achieved.
        </p>
        <button 
          className="px-12 py-4 bg-white text-black text-2xl font-black hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-[8px_8px_0_rgba(0,0,0,0.5)] transform -skew-x-12"
          onClick={() => handleClick(() => restartGame())}
        >
          BACK TO MENU
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-10">
      <div className="flex justify-between items-start">
        <div className="bg-zinc-950/80 p-4 transform -skew-x-12 border-l-4 border-blue-500 shadow-2xl backdrop-blur-sm pointer-events-auto">
          <h2 className="text-3xl font-black italic text-white tracking-tighter">MISSION {levelIndex + 1}</h2>
          <p className="text-xs font-bold text-blue-400 tracking-widest uppercase mt-1">Status: Operational</p>
        </div>
        
        {player && (
          <div className="flex flex-col gap-2 items-end pointer-events-auto">
            <div className="bg-zinc-950/80 p-4 transform -skew-x-12 border-r-4 border-red-600 shadow-2xl backdrop-blur-sm flex flex-col items-end">
              <div className="text-4xl font-black italic text-red-600 tracking-tighter drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                HP {player.hp}
              </div>
              <div className="w-48 h-2 bg-zinc-800 mt-2 relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-300" 
                  style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-zinc-950/80 p-4 transform -skew-x-12 border-r-4 border-blue-400 shadow-2xl backdrop-blur-sm flex flex-col items-end">
              <div className="text-xl font-black italic text-blue-400 tracking-tighter">
                {player.weapon.name.toUpperCase()}
              </div>
              <div className="text-2xl font-black italic text-white tracking-tighter mt-1">
                {player.weapon.ammo} / {player.weapon.maxAmmo}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-zinc-950/80 p-3 transform -skew-x-12 border-b-2 border-pink-500 self-center backdrop-blur-sm pointer-events-auto flex gap-6 text-xs font-bold text-zinc-400 tracking-widest uppercase shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="bg-zinc-800 px-2 py-1 text-white">WASD</span> MOVE
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-zinc-800 px-2 py-1 text-white">CLICK</span> FIRE
        </div>
        <div className="flex items-center gap-2 text-pink-500">
          <span className="animate-pulse">●</span> LIVE FEED
        </div>
      </div>
    </div>
  );
}

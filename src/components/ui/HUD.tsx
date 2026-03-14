import { useGameStore } from '../../game/store';

export function HUD() {
  const phase = useGameStore(s => s.phase);
  const player = useGameStore(s => s.player);
  const levelIndex = useGameStore(s => s.levelIndex);
  const loadLevel = useGameStore(s => s.loadLevel);
  const restartGame = useGameStore(s => s.restartGame);

  if (phase === 'main_menu') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-white z-50">
        <h1 className="text-6xl font-bold mb-8 text-blue-500 tracking-tighter">SWAT TACTICS</h1>
        <button 
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-xl font-bold rounded shadow-lg transition"
          onClick={() => loadLevel(0)}
        >
          START DEPLOYMENT
        </button>
      </div>
    );
  }

  if (phase === 'game_over') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 text-white z-50">
        <h1 className="text-6xl font-bold mb-8">KIA</h1>
        <button 
          className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-xl font-bold rounded shadow-lg transition"
          onClick={() => restartGame()}
        >
          RETRY
        </button>
      </div>
    );
  }

  if (phase === 'level_complete') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/90 text-white z-50">
        <h1 className="text-6xl font-bold mb-8">AREA CLEARED</h1>
        <button 
          className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-xl font-bold rounded shadow-lg transition"
          onClick={() => loadLevel(levelIndex + 1)}
        >
          PROCEED TO NEXT AREA
        </button>
      </div>
    );
  }

  if (phase === 'victory') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-900/90 text-white z-50">
        <h1 className="text-6xl font-bold mb-8">MISSION ACCOMPLISHED</h1>
        <button 
          className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-xl font-bold rounded shadow-lg transition"
          onClick={() => restartGame()}
        >
          MAIN MENU
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-10">
      <div className="flex justify-between items-start">
        <div className="bg-zinc-900/80 p-4 rounded border border-zinc-700 shadow-xl backdrop-blur-sm pointer-events-auto">
          <h2 className="text-2xl font-bold text-zinc-100">LEVEL {levelIndex + 1}</h2>
          <p className="text-sm text-zinc-400">Eliminate all targets to unlock the exit.</p>
        </div>
        
        {player && (
          <div className="bg-zinc-900/80 p-4 rounded border border-zinc-700 shadow-xl backdrop-blur-sm flex flex-col items-end pointer-events-auto">
            <div className="text-2xl font-bold text-red-500">HP: {player.hp} / {player.maxHp}</div>
            <div className="text-xl text-blue-400">{player.weapon.name}</div>
            <div className="text-lg font-mono text-zinc-300">AMMO: {player.weapon.ammo} / {player.weapon.maxAmmo}</div>
          </div>
        )}
      </div>

      <div className="bg-zinc-900/80 p-4 rounded border border-zinc-700 self-center backdrop-blur-sm pointer-events-auto flex gap-4 text-sm text-zinc-300">
        <div><kbd className="bg-zinc-800 px-2 py-1 rounded">W/A/S/D</kbd> or <kbd className="bg-zinc-800 px-2 py-1 rounded">Arrows</kbd> to Move</div>
        <div><kbd className="bg-zinc-800 px-2 py-1 rounded">Click</kbd> to Shoot</div>
      </div>
    </div>
  );
}

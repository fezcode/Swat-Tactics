import { useEffect } from 'react';
import { useGameStore } from '../../game/store';

/**
 * Isolated component to handle the global Pause listener.
 * This ensures that pausing logic remains consistent and isn't 
 * accidentally decoupled during UI or feature refactors.
 */
export function PauseHandler() {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        const { phase, togglePause } = useGameStore.getState();
        console.log('[PauseHandler] ESC pressed, current phase:', phase);
        
        if (phase === 'playing' || phase === 'paused') {
          console.log('[PauseHandler] Toggling pause...');
          e.preventDefault();
          e.stopPropagation();
          togglePause();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
    };
  }, []);

  return null;
}

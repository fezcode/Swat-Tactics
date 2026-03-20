import { useEffect } from 'react';
import { useGameStore } from '../../game/store';

/**
 * Isolated component to handle the global Pause listener.
 * This ensures that pausing logic remains consistent and isn't 
 * accidentally decoupled during UI or feature refactors.
 */
export function PauseHandler() {
  // Destructure phase and togglePause from the store outside the effect
  // so they can be used as dependencies and accessed by the handler.
  const { phase, togglePause } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        // Only toggle pause if the game is playing or already paused
        if (phase === 'playing' || phase === 'paused' || phase === 'survival_playing') {
          console.log('[PauseHandler] ESC caught at window level (capture)', { currentPhase: phase });
          // Prevent other listeners from seeing this to avoid conflicts
          e.stopImmediatePropagation();
          e.preventDefault(); // Also prevent default browser behavior for Escape
          togglePause();
        }
      }
    };

    // Use window + capture to be the absolute first to catch the key
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [togglePause, phase]); // Dependencies ensure the latest phase and togglePause are used

  return null;
}

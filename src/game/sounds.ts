import { useGameStore } from './store';

const createAudio = (path: string, volume = 1) => {
  // Use relative paths for GitHub Pages support (no leading slash)
  const audio = new Audio(path);
  audio.volume = volume;
  audio.preload = 'auto';
  return audio;
};

// Preload all SFX using relative paths
const sfxAssets = {
  hover: createAudio('sounds/button-hover.mp3', 0.5),
  click: createAudio('sounds/button-click.mp3', 0.5),
  playerShoot: createAudio('sounds/player-gunshot.mp3', 0.4),
  enemyShoot: createAudio('sounds/enemy-gunshot.mp3', 0.3),
  levelStart: createAudio('sounds/level-start.mp3', 0.6),
  levelEnd: createAudio('sounds/level-end.mp3', 0.6),
};

export const SFX = {
  buttonHover: () => {
    if (useGameStore.getState().isMuted) return;
    const sound = sfxAssets.hover.cloneNode(true) as HTMLAudioElement;
    sound.volume = sfxAssets.hover.volume;
    sound.play().catch(() => {});
  },
  buttonClick: () => {
    if (useGameStore.getState().isMuted) return;
    const sound = sfxAssets.click.cloneNode(true) as HTMLAudioElement;
    sound.volume = sfxAssets.click.volume;
    sound.play().catch(() => {});
  },
  playerShoot: () => {
    if (useGameStore.getState().isMuted) return;
    const sound = sfxAssets.playerShoot.cloneNode(true) as HTMLAudioElement;
    sound.volume = sfxAssets.playerShoot.volume;
    sound.play().catch(() => {});
  },
  enemyShoot: () => {
    if (useGameStore.getState().isMuted) return;
    const sound = sfxAssets.enemyShoot.cloneNode(true) as HTMLAudioElement;
    sound.volume = sfxAssets.enemyShoot.volume;
    sound.play().catch(() => {});
  },
  levelStart: () => {
    if (useGameStore.getState().isMuted) return;
    sfxAssets.levelStart.play().catch(() => {});
  },
  levelEnd: () => {
    if (useGameStore.getState().isMuted) return;
    sfxAssets.levelEnd.play().catch(() => {});
  },
};

let bgMusic: HTMLAudioElement | null = null;

export const Music = {
  play: () => {
    if (!bgMusic) {
      bgMusic = new Audio('sounds/music-watermello-electronic-electro-477141.mp3');
      bgMusic.loop = true;
      bgMusic.volume = 0.4;
      bgMusic.preload = 'auto';
    }
    if (useGameStore.getState().isMuted) {
      bgMusic.muted = true;
    }
    bgMusic.play().catch(() => {
      console.log("Music autoplay blocked. Waiting for user interaction.");
    });
  },
  stop: () => {
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  },
  setMuted: (muted: boolean) => {
    if (bgMusic) bgMusic.muted = muted;
  },
  setVolume: (v: number) => {
    if (bgMusic) bgMusic.volume = v;
  }
};

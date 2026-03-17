import { useGameStore } from './store';

const createAudio = (path: string, volume = 1) => {
  const audio = new Audio(path);
  audio.volume = volume;
  audio.preload = 'auto';
  return audio;
};

export const SFX = {
  hover: createAudio('sounds/button-hover.mp3', 0.5),
  click: createAudio('sounds/button-click.mp3', 0.5),
  playerShoot: () => {
    if (useGameStore.getState().isMuted) return;
    const sound = createAudio('sounds/player-gunshot.mp3', 0.4);
    sound.play().catch(() => {});
  },
  enemyShoot: () => {
    if (useGameStore.getState().isMuted) return;
    const sound = createAudio('sounds/enemy-gunshot.mp3', 0.3);
    sound.play().catch(() => {});
  },
  gunEmpty: () => {
    if (useGameStore.getState().isMuted) return;
    const sound = createAudio('sounds/gun-empty.mp3', 0.5);
    sound.play().catch(() => {});
  },
  teleport: () => {
    if (useGameStore.getState().isMuted) return;
    const sound = createAudio('sounds/teleport.mp3', 0.6);
    sound.play().catch(() => {});
  },
  levelStart: () => {
    if (useGameStore.getState().isMuted) return;
    const sound = createAudio('sounds/level-start.mp3', 0.6);
    sound.play().catch(() => {});
  },
  levelEnd: () => {
    if (useGameStore.getState().isMuted) return;
    const sound = createAudio('sounds/level-end.mp3', 0.6);
    sound.play().catch(() => {});
  },
  buttonHover: () => {
    if (useGameStore.getState().isMuted) return;
    const sound = createAudio('sounds/button-hover.mp3', 0.5);
    sound.play().catch(() => {});
  },
  buttonClick: () => {
    if (useGameStore.getState().isMuted) return;
    const sound = createAudio('sounds/button-click.mp3', 0.5);
    sound.play().catch(() => {});
  },
};

const playlist = [
  { name: 'Alexgrohl - Electronic', path: 'sounds/music-alexgrohl-electronic-470603.mp3' },
  { name: 'Watermello - Electronic', path: 'sounds/music-watermello-electronic-electro-477141.mp3' },
];

let currentTrackIndex = 0;
let bgMusic: HTMLAudioElement | null = null;

export const Music = {
  play: () => {
    if (bgMusic && !bgMusic.paused) return;
    if (!bgMusic) { Music.start(); return; }
    
    // Ensure track name is set if we are resuming
    const track = playlist[currentTrackIndex];
    useGameStore.getState().setCurrentTrackName(track.name);
    
    if (useGameStore.getState().isMuted) bgMusic.muted = true;
    bgMusic.play().catch(() => {});
  },
  
  start: () => {
    Music.playTrack(currentTrackIndex);
  },

  playTrack: (index: number) => {
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.onended = null;
    }
    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];
    bgMusic = new Audio(track.path);
    bgMusic.volume = 0.4;
    bgMusic.muted = useGameStore.getState().isMuted;
    
    // Use the action from the store
    useGameStore.getState().setCurrentTrackName(track.name);
    
    bgMusic.play().catch(() => {});
    bgMusic.onended = () => Music.next();
  },

  next: () => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    Music.playTrack(nextIndex);
  },

  stop: () => {
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
    useGameStore.getState().setCurrentTrackName("None");
  },
  setMuted: (muted: boolean) => {
    if (bgMusic) bgMusic.muted = muted;
  },
  setVolume: (v: number) => {
    if (bgMusic) bgMusic.volume = v;
  }
};

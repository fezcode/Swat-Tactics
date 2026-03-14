export const SFX = {
  buttonHover: () => new Audio('/sounds/button-hover.mp3').play().catch(() => {}),
  buttonClick: () => new Audio('/sounds/button-click.mp3').play().catch(() => {}),
  playerShoot: () => {
    const audio = new Audio('/sounds/player-gunshot.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  },
  enemyShoot: () => {
    const audio = new Audio('/sounds/enemy-gunshot.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  },
  levelStart: () => new Audio('/sounds/level-start.mp3').play().catch(() => {}),
  levelEnd: () => new Audio('/sounds/level-end.mp3').play().catch(() => {}),
};

let bgMusic: HTMLAudioElement | null = null;

export const Music = {
  play: () => {
    if (!bgMusic) {
      bgMusic = new Audio('/sounds/music-watermello-electronic-electro-477141.mp3');
      bgMusic.loop = true;
      bgMusic.volume = 0.4;
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
  setVolume: (v: number) => {
    if (bgMusic) bgMusic.volume = v;
  }
};

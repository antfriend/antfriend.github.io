(() => {
  function createSoundPlayer(path, options = {}) {
    const normalizedPath = typeof path === "string" ? path.trim() : "";
    if (!normalizedPath) return null;

    const audio = new Audio(normalizedPath);
    audio.preload = options.preload === "none" ? "none" : "auto";
    audio.loop = Boolean(options.loop);

    function play(playOptions = {}) {
      const shouldRestart = playOptions.restart !== false;
      if (shouldRestart) {
        audio.currentTime = 0;
      }
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
      return playPromise;
    }

    function stop() {
      audio.pause();
      audio.currentTime = 0;
    }

    return { play, stop, audio };
  }

  window.CommonAudio = window.CommonAudio || {};
  window.CommonAudio.createSoundPlayer = createSoundPlayer;
})();

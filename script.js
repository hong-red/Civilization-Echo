window.addEventListener('load', () => {
  const splashScreen = document.getElementById('splash-screen');

  const hideSplashScreen = () => {
    splashScreen.style.opacity = '0';
    splashScreen.addEventListener('transitionend', () => {
      splashScreen.style.display = 'none';
    }, { once: true });
  };

  // Auto-hide after animation + delay
  setTimeout(hideSplashScreen, 1800);

  // Click to skip
  splashScreen.addEventListener('click', hideSplashScreen);
});
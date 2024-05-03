type CustomNavigator = Navigator & {
  msMaxTouchPoints: number;
};

export function isMobileDevice(): boolean {
  let hasTouchScreen = false;

  if ('maxTouchPoints' in navigator) {
    hasTouchScreen = navigator.maxTouchPoints > 0;
  } else if ('msMaxTouchPoints' in navigator) {
    hasTouchScreen = (navigator as CustomNavigator).msMaxTouchPoints > 0;
  } else if (
    screen.orientation.type !== 'landscape-primary' ||
    screen.orientation.angle !== 0
  ) {
    hasTouchScreen = true;
  } else if ('orientation' in window) {
    hasTouchScreen = true;
  } else {
    const userAgent = (navigator as Navigator).userAgent;
    hasTouchScreen =
      /\b(BlackBerry|webOS|iPhone|IEMobile|Android|Windows Phone|iPad|iPod)\b/i.test(
        userAgent
      );
  }

  return hasTouchScreen;
}

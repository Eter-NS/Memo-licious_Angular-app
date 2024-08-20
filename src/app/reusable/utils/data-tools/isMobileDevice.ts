export function isMobileDevice(): boolean {
  const mediaMatch = window.matchMedia('(max-width: 768px)').matches;

  if (mediaMatch) {
    return mediaMatch;
  }

  const regExpMatch =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const maxTouchPointsMatch =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return regExpMatch && maxTouchPointsMatch;
}

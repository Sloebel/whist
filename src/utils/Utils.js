export const hasTouch = () =>
  window.navigator.maxTouchPoints ||
  'ontouchstart' in document.documentElement;
export const hasTouch = () =>
  window.navigator.maxTouchPoints ||
  'ontouchstart' in document.documentElement;

export function addListener(element, type, callback) {

  element.addEventListener(type, callback);

  return () => {
    element.removeEventListener(type, callback);
  };
}
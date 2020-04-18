export const hasTouch = (): boolean =>
  !!window.navigator.maxTouchPoints ||
  'ontouchstart' in document.documentElement;

export function addListener(
  element: HTMLElement,
  type: string,
  callback: (e: Event) => void
) {
  element.addEventListener(type, callback);

  return () => {
    element.removeEventListener(type, callback);
  };
}

export function isMobileBrowser(): boolean {
  return (
    typeof window.orientation !== 'undefined' ||
    navigator.userAgent.indexOf('IEMobile') !== -1
  );
}

export const unique = <T>(array: T[]) => Array.from(new Set(array));

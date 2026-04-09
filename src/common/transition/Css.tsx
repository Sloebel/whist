import React, { useRef, useEffect } from 'react';

export const CSS_TRANSITIONS = {
  FADE_IN: 'fade-in',
  SLIDE_UP: 'slide-up'
} as const;

type CssTransitionType = typeof CSS_TRANSITIONS[keyof typeof CSS_TRANSITIONS];

interface CssProps {
  type: CssTransitionType;
  children?: React.ReactNode;
}

const Css: React.FC<CssProps> = ({ type, children }) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    divRef.current?.classList.add(type);
    const timeout = setTimeout(() => divRef.current?.classList.remove(type), 400);
    return () => clearTimeout(timeout);
  }, [children, type]);

  return (
    <div className={''} ref={divRef}>
      {children}
    </div>
  );
};

export default Css;

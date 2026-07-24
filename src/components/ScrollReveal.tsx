import { useEffect, useLayoutEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { reveal, RevealDirection } from '../animations/scrollReveal';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface ScrollRevealProps {
  key?: string | number;
  children: ReactNode;
  direction?: RevealDirection;
  duration?: number;
  delay?: number;
  distance?: number;
  stagger?: number;
  triggerOnce?: boolean;
  ease?: string;
  className?: string;
  /**
   * If true, it animates the immediate children of the container with a stagger.
   */
  staggerChildren?: boolean;
  /**
   * If provided, specifies a CSS selector to find elements to stagger inside this container
   * (e.g., '.reveal-item' or 'article').
   */
  staggerSelector?: string;
  /**
   * Viewport trigger start position (e.g., "top 85%").
   */
  viewportStart?: string;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  duration = 0.8,
  delay = 0,
  distance = 40,
  stagger = 0.15,
  triggerOnce = true,
  ease = 'power2.out',
  className = '',
  staggerChildren = false,
  staggerSelector = '',
  viewportStart = 'top 85%'
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Create a GSAP context to cleanly handle garbage collection on unmount
    const ctx = gsap.context(() => {
      reveal(el, {
        direction,
        duration,
        delay,
        distance,
        stagger,
        triggerOnce,
        ease,
        staggerChildren,
        staggerSelector,
        viewportStart
      });
    }, el);

    return () => ctx.revert();
  }, [
    direction,
    duration,
    delay,
    distance,
    stagger,
    triggerOnce,
    ease,
    staggerChildren,
    staggerSelector,
    viewportStart
  ]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}


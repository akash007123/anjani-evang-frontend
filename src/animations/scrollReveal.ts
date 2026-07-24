import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'fade';

export interface RevealOptions {
  direction?: RevealDirection;
  duration?: number;
  delay?: number;
  distance?: number;
  stagger?: number;
  triggerOnce?: boolean;
  ease?: string;
  viewportStart?: string;
  staggerChildren?: boolean;
  staggerSelector?: string;
}

/**
 * Centered scroll reveal animation utilizing GSAP ScrollTrigger.
 * Applies a consistent entrance animation to any element or collection of elements.
 * 
 * @param element The target DOM element, array of elements, or selector string.
 * @param options Optional configuration parameters.
 */
export function reveal(
  element: gsap.DOMTarget | null,
  options: RevealOptions = {}
) {
  if (!element) return null;

  const {
    direction = 'up',
    duration = 0.8,
    delay = 0,
    distance = 40,
    stagger = 0.15,
    triggerOnce = true,
    ease = 'power2.out',
    viewportStart = 'top 85%',
    staggerChildren = false,
    staggerSelector = ''
  } = options;

  let x = 0;
  let y = 0;

  switch (direction) {
    case 'up':
      y = distance;
      break;
    case 'down':
      y = -distance;
      break;
    case 'left':
      x = distance;
      break;
    case 'right':
      x = -distance;
      break;
    case 'fade':
    default:
      break;
  }

  // Resolve sub-targets if stagger option is provided
  let targets: gsap.DOMTarget = element;
  if (typeof element === 'object' && 'querySelectorAll' in element) {
    if (staggerSelector) {
      targets = (element as HTMLElement).querySelectorAll(staggerSelector);
    } else if (staggerChildren) {
      targets = Array.from((element as HTMLElement).children) as Element[];
    }
  }

  // Initial state configuration
  gsap.set(targets, {
    opacity: 0,
    x: direction !== 'fade' ? x : 0,
    y: direction !== 'fade' ? y : 0,
  });

  // GSAP ScrollTrigger tween
  return gsap.to(targets, {
    opacity: 1,
    x: 0,
    y: 0,
    duration,
    delay,
    stagger: (staggerChildren || staggerSelector) ? stagger : 0,
    ease,
    scrollTrigger: {
      trigger: element as any,
      start: viewportStart,
      toggleActions: triggerOnce 
        ? 'play none none none' 
        : 'play none none reverse',
    }
  });
}

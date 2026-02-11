'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionContextType {
  startTransition: (href: string) => void;
  isAnimating: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  startTransition: () => {},
  isAnimating: false,
});

export const usePageTransition = () => useContext(PageTransitionContext);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFlip, setShowFlip] = useState(false);
  const [flipPhase, setFlipPhase] = useState<'idle' | 'flipping' | 'revealing' | 'done'>('idle');
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward');
  const router = useRouter();
  const pathname = usePathname();
  const pendingNavigation = useRef<string | null>(null);

  const pageOrder = ['/', '/upload', '/gallery', '/admin'];

  const FLIP_DURATION = 1600;

  const startTransition = useCallback((href: string) => {
    if (href === pathname || isAnimating) return;

    const currentIndex = pageOrder.indexOf(pathname);
    const targetIndex = pageOrder.indexOf(href);
    const direction = targetIndex > currentIndex ? 'forward' : 'backward';

    pendingNavigation.current = href;
    setFlipDirection(direction);
    setIsAnimating(true);
    setFlipPhase('flipping');
    setShowFlip(true);

    // Navigate early so the new page is rendered and ready under the overlay
    setTimeout(() => {
      if (pendingNavigation.current) {
        router.push(pendingNavigation.current);
        pendingNavigation.current = null;
      }
    }, FLIP_DURATION * 0.35);

    // 'revealing': snap the new page into view and fade the overlay out
    setTimeout(() => {
      setFlipPhase('revealing');
    }, FLIP_DURATION * 0.6);

    // Done
    setTimeout(() => {
      setFlipPhase('done');
    }, FLIP_DURATION);

    setTimeout(() => {
      setShowFlip(false);
      setFlipPhase('idle');
      setIsAnimating(false);
    }, FLIP_DURATION + 200);
  }, [pathname, router, isAnimating, pageOrder]);

  const flipDurationSec = FLIP_DURATION / 1000;

  return (
    <PageTransitionContext.Provider value={{ startTransition, isAnimating }}>
      {/* The actual page content - this is what gets "flipped" visually */}
      <motion.div
        animate={{
          rotateY: flipPhase === 'flipping'
            ? (flipDirection === 'forward' ? -180 : 180)
            : 0,
          z: flipPhase === 'flipping' ? 100 : 0,
          opacity: flipPhase === 'flipping' ? [1, 1, 0] : 1,
        }}
        transition={{
          // Instantly snap back to visible when revealing or done
          duration: flipPhase === 'flipping' ? flipDurationSec : 0,
          ease: 'easeInOut',
          opacity: {
            duration: flipPhase === 'flipping' ? flipDurationSec : 0,
            times: [0, 0.4, 0.5],
          }
        }}
        style={{
          position: 'relative',
          zIndex: flipPhase === 'flipping' ? 100 : 1,
          transformStyle: 'preserve-3d',
          transformOrigin: flipDirection === 'forward' ? '0% 50%' : '100% 50%',
          perspective: '3000px',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Paper texture overlay that appears during flip */}
        <AnimatePresence>
          {flipPhase === 'flipping' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0.5, 0.3, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: flipDurationSec,
                times: [0, 0.2, 0.5, 0.8, 1],
              }}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1000,
                pointerEvents: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                mixBlendMode: 'multiply',
              }}
            />
          )}
        </AnimatePresence>

        {/* Spine shadow during flip */}
        <AnimatePresence>
          {flipPhase === 'flipping' && (
            <motion.div
              initial={{ opacity: 0, width: '0px' }}
              animate={{
                opacity: [0, 0.3, 0.5, 0.3, 0],
                width: ['0px', '80px', '150px', '80px', '0px'],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: flipDurationSec,
                times: [0, 0.2, 0.5, 0.8, 1],
              }}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: flipDirection === 'forward' ? 0 : 'auto',
                right: flipDirection === 'backward' ? 0 : 'auto',
                zIndex: 1001,
                pointerEvents: 'none',
                background: flipDirection === 'forward'
                  ? 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 100%)'
                  : 'linear-gradient(-90deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Fold shadow — dark gradient from spine, simulates page casting shadow on itself as it lifts */}
        <AnimatePresence>
          {flipPhase === 'flipping' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.9, 0.45, 0] }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{
                duration: flipDurationSec * 0.62,
                ease: 'easeInOut',
                times: [0, 0.18, 0.4, 0.62, 0.85],
              }}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1002,
                pointerEvents: 'none',
                background: flipDirection === 'forward'
                  ? 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 10%, rgba(0,0,0,0.25) 32%, rgba(0,0,0,0.06) 58%, transparent 100%)'
                  : 'linear-gradient(-90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 10%, rgba(0,0,0,0.25) 32%, rgba(0,0,0,0.06) 58%, transparent 100%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Fold crease highlight — bright strip at the spine edge (fold line) */}
        <AnimatePresence>
          {flipPhase === 'flipping' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.85, 1, 0.55, 0] }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{
                duration: flipDurationSec * 0.55,
                ease: 'easeInOut',
                times: [0, 0.14, 0.32, 0.56, 0.82],
              }}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: flipDirection === 'forward' ? 0 : 'auto',
                right: flipDirection === 'backward' ? 0 : 'auto',
                width: '28px',
                zIndex: 1003,
                pointerEvents: 'none',
                background: flipDirection === 'forward'
                  ? 'linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.55) 35%, rgba(255,255,255,0.1) 70%, transparent 100%)'
                  : 'linear-gradient(-90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.55) 35%, rgba(255,255,255,0.1) 70%, transparent 100%)',
              }}
            />
          )}
        </AnimatePresence>

        {children}
      </motion.div>

      {/* The back of the page (paper texture) - revealed as page flips */}
      <AnimatePresence>
        {showFlip && (
          <motion.div
            initial={{
              rotateY: flipDirection === 'forward' ? 180 : -180,
              opacity: 0,
            }}
            animate={{
              rotateY: flipPhase === 'flipping'
                ? (flipDirection === 'forward' ? [180, 90, 0] : [-180, -90, 0])
                : 0,
              opacity: flipPhase === 'flipping' ? [0, 0, 1] : 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              // When 'revealing' fires, fade out fast so the new page is immediately shown
              duration: flipPhase === 'flipping' ? flipDurationSec : 0.35,
              ease: 'easeInOut',
              opacity: {
                times: flipPhase === 'flipping' ? [0, 0.4, 0.5] : undefined,
              },
              rotateY: {
                times: flipPhase === 'flipping' ? [0, 0.5, 1] : undefined,
              }
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              transformStyle: 'preserve-3d',
              transformOrigin: flipDirection === 'forward' ? '0% 50%' : '100% 50%',
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #ece7df 0%, #e6e1d9 30%, #dfdad2 60%, #d8d3cb 100%)',
            }}
          >
            {/* Paper texture on back */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.5,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                mixBlendMode: 'multiply',
              }}
            />

            {/* Faint lines */}
            <div
              style={{
                position: 'absolute',
                top: '10%',
                bottom: '10%',
                left: '8%',
                right: '8%',
                opacity: 0.05,
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 30px,
                  #2c2c2c 30px,
                  #2c2c2c 31px
                )`,
              }}
            />

            {/* Spine shadow on back of page */}
            <motion.div
              animate={{
                opacity: [0, 0.2, 0.4, 0.2, 0],
              }}
              transition={{
                duration: flipDurationSec,
                times: [0, 0.25, 0.5, 0.75, 1],
              }}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: flipDirection === 'backward' ? 0 : 'auto',
                right: flipDirection === 'forward' ? 0 : 'auto',
                width: '200px',
                background: flipDirection === 'backward'
                  ? 'linear-gradient(90deg, rgba(0,0,0,0.5) 0%, transparent 100%)'
                  : 'linear-gradient(-90deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
              }}
            />

            {/* Fold shadow on incoming page — starts strong (page just unfolded from behind), fades as it settles flat */}
            <motion.div
              animate={{ opacity: [0, 0, 0.82, 0.45, 0] }}
              transition={{
                duration: flipDurationSec,
                ease: 'easeOut',
                times: [0, 0.42, 0.5, 0.72, 1],
              }}
              style={{
                position: 'absolute',
                inset: 0,
                background: flipDirection === 'forward'
                  ? 'linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 12%, rgba(0,0,0,0.22) 38%, rgba(0,0,0,0.05) 62%, transparent 100%)'
                  : 'linear-gradient(-90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 12%, rgba(0,0,0,0.22) 38%, rgba(0,0,0,0.05) 62%, transparent 100%)',
              }}
            />

            {/* Fold crease highlight on incoming page — bright spine edge that fades as page flattens */}
            <motion.div
              animate={{ opacity: [0, 0, 0.95, 0.55, 0] }}
              transition={{
                duration: flipDurationSec,
                ease: 'easeOut',
                times: [0, 0.42, 0.5, 0.68, 1],
              }}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: flipDirection === 'forward' ? 0 : 'auto',
                right: flipDirection === 'backward' ? 0 : 'auto',
                width: '32px',
                background: flipDirection === 'forward'
                  ? 'linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.08) 75%, transparent 100%)'
                  : 'linear-gradient(-90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.08) 75%, transparent 100%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ground shadow */}
      <AnimatePresence>
        {flipPhase === 'flipping' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.4, 0.6, 0.4, 0],
              scaleX: [1, 0.9, 0.7, 0.9, 0.5],
              x: flipDirection === 'forward'
                ? ['0%', '-10%', '-25%', '-35%', '-45%']
                : ['0%', '10%', '25%', '35%', '45%'],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: flipDurationSec,
              times: [0, 0.2, 0.5, 0.8, 1],
            }}
            style={{
              position: 'fixed',
              bottom: '0',
              left: '5%',
              right: '5%',
              height: '100px',
              zIndex: 99,
              background: 'radial-gradient(ellipse 100% 50% at 50% 100%, rgba(0,0,0,0.7) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Perspective container for 3D effect */}
      <style jsx global>{`
        body {
          perspective: ${(flipPhase === 'flipping' || flipPhase === 'revealing') ? '3000px' : 'none'};
          perspective-origin: ${flipDirection === 'forward' ? '0% 50%' : '100% 50%'};
        }
      `}</style>
    </PageTransitionContext.Provider>
  );
}

interface TransitionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

export function TransitionLink({ href, children, className, style, title }: TransitionLinkProps) {
  const { startTransition, isAnimating } = usePageTransition();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href === pathname || isAnimating) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    startTransition(href);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      style={style}
      title={title}
    >
      {children}
    </Link>
  );
}

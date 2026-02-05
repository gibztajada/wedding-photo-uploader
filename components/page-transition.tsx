'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface PageTransitionContextType {
  isTransitioning: boolean;
  startTransition: (href: string) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  isTransitioning: false,
  startTransition: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);

interface PageTransitionProviderProps {
  children: React.ReactNode;
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Page order for determining flip direction
  const pageOrder = ['/', '/upload', '/gallery', '/admin'];

  const startTransition = useCallback((href: string) => {
    if (href === pathname) return;

    const currentIndex = pageOrder.indexOf(pathname);
    const targetIndex = pageOrder.indexOf(href);

    // Determine direction based on page order
    const direction = targetIndex > currentIndex ? 'forward' : 'backward';
    setTransitionDirection(direction);

    setIsTransitioning(true);
    setPendingHref(href);

    // Navigate after the flip-out animation
    setTimeout(() => {
      router.push(href);
    }, 400);
  }, [pathname, router]);

  // Reset transition state when navigation completes
  useEffect(() => {
    if (pendingHref && pathname === pendingHref) {
      // Small delay to allow flip-in animation
      setTimeout(() => {
        setIsTransitioning(false);
        setPendingHref(null);
      }, 100);
    }
  }, [pathname, pendingHref]);

  return (
    <PageTransitionContext.Provider value={{ isTransitioning, startTransition }}>
      <div className="page-transition-wrapper">
        {/* Page flip overlay */}
        <div
          className={`page-flip-overlay ${isTransitioning ? 'active' : ''} ${transitionDirection}`}
          aria-hidden="true"
        >
          <div className="page-flip-paper">
            <div className="page-flip-texture" />
          </div>
        </div>

        {/* Main content with flip animation */}
        <div
          className={`page-content ${isTransitioning ? `flipping-out ${transitionDirection}` : 'flipping-in'}`}
        >
          {children}
        </div>
      </div>
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
  const { startTransition, isTransitioning } = usePageTransition();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Don't transition if same page or already transitioning
    if (href === pathname || isTransitioning) {
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

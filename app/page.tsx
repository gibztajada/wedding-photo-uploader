'use client';

import { useEffect, useState } from 'react';
import { TransitionLink } from '@/components/page-transition';
import { Camera, Images } from 'lucide-react';

interface CouplePhotoData {
  image_url: string | null;
}

export default function Home() {
  const [couplePhoto, setCouplePhoto] = useState<CouplePhotoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchCouplePhoto = async () => {
      try {
        const response = await fetch('/api/couple-photo');
        if (response.ok) {
          const data = await response.json();
          setCouplePhoto(data);
        }
      } catch (error) {
        console.error('Failed to fetch couple photo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCouplePhoto();
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const heroImage = couplePhoto?.image_url || 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop';

  return (
    <main
      className="flex min-h-[100dvh] w-full items-center justify-center overflow-x-hidden p-2 sm:p-4"
      style={{
        background: `
          linear-gradient(180deg, #f5f0e8 0%, #ede6da 50%, #e8e0d0 100%)
        `,
      }}
    >
      {/* Paper texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Newspaper Container */}
      <div
        className={`relative w-full max-w-2xl transition-all duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Main Newspaper Frame */}
        <div
          className="relative border-2 border-[#2c2c2c] bg-[#f8f4ec] p-3 shadow-[4px_4px_0_rgba(0,0,0,0.1)] sm:border-[3px] sm:p-4 md:p-6 md:shadow-[8px_8px_0_rgba(0,0,0,0.1)]"
          style={{
            backgroundImage: `
              linear-gradient(180deg, #faf6ee 0%, #f5f0e6 100%),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23grain)' opacity='0.08'/%3E%3C/svg%3E")
            `,
          }}
        >
          {/* Top decorative border */}
          <div className="absolute left-0 right-0 top-0 h-0.5 bg-[#2c2c2c] sm:h-1" />
          <div className="absolute left-0 right-0 top-1.5 h-px bg-[#2c2c2c] sm:top-2" />

          {/* Header Section */}
          <header className="mb-2 border-b-2 border-[#2c2c2c] pb-2 sm:mb-3 sm:border-b-[3px] sm:pb-3 md:mb-4 md:pb-4">
            {/* Special Edition badges and masthead */}
            <div className="flex items-center justify-between gap-1">
              {/* Left badge */}
              <div className="hidden flex-col items-center border border-[#2c2c2c] px-1.5 py-0.5 sm:flex sm:px-2 sm:py-1 md:px-3">
                <span
                  className="text-[6px] font-bold uppercase tracking-wider text-[#2c2c2c] sm:text-[8px] md:text-[10px]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Special
                </span>
                <span
                  className="text-[6px] font-bold uppercase tracking-wider text-[#2c2c2c] sm:text-[8px] md:text-[10px]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Edition
                </span>
              </div>

              {/* Masthead */}
              <div className="flex-1 text-center">
                <h1
                  className="text-lg text-[#2c2c2c] sm:text-2xl md:text-3xl lg:text-4xl"
                  style={{
                    fontFamily: 'var(--font-unifraktur), "UnifrakturMaguntia", "Old English Text MT", serif',
                    letterSpacing: '0.02em',
                  }}
                >
                  The Wedding Times
                </h1>
              </div>

              {/* Right badge */}
              <div className="hidden flex-col items-center border border-[#2c2c2c] px-1.5 py-0.5 sm:flex sm:px-2 sm:py-1 md:px-3">
                <span
                  className="text-[6px] font-bold uppercase tracking-wider text-[#2c2c2c] sm:text-[8px] md:text-[10px]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Special
                </span>
                <span
                  className="text-[6px] font-bold uppercase tracking-wider text-[#2c2c2c] sm:text-[8px] md:text-[10px]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Edition
                </span>
              </div>
            </div>

            {/* Subheader row */}
            <div className="mt-1.5 flex items-center justify-between border-t border-b border-[#2c2c2c]/30 py-0.5 text-[7px] sm:mt-2 sm:py-1 sm:text-[9px] md:mt-3 md:py-1.5 md:text-xs">
              <span
                className="uppercase tracking-wider text-[#2c2c2c]/80"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Vol. 1
              </span>

              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                <span className="text-[#2c2c2c]/60">◆</span>
                <span
                  className="font-medium uppercase tracking-wide text-[#2c2c2c] sm:tracking-widest"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Madonna & Gilbert
                </span>
                <span className="text-[#2c2c2c]/60">◆</span>
              </div>

              <span
                className="uppercase tracking-wider text-[#2c2c2c]/80"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                2025
              </span>
            </div>
          </header>

          {/* Main Headline */}
          <div className="mb-2 text-center sm:mb-3 md:mb-4">
            <h2
              className="text-lg leading-tight text-[#2c2c2c] sm:text-xl md:text-3xl lg:text-4xl"
              style={{
                fontFamily: 'var(--font-pinyon), "Pinyon Script", cursive',
                lineHeight: '1.2',
              }}
            >
              Share your captured moments
            </h2>
          </div>

          {/* Photo Section */}
          <div className="relative mx-auto mb-2 flex justify-center sm:mb-3 md:mb-4">
            {/* Photo frame */}
            <div className="relative inline-block border-2 border-[#2c2c2c] bg-[#2c2c2c] p-0.5 sm:border-[3px] sm:p-1">
              {/* Inner border */}
              <div className="border border-[#2c2c2c]/20">
                {isLoading ? (
                  <div
                    className="h-32 w-24 animate-pulse bg-gray-300 sm:h-48 sm:w-36 md:h-56 md:w-44"
                  />
                ) : (
                  <img
                    src={heroImage}
                    alt="Madonna & Gilbert"
                    className="block h-32 w-auto sm:h-48 md:h-56 lg:h-64"
                    style={{
                      filter: 'grayscale(100%) contrast(1.1) brightness(1.05)',
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Couple Names */}
          <div className="mb-2 text-center sm:mb-3 md:mb-4">
            <div className="mb-1 flex items-center justify-center gap-2 sm:mb-2 sm:gap-3 md:gap-4">
              <div className="h-px flex-1 bg-[#2c2c2c]/40" />
              <h3
                className="text-sm font-black uppercase tracking-wide text-[#2c2c2c] sm:text-lg md:text-2xl lg:text-3xl"
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  letterSpacing: '0.05em',
                }}
              >
                MADONNA & GILBERT
              </h3>
              <div className="h-px flex-1 bg-[#2c2c2c]/40" />
            </div>

            <p
              className="text-sm text-[#2c2c2c]/80 sm:text-base md:text-xl"
              style={{
                fontFamily: 'var(--font-pinyon), "Pinyon Script", cursive',
              }}
            >
              capturing our special day
            </p>
          </div>

          {/* Decorative divider */}
          <div className="mb-2 flex items-center justify-center gap-2 sm:mb-3 md:mb-4">
            <div className="h-px w-6 bg-[#2c2c2c]/40 sm:w-8 md:w-12" />
            <span className="text-xs text-[#2c2c2c]/60 sm:text-sm">❧</span>
            <div className="h-px w-6 bg-[#2c2c2c]/40 sm:w-8 md:w-12" />
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3 md:gap-4">
            <TransitionLink
              href="/upload"
              className="group relative flex w-full items-center justify-center gap-1.5 border-2 border-[#2c2c2c] bg-[#2c2c2c] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f8f4ec] transition-all duration-300 hover:bg-[#f8f4ec] hover:text-[#2c2c2c] sm:w-auto sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-base"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <Camera className="h-3.5 w-3.5 transition-transform group-hover:rotate-12 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              Upload Photos
            </TransitionLink>

            <TransitionLink
              href="/gallery"
              className="group relative flex w-full items-center justify-center gap-1.5 border-2 border-[#2c2c2c] bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#2c2c2c] transition-all duration-300 hover:bg-[#2c2c2c] hover:text-[#f8f4ec] sm:w-auto sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-base"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <Images className="h-3.5 w-3.5 transition-transform group-hover:scale-110 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              View Gallery
            </TransitionLink>
          </div>

          {/* Footer text */}
          <div className="mt-3 border-t border-[#2c2c2c]/30 pt-2 text-center sm:mt-4 sm:pt-3 md:mt-6 md:pt-4">
            <p
              className="text-[8px] uppercase tracking-[0.15em] text-[#2c2c2c]/60 sm:text-[10px] sm:tracking-[0.2em] md:text-xs"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Help us capture every beautiful moment
            </p>
          </div>

          {/* Bottom decorative border */}
          <div className="absolute bottom-1.5 left-0 right-0 h-px bg-[#2c2c2c] sm:bottom-2" />
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2c2c2c] sm:h-1" />
        </div>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Camera, Grid2X2, Heart } from 'lucide-react';

interface CouplePhotoData {
  image_url: string | null;
}

// Floating hearts component for romantic ambiance
function FloatingHearts() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float-heart opacity-20"
          style={{
            left: `${15 + i * 15}%`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${8 + i * 2}s`,
          }}
        >
          <Heart
            className="h-4 w-4 fill-pink-300 text-pink-300 md:h-6 md:w-6"
            style={{ filter: 'blur(1px)' }}
          />
        </div>
      ))}
    </div>
  );
}

// Decorative corner flourish
function CornerFlourish({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const positionClasses = {
    'top-left': 'top-3 left-3 md:top-5 md:left-5',
    'top-right': 'top-3 right-3 md:top-5 md:right-5 rotate-90',
    'bottom-left': 'bottom-3 left-3 md:bottom-5 md:left-5 -rotate-90',
    'bottom-right': 'bottom-3 right-3 md:bottom-5 md:right-5 rotate-180',
  };

  return (
    <svg
      className={`absolute z-30 h-8 w-8 text-white/40 md:h-12 md:w-12 ${positionClasses[position]}`}
      viewBox="0 0 50 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M5 25 Q5 5 25 5" strokeLinecap="round" />
      <path d="M10 25 Q10 10 25 10" strokeLinecap="round" />
      <circle cx="25" cy="5" r="2" fill="currentColor" />
    </svg>
  );
}

// Sparkle effect component
function Sparkle({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div
      className={`absolute animate-sparkle ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <svg className="h-2 w-2 md:h-3 md:w-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
      </svg>
    </div>
  );
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

    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const heroImage = couplePhoto?.image_url || 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop';

  return (
    <main className="flex h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-b from-[#fdf8f6] via-[#faf5f3] to-[#f8ede8]">
      {/* Ambient background texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(233, 30, 140, 0.08) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255, 182, 193, 0.12) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, rgba(255, 228, 225, 0.15) 0%, transparent 70%)`,
        }}
      />

      {/* Couple Names Header */}
      <header
        className={`relative z-10 shrink-0 px-4 pt-4 pb-1 text-center md:pt-6 md:pb-2 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {/* Decorative top flourish */}
        <div className="mb-2 flex items-center justify-center gap-2 md:mb-3">
          <div className="h-px w-8 bg-gradient-to-r from-transparent via-[#e91e8c]/30 to-[#e91e8c]/50 md:w-16" />
          <svg className="h-3 w-3 text-[#e91e8c]/60 md:h-4 md:w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
          </svg>
          <div className="h-px w-8 bg-gradient-to-l from-transparent via-[#e91e8c]/30 to-[#e91e8c]/50 md:w-16" />
        </div>

        {/* Couple Names */}
        <div className="relative inline-block">
          {/* Names container */}
          <h1 className="flex flex-col items-center gap-0 md:flex-row md:gap-3">
            <span
              className="text-2xl font-normal tracking-wide text-gray-800 md:text-3xl lg:text-4xl"
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontStyle: 'italic',
              }}
            >
              Madonna
            </span>

            {/* Elegant ampersand with heart */}
            <span className="relative my-0.5 flex items-center justify-center md:my-0">
              <span
                className="text-xl text-[#e91e8c] md:text-2xl lg:text-3xl"
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontStyle: 'italic',
                }}
              >
                &
              </span>
              <Heart className="absolute -right-2 -top-1 h-2 w-2 fill-pink-400/60 text-pink-400/60 md:h-2.5 md:w-2.5" />
            </span>

            <span
              className="text-2xl font-normal tracking-wide text-gray-800 md:text-3xl lg:text-4xl"
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontStyle: 'italic',
              }}
            >
              Gilbert
            </span>
          </h1>

          {/* Subtle underline accent */}
          <div className="mx-auto mt-1.5 h-0.5 w-16 rounded-full bg-gradient-to-r from-transparent via-[#e91e8c]/40 to-transparent md:mt-2 md:w-24" />
        </div>

        {/* Wedding date or tagline */}
        <p
          className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-gray-500/80 md:mt-2 md:text-xs"
          style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
        >
          Our Wedding Celebration
        </p>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-0 flex-1 flex-col px-3 pb-3 md:px-8 md:pb-6">
        <div className="mx-auto flex w-full max-w-2xl min-h-0 flex-1 flex-col">
          {/* Hero Image Container with elegant frame */}
          <div
            className={`group relative min-h-0 flex-1 transition-all duration-1000 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Outer decorative border */}
            <div className="absolute -inset-1 rounded-[2.25rem] md:rounded-[2.75rem] bg-gradient-to-br from-pink-200/50 via-white/30 to-rose-200/50 blur-sm md:-inset-2" />

            {/* Golden inner glow */}
            <div className="absolute -inset-0.5 rounded-[2.1rem] md:rounded-[2.6rem] bg-gradient-to-br from-amber-100/20 via-transparent to-rose-100/20" />

            {/* Main container */}
            <div className="relative h-full min-h-0 overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-[0_25px_60px_-12px_rgba(0,0,0,0.15),0_0_40px_-5px_rgba(233,30,140,0.1)]">

              {/* Corner flourishes */}
              <CornerFlourish position="top-left" />
              <CornerFlourish position="top-right" />
              <CornerFlourish position="bottom-left" />
              <CornerFlourish position="bottom-right" />

              {/* Floating hearts */}
              <FloatingHearts />

              {/* Image with subtle zoom on load */}
              <div className="absolute inset-0">
                {isLoading ? (
                  <div className="h-full w-full animate-pulse bg-gradient-to-br from-pink-50 to-rose-100" />
                ) : (
                  <img
                    src={heroImage}
                    alt="Wedding couple"
                    className={`h-full w-full object-cover transition-transform duration-[2s] ease-out ${
                      isVisible ? 'scale-100' : 'scale-110'
                    }`}
                  />
                )}
              </div>

              {/* Subtle dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/25" />

              {/* Romantic gradient overlay for depth */}
              <div
                className="absolute inset-0 z-10"
                style={{
                  background: `linear-gradient(180deg,
                    rgba(0,0,0,0.1) 0%,
                    rgba(0,0,0,0.05) 30%,
                    rgba(0,0,0,0.15) 70%,
                    rgba(0,0,0,0.4) 100%),
                    radial-gradient(ellipse at center top, rgba(255,228,225,0.15) 0%, transparent 60%)`,
                }}
              />

              {/* Soft vignette */}
              <div
                className="absolute inset-0 z-10"
                style={{
                  background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.2) 100%)',
                }}
              />

              {/* Sparkles scattered around */}
              <Sparkle className="top-[15%] left-[20%] text-white/60" delay={0.5} />
              <Sparkle className="top-[25%] right-[15%] text-amber-200/50" delay={1.2} />
              <Sparkle className="bottom-[30%] left-[12%] text-pink-200/50" delay={2} />
              <Sparkle className="top-[40%] right-[25%] text-white/40" delay={2.8} />

              {/* Content Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center md:px-10">

                {/* Decorative line above title */}
                <div
                  className={`mb-4 flex items-center gap-3 transition-all duration-700 delay-300 md:mb-6 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                  }`}
                >
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/60 md:w-12" />
                  <Heart className="h-3 w-3 fill-pink-300/80 text-pink-300/80 md:h-4 md:w-4" />
                  <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/60 md:w-12" />
                </div>

                {/* Main heading with text shadow */}
                <h1
                  className={`mb-3 text-2xl font-normal leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] sm:text-3xl md:mb-4 md:text-5xl lg:text-6xl transition-all duration-700 delay-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontStyle: 'italic',
                    textShadow: '0 2px 20px rgba(0,0,0,0.25), 0 4px 40px rgba(0,0,0,0.15)',
                  }}
                >
                  Capture the Magic of Our<br />Special Day
                </h1>

                {/* Subtitle with elegant styling */}
                <p
                  className={`mb-6 max-w-md text-xs text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] sm:text-sm md:mb-8 md:text-base transition-all duration-700 delay-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{
                    fontFamily: "var(--font-crimson), Georgia, serif",
                    textShadow: '0 1px 8px rgba(0,0,0,0.2)',
                    letterSpacing: '0.02em',
                  }}
                >
                  We're so happy to have you with us. Please share your favorite moments from our
                  celebration to help us remember every beautiful detail forever.
                </p>

                {/* CTA Buttons with enhanced styling */}
                <div
                  className={`flex flex-wrap items-center justify-center gap-3 md:gap-4 transition-all duration-700 delay-[900ms] ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <Link
                    href="/upload"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#e91e8c] to-[#d42a78] px-5 py-2.5 text-xs font-medium text-white shadow-[0_4px_20px_rgba(233,30,140,0.4)] transition-all duration-300 hover:shadow-[0_6px_30px_rgba(233,30,140,0.5)] hover:scale-105 sm:px-7 sm:py-3 sm:text-sm"
                  >
                    {/* Shine effect */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <Camera className="relative h-3.5 w-3.5 transition-transform group-hover:rotate-12 sm:h-4 sm:w-4" />
                    <span className="relative">Share Your Moments</span>
                  </Link>

                  <Link
                    href="/gallery"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-medium text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white/50 hover:shadow-[0_6px_25px_rgba(0,0,0,0.25)] hover:scale-105 sm:px-7 sm:py-3 sm:text-sm"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <Grid2X2 className="relative h-3.5 w-3.5 transition-transform group-hover:scale-110 sm:h-4 sm:w-4" />
                    <span className="relative">View Gallery</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with refined styling */}
      <footer
        className={`relative shrink-0 overflow-hidden px-6 py-5 text-center md:py-6 transition-all duration-700 delay-[1100ms] ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 40%, #fbcfe8 70%, #f9a8d4 100%)',
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(233,30,140,0.1) 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative">
          {/* Decorative element */}
          <div className="mb-2 flex items-center justify-center gap-2 md:mb-3">
            <div className="h-px w-6 bg-gradient-to-r from-transparent to-[#e91e8c]/40 md:w-10" />
            <div className="rounded-full bg-white/70 p-1.5 shadow-sm ring-1 ring-pink-200/50 md:p-2">
              <Heart className="h-4 w-4 fill-[#e91e8c] text-[#e91e8c] md:h-5 md:w-5" />
            </div>
            <div className="h-px w-6 bg-gradient-to-l from-transparent to-[#e91e8c]/40 md:w-10" />
          </div>

          {/* Text */}
          <h2
            className="mb-1 text-base font-semibold text-gray-800 md:text-lg"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Join the Celebration
          </h2>
          <p
            className="mx-auto max-w-sm text-xs text-gray-600/90 md:text-sm"
            style={{
              fontFamily: "var(--font-crimson), Georgia, serif",
              letterSpacing: '0.01em',
            }}
          >
            Every photo you take is a gift to us. See all the beautiful moments shared by our loved ones.
          </p>
        </div>
      </footer>
    </main>
  );
}

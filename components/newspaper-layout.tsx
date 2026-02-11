'use client';

import { useEffect, useState } from 'react';
import { TransitionLink } from '@/components/page-transition';
import { ArrowLeft, Home } from 'lucide-react';

interface NewspaperLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  pageNumber?: number;
  showBack?: boolean;
  showHome?: boolean;
}

export function NewspaperLayout({
  children,
  title,
  subtitle,
  pageNumber = 2,
  showBack = false,
  showHome = false,
}: NewspaperLayoutProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      className="flex min-h-[100dvh] flex-col w-full overflow-x-hidden py-2 sm:py-4"
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
        className={`relative mx-auto w-full max-w-2xl flex-1 flex flex-col px-2 transition-all duration-1000 sm:px-4 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Main Newspaper Frame */}
        <div
          className="relative flex flex-1 flex-col border-2 border-[#2c2c2c] bg-[#f8f4ec] p-3 shadow-[4px_4px_0_rgba(0,0,0,0.1)] sm:border-[3px] sm:p-4 md:p-6 md:shadow-[8px_8px_0_rgba(0,0,0,0.1)]"
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
          <header className="mb-3 border-b-2 border-[#2c2c2c] pb-2 sm:mb-4 sm:border-b-[3px] sm:pb-3 md:mb-5 md:pb-4">
            {/* Navigation and Page Info Row */}
            <div className="mb-2 flex items-center justify-between text-[8px] sm:mb-3 sm:text-[10px] md:text-xs">
              <div className="flex items-center gap-1">
                {showBack && (
                  <TransitionLink
                    href="/"
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded text-[#2c2c2c]/70 transition-colors hover:text-[#2c2c2c] active:bg-[#2c2c2c]/10 sm:min-h-0 sm:min-w-0 sm:gap-1 sm:rounded-none sm:p-0"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    <ArrowLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    <span>Back</span>
                  </TransitionLink>
                )}
                {showHome && (
                  <TransitionLink
                    href="/"
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded text-[#2c2c2c]/70 transition-colors hover:text-[#2c2c2c] active:bg-[#2c2c2c]/10 sm:min-h-0 sm:min-w-0 sm:gap-1 sm:rounded-none sm:p-0"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    <Home className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    <span>Home</span>
                  </TransitionLink>
                )}
              </div>

              <span
                className="uppercase tracking-wider text-[#2c2c2c]/60"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                The Wedding Times
              </span>

              <span
                className="uppercase tracking-wider text-[#2c2c2c]/60"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Page {pageNumber}
              </span>
            </div>

            {/* Title */}
            <div className="text-center">
              <h1
                className="text-xl text-[#2c2c2c] sm:text-2xl md:text-3xl"
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  letterSpacing: '0.05em',
                }}
              >
                {title}
              </h1>

              {subtitle && (
                <p
                  className="mt-1 text-sm text-[#2c2c2c]/70 sm:mt-2 sm:text-base md:text-lg"
                  style={{
                    fontFamily: 'var(--font-pinyon), "Pinyon Script", cursive',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* Decorative line under title */}
            <div className="mt-2 flex items-center justify-center gap-2 sm:mt-3">
              <div className="h-px w-8 bg-[#2c2c2c]/40 sm:w-12" />
              <span className="text-[10px] text-[#2c2c2c]/50 sm:text-xs">❧</span>
              <div className="h-px w-8 bg-[#2c2c2c]/40 sm:w-12" />
            </div>
          </header>

          {/* Main Content */}
          <div className="relative flex-1">{children}</div>

          {/* Footer */}
          <footer className="mt-4 border-t border-[#2c2c2c]/30 pt-3 text-center sm:mt-6 sm:pt-4">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <TransitionLink
                href="/"
                className="text-[8px] uppercase tracking-wider text-[#2c2c2c]/60 transition-colors hover:text-[#2c2c2c] sm:text-[10px] md:text-xs"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Front Page
              </TransitionLink>
              <span className="text-[#2c2c2c]/30">|</span>
              <TransitionLink
                href="/upload"
                className="text-[8px] uppercase tracking-wider text-[#2c2c2c]/60 transition-colors hover:text-[#2c2c2c] sm:text-[10px] md:text-xs"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Submit Photos
              </TransitionLink>
              <span className="text-[#2c2c2c]/30">|</span>
              <TransitionLink
                href="/gallery"
                className="text-[8px] uppercase tracking-wider text-[#2c2c2c]/60 transition-colors hover:text-[#2c2c2c] sm:text-[10px] md:text-xs"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Photo Gallery
              </TransitionLink>
            </div>
            <p
              className="mt-2 text-[7px] text-[#2c2c2c]/40 sm:mt-3 sm:text-[8px] md:text-[10px]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Madonna & Gilbert • 2025
            </p>
          </footer>

          {/* Bottom decorative border */}
          <div className="absolute bottom-1.5 left-0 right-0 h-px bg-[#2c2c2c] sm:bottom-2" />
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2c2c2c] sm:h-1" />
        </div>
      </div>
    </main>
  );
}

export function NewspaperCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`border border-[#2c2c2c]/20 bg-[#faf6ee] p-3 sm:p-4 ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23grain)' opacity='0.05'/%3E%3C/svg%3E")`,
      }}
    >
      {children}
    </div>
  );
}

export function NewspaperButton({
  children,
  variant = 'primary',
  disabled = false,
  type = 'button',
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  onClick?: () => void;
}) {
  const baseStyles = 'flex items-center justify-center gap-1.5 border-2 border-[#2c2c2c] px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#2c2c2c] text-[#f8f4ec] hover:bg-[#f8f4ec] hover:text-[#2c2c2c] disabled:hover:bg-[#2c2c2c] disabled:hover:text-[#f8f4ec]',
    secondary: 'bg-transparent text-[#2c2c2c] hover:bg-[#2c2c2c] hover:text-[#f8f4ec] disabled:hover:bg-transparent disabled:hover:text-[#2c2c2c]',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {children}
    </button>
  );
}

export function NewspaperInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <label
        className="block text-[10px] font-medium uppercase tracking-wider text-[#2c2c2c]/80 sm:text-xs"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border border-[#2c2c2c]/30 bg-[#faf6ee] px-3 py-2 text-sm text-[#2c2c2c] placeholder-[#2c2c2c]/40 transition-colors focus:border-[#2c2c2c] focus:outline-none disabled:opacity-50 sm:px-4 sm:py-2.5"
        style={{ fontFamily: 'Georgia, serif' }}
      />
    </div>
  );
}

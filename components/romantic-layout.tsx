'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Home } from 'lucide-react';

// Floating hearts component for romantic ambiance
function FloatingHearts({ count = 4 }: { count?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float-heart opacity-10"
          style={{
            left: `${10 + i * 20}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: `${10 + i * 3}s`,
          }}
        >
          <Heart
            className="h-3 w-3 fill-pink-300 text-pink-300 md:h-4 md:w-4"
            style={{ filter: 'blur(1px)' }}
          />
        </div>
      ))}
    </div>
  );
}

// Page header with navigation
function PageHeader({
  title,
  subtitle,
  showBack = true,
  showHome = false,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showHome?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`mb-8 text-center transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between">
        {showBack ? (
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#e91e8c]"
            style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Link>
        ) : (
          <div />
        )}
        {showHome && (
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#e91e8c]"
            style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        )}
      </div>

      {/* Decorative element */}
      <div className="mb-4 flex items-center justify-center gap-3">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#e91e8c]/30" />
        <Heart className="h-4 w-4 fill-[#e91e8c]/60 text-[#e91e8c]/60" />
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#e91e8c]/30" />
      </div>

      {/* Title */}
      <h1
        className="mb-2 text-3xl font-normal text-gray-800 md:text-4xl"
        style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontStyle: 'italic',
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          className="mx-auto max-w-md text-sm text-gray-500 md:text-base"
          style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Romantic footer
function RomanticFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={`relative shrink-0 overflow-hidden px-6 text-center ${
        compact ? 'py-4' : 'py-5 md:py-6'
      }`}
      style={{
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 40%, #fbcfe8 70%, #f9a8d4 100%)',
      }}
    >
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(233,30,140,0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative">
        {/* Decorative element */}
        <div className="mb-2 flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#e91e8c]/40" />
          <div className="rounded-full bg-white/70 p-1.5 shadow-sm ring-1 ring-pink-200/50">
            <Heart className="h-3 w-3 fill-[#e91e8c] text-[#e91e8c] md:h-4 md:w-4" />
          </div>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#e91e8c]/40" />
        </div>

        {/* Text */}
        <p
          className="text-xs text-gray-600/80 md:text-sm"
          style={{
            fontFamily: "var(--font-crimson), Georgia, serif",
            letterSpacing: '0.01em',
          }}
        >
          Every moment is a treasure
        </p>
      </div>
    </footer>
  );
}

// Main romantic layout wrapper
export function RomanticLayout({
  children,
  title,
  subtitle,
  showBack = true,
  showHome = false,
  showFooter = true,
  fullHeight = true,
  compactFooter = false,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showHome?: boolean;
  showFooter?: boolean;
  fullHeight?: boolean;
  compactFooter?: boolean;
}) {
  return (
    <main
      className={`flex w-full flex-col overflow-x-hidden bg-gradient-to-b from-[#fdf8f6] via-[#faf5f3] to-[#f8ede8] ${
        fullHeight ? 'min-h-screen' : ''
      }`}
    >
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(233, 30, 140, 0.06) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255, 182, 193, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, rgba(255, 228, 225, 0.12) 0%, transparent 70%)`,
        }}
      />

      {/* Floating hearts */}
      <FloatingHearts count={3} />

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-4xl flex-1">
          <PageHeader
            title={title}
            subtitle={subtitle}
            showBack={showBack}
            showHome={showHome}
          />
          {children}
        </div>
      </div>

      {/* Footer */}
      {showFooter && <RomanticFooter compact={compactFooter} />}
    </main>
  );
}

// Romantic card wrapper for forms
export function RomanticCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {/* Outer glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-pink-200/40 via-white/20 to-rose-200/40 blur-sm" />

      {/* Inner border glow */}
      <div className="absolute -inset-0.5 rounded-[1.4rem] bg-gradient-to-br from-amber-100/15 via-transparent to-rose-100/15" />

      {/* Card content */}
      <div className="relative rounded-2xl border border-pink-100/50 bg-white/80 p-6 shadow-[0_10px_40px_-10px_rgba(233,30,140,0.1)] backdrop-blur-sm md:p-8">
        {children}
      </div>
    </div>
  );
}

// Romantic button styles
export function RomanticButton({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
}) {
  const baseClasses =
    'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#e91e8c] to-[#d42a78] text-white shadow-[0_4px_20px_rgba(233,30,140,0.3)] hover:shadow-[0_6px_30px_rgba(233,30,140,0.4)] hover:scale-105',
    secondary:
      'bg-gray-900 text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:bg-gray-800 hover:shadow-[0_6px_25px_rgba(0,0,0,0.2)] hover:scale-105',
    outline:
      'border border-[#e91e8c]/30 bg-white/50 text-[#e91e8c] hover:bg-[#e91e8c]/5 hover:border-[#e91e8c]/50',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {/* Shine effect for primary */}
      {variant === 'primary' && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

// Romantic input styles
export function RomanticInput({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-pink-200/50 bg-white/70 px-4 py-3 text-gray-800 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-[#e91e8c]/50 focus:outline-none focus:ring-2 focus:ring-[#e91e8c]/20 disabled:opacity-50 ${className}`}
      style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
    />
  );
}

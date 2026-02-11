import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Playfair_Display, Crimson_Text, UnifrakturMaguntia, Pinyon_Script } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PageTransitionProvider } from '@/components/page-transition'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-geist-mono' });
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
});
const crimsonText = Crimson_Text({
  weight: ['400', '600'],
  subsets: ["latin"],
  variable: '--font-crimson',
});
// Old English/Blackletter font for newspaper masthead
const unifraktur = UnifrakturMaguntia({
  weight: '400',
  subsets: ["latin"],
  variable: '--font-unifraktur',
});
// Elegant script font for "the" and taglines
const pinyonScript = Pinyon_Script({
  weight: '400',
  subsets: ["latin"],
  variable: '--font-pinyon',
});

export const metadata: Metadata = {
  title: 'Wedding Photo Share',
  description: 'Share your wedding photos with all the guests',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} ${playfairDisplay.variable} ${crimsonText.variable} ${unifraktur.variable} ${pinyonScript.variable} font-sans antialiased min-h-[100dvh]`}>
        <PageTransitionProvider>
          {children}
        </PageTransitionProvider>
        <Analytics />
      </body>
    </html>
  )
}

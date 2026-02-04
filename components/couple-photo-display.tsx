'use client';

import React, { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CouplePhotoData {
  image_url: string | null;
}

export function CouplePhotoDisplay() {
  const [couplePhoto, setCouplePhoto] = useState<CouplePhotoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto bg-card border-4 border-foreground shadow-lg">
      {/* Newspaper Header */}
      <div className="border-b-4 border-foreground py-3 px-4 md:py-4 md:px-6 text-center">
        <h1 className="font-crimson text-3xl md:text-6xl font-semibold text-foreground mb-1 leading-tight" style={{ fontFamily: 'Crimson Text, serif', letterSpacing: '0.05em', fontStyle: 'italic', lineHeight: '1.1' }}>
          The Wedding Times
        </h1>
        <div className="flex items-center justify-center gap-2 md:gap-4 text-xs font-playfair text-foreground mb-2 md:mb-3 flex-wrap" style={{ fontFamily: 'Playfair Display, serif' }}>
          <span>VOL. 01</span>
          <div className="w-12 md:w-24 h-px bg-foreground" />
          <span className="text-xs">TODAY</span>
          <div className="w-12 md:w-24 h-px bg-foreground" />
          <span>PHX, AZ</span>
        </div>
        <h2 className="text-lg md:text-2xl italic font-playfair text-muted-foreground mb-2 md:mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Madonna &amp; Gilbert
        </h2>
        <h3 className="text-2xl md:text-4xl font-playfair font-bold text-foreground leading-tight" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.05em', lineHeight: '1.1' }}>
          TODAY IS THE DAY
        </h3>
      </div>

      {/* Main Content Area */}
      <div className="p-8">
        {/* Couple Photo Section */}
        <div className="flex justify-center mb-8">
          {isLoading ? (
            <div className="w-96 h-80 border-2 border-border bg-muted rounded flex items-center justify-center">
              <Spinner className="w-6 h-6" />
            </div>
          ) : !couplePhoto?.image_url ? (
            <div className="w-96 h-80 border-4 border-dashed border-muted-foreground bg-muted/50 rounded flex items-center justify-center">
              <p className="text-muted-foreground text-center text-sm">
                Couple photo coming soon
              </p>
            </div>
          ) : (
            <div className="w-96 h-80 border-2 border-foreground rounded overflow-hidden shadow-md">
              <img
                src={couplePhoto.image_url || "/placeholder.svg"}
                alt="Couple photo"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Photo Caption */}
        <div className="border-t-2 border-b-2 border-foreground py-4 text-center mb-8">
          <p className="font-playfair text-sm text-foreground" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.05em' }}>
            SHARE YOUR MOMENT WITH US BY UPLOADING YOUR IMAGES
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <Link href="/upload" className="w-full">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Upload Wedding Photos
            </Button>
          </Link>
          <Link href="/gallery" className="w-full">
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent">
              See Shared Images
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

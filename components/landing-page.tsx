'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Heart, Sparkles, Star } from 'lucide-react';

interface PhotoCollection {
  id: string;
  name: string;
  photoCount: number;
  image: string;
}

export function LandingPage() {
  const [collections, setCollections] = useState<PhotoCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch collections data
    const fetchCollections = async () => {
      try {
        // For now, we'll create mock collections
        // In a real scenario, this would come from an API
        setCollections([
          {
            id: '1',
            name: 'The Ceremony',
            photoCount: 41,
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=500&fit=crop',
          },
          {
            id: '2',
            name: 'Cocktail Hour',
            photoCount: 12,
            image: 'https://images.unsplash.com/photo-1514432324607-2e467ad34141?w=500&h=500&fit=crop',
          },
          {
            id: '3',
            name: 'Reception',
            photoCount: 65,
            image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=500&h=500&fit=crop',
          },
        ]);
      } catch (error) {
        console.error('[v0] Error fetching collections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <main className="min-h-screen w-full bg-background">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden rounded-2xl md:rounded-3xl mx-4 md:mx-8 mt-4 md:mt-8 mb-16">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=700&fit=crop)',
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6 md:px-12 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-balance leading-tight">
            Capture the Magic of Our Special Day
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-2xl text-balance">
            We're so happy to have you with us. Please share your favorite moments from our celebration to help us remember every beautiful detail forever.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/upload">
              <Button
                size="lg"
                className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-8 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <Heart className="w-5 h-5 mr-2" />
                Share Your Moments
              </Button>
            </Link>
            <Link href="/gallery">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-6 text-base rounded-full backdrop-blur-sm bg-transparent"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                View Gallery
              </Button>
            </Link>
          </div>

          {/* Decorative Element */}
          <div className="absolute top-8 right-8 md:top-12 md:right-12 w-12 h-12 rounded-full bg-pink-600/20 blur-xl" />
        </div>
      </section>

      {/* Live Collections Section */}
      <section className="px-4 md:px-8 lg:px-12 py-16 md:py-24">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Live Collections</h2>
            <p className="text-muted-foreground">Explore our wedding moments organized by event</p>
          </div>
          <Link href="/gallery">
            <button className="text-pink-600 hover:text-pink-700 font-semibold text-sm md:text-base flex items-center gap-1 transition-colors">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link key={collection.id} href="/gallery">
              <div className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer">
                {/* Collection Image */}
                <img
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/80 transition-colors duration-300" />

                {/* Collection Info */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:mb-3 transition-all">
                    {collection.name}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {collection.photoCount} photos shared
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 lg:px-12 py-16 md:py-24 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-2xl md:rounded-3xl mx-4 md:mx-8 mb-8 md:mb-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          {/* Decorative Icon */}
          <div className="flex justify-center">
            <Star className="w-12 h-12 text-pink-600 fill-pink-600" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Join the Celebration
          </h2>

          <p className="text-lg text-muted-foreground text-balance">
            Every photo you share is a gift to us. See all the beautiful moments shared by our loved ones in real-time.
          </p>

          <Link href="/gallery">
            <Button
              size="lg"
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-8 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-all mt-4"
            >
              Enter Full Gallery
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer Info */}
      <section className="px-4 md:px-8 lg:px-12 py-12 text-center border-t border-border">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Madonna &amp; Gilbert
        </h1>
        <p className="text-muted-foreground">Thank you for celebrating with us today!</p>
      </section>
    </main>
  );
}

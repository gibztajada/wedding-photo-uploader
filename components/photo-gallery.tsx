'use client';

import React from "react"

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
  id: string;
  guest_name: string;
  image_url: string;
  storage_path: string;
  created_at: string;
}

const PHOTOS_PER_PAGE = 20;

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/photos?limit=${PHOTOS_PER_PAGE}&offset=0&t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        const data = await response.json();
        console.log('[v0] Initial load, photos count:', data.length);
        setPhotos(data);
        setHasMore(data.length === PHOTOS_PER_PAGE);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load photos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // Load more photos when scrolling
  const loadMorePhotos = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(
        `/api/photos?limit=${PHOTOS_PER_PAGE}&offset=${photos.length}&t=${Date.now()}`,
        {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch more photos');
      }
      const data = await response.json();
      console.log('[v0] Loaded more photos, count:', data.length);
      setPhotos((prev) => [...prev, ...data]);
      setHasMore(data.length === PHOTOS_PER_PAGE);
    } catch (err) {
      console.error('[v0] Load more error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more photos');
    } finally {
      setIsLoadingMore(false);
    }
  }, [photos.length, isLoadingMore, hasMore]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePhotos();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loadMorePhotos, hasMore, isLoadingMore]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;

      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        setSelectedPhotoIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, photos.length]);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    console.log('[v0] Touch start:', e.targetTouches[0].clientX);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    console.log('[v0] Touch end:', endX, 'Start:', touchStart);
    setTouchEnd(endX);
    
    if (touchStart !== null) {
      const distance = touchStart - endX;
      console.log('[v0] Swipe distance:', distance);
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isLeftSwipe) {
        console.log('[v0] Left swipe detected - going to next');
        goToNext();
      } else if (isRightSwipe) {
        console.log('[v0] Right swipe detected - going to previous');
        goToPrevious();
      }
    }
  };

  const goToNext = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const handleDelete = async (photoId: string, storagePath: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setDeletingId(photoId);
    try {
      const response = await fetch('/api/photos/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, storagePath }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete photo');
      }

      // Remove photo from local state immediately
      setPhotos((prev) => {
        const updated = prev.filter((p) => p.id !== photoId);
        // Adjust selected index if needed
        if (selectedPhotoIndex !== null && selectedPhotoIndex >= updated.length) {
          setSelectedPhotoIndex(updated.length > 0 ? updated.length - 1 : null);
        }
        return updated;
      });
      
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="w-8 h-8" />
          <p className="text-muted-foreground">Loading photos...</p>
        </div>
      </div>
    );
  }

  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-foreground text-balance">
          Wedding Moments
        </h1>
        <p className="text-lg text-muted-foreground">
          All the memories captured by our guests
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg max-w-2xl mx-auto">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Photo Gallery */}
      {photos.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-lg text-muted-foreground">
            No photos have been shared yet. Be the first!
          </p>
          <Link href="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Upload a Photo
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative group cursor-pointer bg-muted rounded-lg overflow-hidden aspect-square"
                onClick={() => setSelectedPhotoIndex(index)}
              >
                <img
                  src={photo.image_url || "/placeholder.svg"}
                  alt={`Photo by ${photo.guest_name}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo.id, photo.storage_path);
                  }}
                  disabled={deletingId === photo.id}
                  className="absolute top-1 right-1 bg-destructive/80 hover:bg-destructive p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-50"
                  title="Delete photo"
                >
                  {deletingId === photo.id ? (
                    <Spinner className="w-3 h-3 text-destructive-foreground" />
                  ) : (
                    <Trash2 className="w-3 h-3 text-destructive-foreground" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Link href="/upload">
              <Button
                variant="outline"
                className="border-border hover:bg-accent bg-transparent"
              >
                Upload More Photos
              </Button>
            </Link>
          </div>

          {/* Infinite scroll loader */}
          {hasMore && (
            <div ref={loaderRef} className="flex justify-center py-8">
              {isLoadingMore && (
                <div className="flex items-center gap-2">
                  <Spinner className="w-5 h-5" />
                  <p className="text-muted-foreground">Loading more photos...</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Fullscreen Image Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
            title="Close (Esc)"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Previous Button */}
          {selectedPhotoIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              title="Previous (←)"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Next Button */}
          {selectedPhotoIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              title="Next (→)"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          <div className="w-full h-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center">
            <img
              src={selectedPhoto.image_url || "/placeholder.svg"}
              alt={`Photo by ${selectedPhoto.guest_name}`}
              className="w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="text-white text-center mt-4 space-y-1">
              <p className="text-lg font-semibold">{selectedPhoto.guest_name}</p>
              <p className="text-sm text-white/70">
                {new Date(selectedPhoto.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-xs text-white/50">
                {selectedPhotoIndex !== null && `${selectedPhotoIndex + 1} of ${photos.length}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

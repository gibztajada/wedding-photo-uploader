'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { RomanticLayout } from '@/components/romantic-layout';
import { Trash2, X, ChevronLeft, ChevronRight, Camera, Heart, ImageOff } from 'lucide-react';

interface Photo {
  id: string;
  guest_name: string;
  image_url: string;
  storage_path: string;
  created_at: string;
}

const PHOTOS_PER_PAGE = 20;

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

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
        if (!response.ok) throw new Error('Failed to fetch photos');
        const data = await response.json();
        setPhotos(data);
        setHasMore(data.length === PHOTOS_PER_PAGE);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load photos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
      if (!response.ok) throw new Error('Failed to fetch more photos');
      const data = await response.json();
      setPhotos((prev) => [...prev, ...data]);
      setHasMore(data.length === PHOTOS_PER_PAGE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more photos');
    } finally {
      setIsLoadingMore(false);
    }
  }, [photos.length, isLoadingMore, hasMore]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;

      if (e.key === 'ArrowLeft') goToPrevious();
      else if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'Escape') setSelectedPhotoIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, photos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    if (touchStart !== null) {
      const distance = touchStart - endX;
      if (distance > 50) goToNext();
      else if (distance < -50) goToPrevious();
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
    if (!confirm('Are you sure you want to delete this photo?')) return;

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

      setPhotos((prev) => {
        const updated = prev.filter((p) => p.id !== photoId);
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

  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  if (isLoading) {
    return (
      <RomanticLayout title="Wedding Moments" subtitle="Loading your precious memories..." showBack={true}>
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Heart className="h-8 w-8 animate-pulse text-[#e91e8c]" />
            </div>
            <p
              className="text-sm text-gray-500"
              style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
            >
              Loading photos...
            </p>
          </div>
        </div>
      </RomanticLayout>
    );
  }

  return (
    <RomanticLayout
      title="Wedding Moments"
      subtitle="All the beautiful memories captured by our loved ones"
      showBack={true}
      showHome={true}
      compactFooter={true}
    >
      {/* Error Message */}
      {error && (
        <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Photo Gallery */}
      {photos.length === 0 ? (
        <div
          className={`py-16 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
            <ImageOff className="h-10 w-10 text-pink-300" />
          </div>
          <p
            className="mb-6 text-lg text-gray-500"
            style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
          >
            No photos have been shared yet. Be the first!
          </p>
          <Link
            href="/upload"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#e91e8c] to-[#d42a78] px-6 py-3 text-sm font-medium text-white shadow-[0_4px_20px_rgba(233,30,140,0.3)] transition-all duration-300 hover:shadow-[0_6px_30px_rgba(233,30,140,0.4)] hover:scale-105"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <Camera className="relative h-4 w-4" />
            <span className="relative">Upload a Photo</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Photo Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className={`group relative cursor-pointer overflow-hidden rounded-xl bg-pink-50 shadow-sm transition-all duration-500 hover:shadow-lg ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: `${Math.min(index * 50, 500)}ms`,
                  aspectRatio: '1',
                }}
                onClick={() => setSelectedPhotoIndex(index)}
              >
                {/* Image */}
                <img
                  src={photo.image_url || '/placeholder.svg'}
                  alt={`Photo by ${photo.guest_name}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Guest name on hover */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
                  <p
                    className="truncate text-sm font-medium text-white"
                    style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
                  >
                    {photo.guest_name}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo.id, photo.storage_path);
                  }}
                  disabled={deletingId === photo.id}
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 opacity-0 shadow-md transition-all duration-200 hover:bg-red-500 hover:text-white group-hover:opacity-100 disabled:opacity-50"
                  title="Delete photo"
                >
                  {deletingId === photo.id ? (
                    <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/upload"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#e91e8c]/30 bg-white/70 px-6 py-3 text-sm font-medium text-[#e91e8c] shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-[#e91e8c]/5 hover:border-[#e91e8c]/50 hover:shadow-md"
            >
              <Camera className="h-4 w-4" />
              Upload More Photos
            </Link>
          </div>

          {/* Infinite scroll loader */}
          {hasMore && (
            <div ref={loaderRef} className="flex justify-center py-8">
              {isLoadingMore && (
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 animate-pulse text-[#e91e8c]" />
                  <p
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
                  >
                    Loading more memories...
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Fullscreen Image Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setSelectedPhotoIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            title="Close (Esc)"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous Button */}
          {selectedPhotoIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              title="Previous (←)"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next Button */}
          {selectedPhotoIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              title="Next (→)"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col items-center justify-center">
            <img
              src={selectedPhoto.image_url || '/placeholder.svg'}
              alt={`Photo by ${selectedPhoto.guest_name}`}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-center text-white">
              <p
                className="text-lg font-medium"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {selectedPhoto.guest_name}
              </p>
              <p
                className="mt-1 text-sm text-white/60"
                style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
              >
                {new Date(selectedPhoto.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-white/40">
                <Heart className="h-3 w-3" />
                <span>{selectedPhotoIndex !== null && `${selectedPhotoIndex + 1} of ${photos.length}`}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </RomanticLayout>
  );
}

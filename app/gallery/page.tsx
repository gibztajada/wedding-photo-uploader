'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { TransitionLink } from '@/components/page-transition';
import { NewspaperLayout, NewspaperButton } from '@/components/newspaper-layout';
import { Trash2, X, ChevronLeft, ChevronRight, Camera, ImageOff } from 'lucide-react';

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
    if (!confirm('Are you sure you want to remove this photograph from the collection?')) return;

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
      <NewspaperLayout
        title="PHOTO GALLERY"
        subtitle="Loading the collection..."
        pageNumber={3}
        showBack={true}
        showHome={true}
      >
        <div className="flex h-48 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <svg
              className="h-6 w-6 animate-spin text-[#2c2c2c]/60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
            <p
              className="text-xs text-[#2c2c2c]/60"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Loading photographs...
            </p>
          </div>
        </div>
      </NewspaperLayout>
    );
  }

  return (
    <NewspaperLayout
      title="PHOTO GALLERY"
      subtitle="A collection of moments captured by our beloved guests"
      pageNumber={3}
      showBack={true}
      showHome={true}
    >
      {/* Error Message */}
      {error && (
        <div className="mb-4 border border-[#2c2c2c]/30 bg-[#f5f0e6] p-3">
          <p
            className="text-xs text-[#8b0000]"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {error}
          </p>
        </div>
      )}

      {/* Photo Gallery */}
      {photos.length === 0 ? (
        <div
          className={`py-8 text-center transition-all duration-700 sm:py-12 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-[#2c2c2c]/20 bg-[#f5f0e6]">
            <ImageOff className="h-8 w-8 text-[#2c2c2c]/30" />
          </div>
          <p
            className="mb-4 text-sm text-[#2c2c2c]/60"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            No photographs have been submitted yet.
          </p>
          <p
            className="mb-6 text-xs italic text-[#2c2c2c]/50"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Be the first to contribute to our wedding collection!
          </p>
          <TransitionLink href="/upload">
            <NewspaperButton>
              <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Submit a Photograph
            </NewspaperButton>
          </TransitionLink>
        </div>
      ) : (
        <>
          {/* Gallery Header */}
          <div className="mb-3 flex items-center justify-between border-b border-[#2c2c2c]/20 pb-2 sm:mb-4">
            <span
              className="text-[10px] uppercase tracking-wider text-[#2c2c2c]/60 sm:text-xs"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {photos.length} Photograph{photos.length !== 1 ? 's' : ''} in Collection
            </span>
            <span
              className="text-[10px] text-[#2c2c2c]/40 sm:text-xs"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Click to enlarge
            </span>
          </div>

          {/* Photo Grid - Newspaper style */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className={`group relative cursor-pointer overflow-hidden border border-[#2c2c2c]/30 bg-[#2c2c2c] transition-all duration-500 hover:shadow-lg ${
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
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{
                    filter: 'grayscale(20%) contrast(1.05)',
                  }}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2c2c2c]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Guest name on hover */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full p-2 transition-transform duration-300 group-hover:translate-y-0">
                  <p
                    className="truncate text-[10px] font-medium text-[#f8f4ec] sm:text-xs"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    By {photo.guest_name}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo.id, photo.storage_path);
                  }}
                  disabled={deletingId === photo.id}
                  className="absolute right-1 top-1 bg-[#f8f4ec] p-1 opacity-0 shadow-sm transition-all duration-200 hover:bg-[#8b0000] hover:text-[#f8f4ec] group-hover:opacity-100 disabled:opacity-50"
                  title="Remove photograph"
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

                {/* Photo number badge */}
                <div
                  className="absolute bottom-1 left-1 bg-[#f8f4ec]/90 px-1 py-0.5 text-[7px] font-bold text-[#2c2c2c] opacity-0 transition-opacity group-hover:opacity-100 sm:text-[8px]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  No. {index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center sm:mt-8">
            <TransitionLink href="/upload">
              <NewspaperButton variant="secondary">
                <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Submit More Photographs
              </NewspaperButton>
            </TransitionLink>
          </div>

          {/* Infinite scroll loader */}
          {hasMore && (
            <div ref={loaderRef} className="flex justify-center py-6">
              {isLoadingMore && (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-[#2c2c2c]/60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  </svg>
                  <p
                    className="text-xs text-[#2c2c2c]/60"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Loading more photographs...
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Fullscreen Image Modal - Newspaper Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c2c2c]/95 p-4"
          onClick={() => setSelectedPhotoIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute right-3 top-3 border border-[#f8f4ec]/30 bg-[#f8f4ec]/10 p-2 text-[#f8f4ec] transition-colors hover:bg-[#f8f4ec]/20 sm:right-4 sm:top-4"
            title="Close (Esc)"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Previous Button */}
          {selectedPhotoIndex !== null && selectedPhotoIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 border border-[#f8f4ec]/30 bg-[#f8f4ec]/10 p-2 text-[#f8f4ec] transition-colors hover:bg-[#f8f4ec]/20 sm:left-4"
              title="Previous (←)"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Next Button */}
          {selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 border border-[#f8f4ec]/30 bg-[#f8f4ec]/10 p-2 text-[#f8f4ec] transition-colors hover:bg-[#f8f4ec]/20 sm:right-4"
              title="Next (→)"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Image with newspaper frame */}
          <div
            className="flex max-h-[85vh] w-full max-w-4xl flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-4 border-[#f8f4ec]/20 bg-[#f8f4ec] p-1 shadow-2xl sm:p-2">
              <img
                src={selectedPhoto.image_url || '/placeholder.svg'}
                alt={`Photo by ${selectedPhoto.guest_name}`}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            {/* Photo caption - newspaper style */}
            <div className="mt-3 w-full max-w-md border-t border-[#f8f4ec]/20 pt-3 text-center sm:mt-4 sm:pt-4">
              <p
                className="text-base font-medium text-[#f8f4ec] sm:text-lg"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                {selectedPhoto.guest_name}
              </p>
              <p
                className="mt-1 text-xs text-[#f8f4ec]/50 sm:text-sm"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {new Date(selectedPhoto.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p
                className="mt-2 text-[10px] uppercase tracking-widest text-[#f8f4ec]/30 sm:text-xs"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Photograph {(selectedPhotoIndex ?? 0) + 1} of {photos.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </NewspaperLayout>
  );
}

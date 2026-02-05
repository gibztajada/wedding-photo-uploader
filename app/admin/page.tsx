'use client';

import { useEffect, useState } from 'react';
import { NewspaperLayout, NewspaperCard, NewspaperButton } from '@/components/newspaper-layout';
import { Upload, ImagePlus, Check, Clock } from 'lucide-react';

interface CouplePhoto {
  id: string;
  image_url: string;
  created_at: string;
}

export default function AdminPage() {
  const [couplePhoto, setCouplePhoto] = useState<CouplePhoto | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchCouplePhoto();
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const fetchCouplePhoto = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/couple-photo');
      if (!response.ok) throw new Error('Failed to fetch couple photo');
      const data = await response.json();
      setCouplePhoto(data);
      if (data.image_url) {
        setPreview(data.image_url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load couple photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setError('');

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedImage) {
      setError('Please select an image to upload');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/couple-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setCouplePhoto(data);
      setSelectedImage(null);
      setSuccess('Front page photograph updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <NewspaperLayout
      title="EDITORIAL OFFICE"
      subtitle="Manage the front page couple photograph"
      pageNumber={4}
      showBack={true}
      showHome={true}
    >
      <NewspaperCard>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
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
          </div>
        ) : (
          <div className="space-y-5">
            {/* Section Header */}
            <div className="border-b border-[#2c2c2c]/20 pb-2">
              <h2
                className="text-xs font-bold uppercase tracking-wider text-[#2c2c2c] sm:text-sm"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Front Page Photograph
              </h2>
              <p
                className="mt-1 text-[10px] text-[#2c2c2c]/60 sm:text-xs"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                This photograph appears on the front page of The Wedding Times
              </p>
            </div>

            {/* Current Photo Preview */}
            <div className="space-y-2">
              <label
                className="block text-[10px] font-medium uppercase tracking-wider text-[#2c2c2c]/80 sm:text-xs"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Current Photograph
              </label>
              {preview ? (
                <div
                  className={`relative overflow-hidden border-2 border-[#2c2c2c] bg-[#2c2c2c] p-1 transition-all duration-500 ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                >
                  <div className="aspect-[4/5] w-full sm:aspect-video">
                    <img
                      src={preview || '/placeholder.svg'}
                      alt="Couple photo"
                      className="h-full w-full object-cover"
                      style={{
                        filter: 'grayscale(100%) contrast(1.1) brightness(1.05)',
                      }}
                    />
                  </div>

                  {/* Corner decorations */}
                  <div className="absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-[#f8f4ec]/50" />
                  <div className="absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-[#f8f4ec]/50" />
                  <div className="absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-[#f8f4ec]/50" />
                  <div className="absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-[#f8f4ec]/50" />
                </div>
              ) : (
                <div
                  className={`flex aspect-video w-full flex-col items-center justify-center border-2 border-dashed border-[#2c2c2c]/30 bg-[#f5f0e6] transition-all duration-500 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="mb-2 border border-[#2c2c2c]/20 p-3">
                    <ImagePlus className="h-8 w-8 text-[#2c2c2c]/30" />
                  </div>
                  <p
                    className="text-xs text-[#2c2c2c]/50"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    No photograph set
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Input */}
              <div className="space-y-2">
                <label
                  className="block text-[10px] font-medium uppercase tracking-wider text-[#2c2c2c]/80 sm:text-xs"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Select New Photograph
                </label>
                <label
                  className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[#2c2c2c]/30 bg-[#faf6ee] p-4 transition-all duration-300 hover:border-[#2c2c2c]/60 hover:bg-[#f5f0e6] ${
                    isUploading ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <div className="mb-2 border border-[#2c2c2c]/20 p-2">
                    <ImagePlus className="h-5 w-5 text-[#2c2c2c]/60" />
                  </div>
                  <p
                    className="text-xs font-medium text-[#2c2c2c]/80"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Click to select a photograph
                  </p>
                  <p
                    className="mt-1 text-[9px] text-[#2c2c2c]/50"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    JPG, PNG or GIF (max 10MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="border border-[#2c2c2c]/30 bg-[#f5f0e6] p-3">
                  <p
                    className="text-xs text-[#8b0000]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {error}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 border border-[#2c2c2c]/30 bg-[#f5f0e6] p-3">
                  <Check className="h-4 w-4 text-[#2c6b2f]" />
                  <p
                    className="text-xs text-[#2c6b2f]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {success}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <NewspaperButton
                type="submit"
                disabled={isUploading || !selectedImage}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <svg
                      className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Update Front Page Photo
                  </>
                )}
              </NewspaperButton>
            </form>

            {/* Photo Info */}
            {couplePhoto && (
              <div className="flex items-center justify-center gap-2 border-t border-[#2c2c2c]/20 pt-3">
                <Clock className="h-3 w-3 text-[#2c2c2c]/40" />
                <p
                  className="text-[10px] text-[#2c2c2c]/50 sm:text-xs"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Last updated: {new Date(couplePhoto.created_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </NewspaperCard>
    </NewspaperLayout>
  );
}

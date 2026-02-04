'use client';

import { useEffect, useState } from 'react';
import { RomanticLayout, RomanticCard } from '@/components/romantic-layout';
import { Heart, Upload, ImagePlus, Check, Clock } from 'lucide-react';

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
      setSuccess('Couple photo updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <RomanticLayout
      title="Manage Couple Photo"
      subtitle="Set the beautiful main photo that welcomes your guests"
      showBack={true}
    >
      <div className="mx-auto max-w-2xl">
        <RomanticCard>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Heart className="h-8 w-8 animate-pulse text-[#e91e8c]" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Photo Preview */}
              <div className="space-y-3">
                <label
                  className="block text-sm font-medium text-gray-700"
                  style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
                >
                  Current Photo
                </label>
                {preview ? (
                  <div
                    className={`relative overflow-hidden rounded-2xl border-2 border-pink-100 shadow-sm transition-all duration-500 ${
                      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                  >
                    {/* Decorative corner hearts */}
                    <div className="absolute left-3 top-3 z-10">
                      <Heart className="h-4 w-4 fill-white/80 text-white/80 drop-shadow-md" />
                    </div>
                    <div className="absolute right-3 top-3 z-10">
                      <Heart className="h-4 w-4 fill-white/80 text-white/80 drop-shadow-md" />
                    </div>

                    <div className="aspect-video w-full">
                      <img
                        src={preview || '/placeholder.svg'}
                        alt="Couple photo"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Gradient overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                ) : (
                  <div
                    className={`flex aspect-video w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pink-200 bg-gradient-to-b from-pink-50/50 to-white transition-all duration-500 ${
                      isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="mb-3 rounded-full bg-pink-100 p-4">
                      <Heart className="h-8 w-8 text-pink-300" />
                    </div>
                    <p
                      className="text-sm text-gray-400"
                      style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
                    >
                      No photo set yet
                    </p>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Input */}
                <div className="space-y-3">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
                  >
                    Select New Photo
                  </label>
                  <label
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pink-200 bg-gradient-to-b from-pink-50/30 to-white p-6 transition-all duration-300 hover:border-[#e91e8c]/50 hover:bg-pink-50/50 ${
                      isUploading ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    <div className="mb-2 rounded-full bg-pink-100 p-2">
                      <ImagePlus className="h-5 w-5 text-[#e91e8c]" />
                    </div>
                    <p
                      className="text-sm font-medium text-gray-600"
                      style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
                    >
                      Click to select a photo
                    </p>
                    <p className="mt-1 text-xs text-gray-400">JPG, PNG or GIF (max 10MB)</p>
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
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4">
                    <Check className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUploading || !selectedImage}
                  className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-[#e91e8c] to-[#d42a78] px-6 py-3.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(233,30,140,0.3)] transition-all duration-300 hover:shadow-[0_6px_30px_rgba(233,30,140,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isUploading ? (
                      <>
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Update Couple Photo
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Photo Info */}
              {couplePhoto && (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-pink-100 bg-pink-50/50 p-3">
                  <Clock className="h-4 w-4 text-pink-400" />
                  <p
                    className="text-xs text-gray-500"
                    style={{ fontFamily: "var(--font-crimson), Georgia, serif" }}
                  >
                    Last updated: {new Date(couplePhoto.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </RomanticCard>
      </div>
    </RomanticLayout>
  );
}

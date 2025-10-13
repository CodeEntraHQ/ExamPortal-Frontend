import React, { useState, useEffect } from 'react';
import { authenticatedFetch, getApiUrl } from '../services/api';
import { Avatar, AvatarFallback } from './ui/avatar';

interface ImageWithFallbackProps {
  src: string | null;
  fallback: React.ReactNode;
  alt: string;
  className?: string;
}

export function ImageWithFallback({ src, fallback, alt, className }: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    if (src.startsWith('blob:')) {
      setImgSrc(src);
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        const response = await authenticatedFetch(src);
        const data = await response.json();
        const buffer = new Uint8Array(data.payload.media.data);
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        const dataUrl = URL.createObjectURL(blob);
        setImgSrc(dataUrl);
      } catch (error) {
        console.error('Failed to fetch image:', error);
        setImgSrc(null);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [src]);

  if (loading) {
    return <Avatar className={className}><AvatarFallback>{fallback}</AvatarFallback></Avatar>;
  }

  if (imgSrc) {
    return <img src={imgSrc} alt={alt} className={className} />;
  }

  return <Avatar className={className}><AvatarFallback>{fallback}</AvatarFallback></Avatar>;
}

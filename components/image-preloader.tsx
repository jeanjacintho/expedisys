"use client";

import { useEffect, useRef } from 'react';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

export function ImagePreloader({ images, priority = false }: ImagePreloaderProps) {
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!images || images.length === 0) return;

    const preloadImages = async () => {
      const promises = images
        .filter(src => src && !preloadedRef.current.has(src))
        .map(src => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            
            img.onload = () => {
              preloadedRef.current.add(src);
              resolve();
            };
            
            img.onerror = () => {
              // Silently handle errors for preloading
              resolve();
            };
            
            img.src = src;
          });
        });

      if (priority) {
        // Carregar imediatamente se for prioritário
        await Promise.all(promises);
      } else {
        // Carregar em background se não for prioritário
        Promise.all(promises).catch(() => {
          // Silently handle errors
        });
      }
    };

    preloadImages();
  }, [images, priority]);

  // Componente invisível
  return null;
}

// Hook para pré-carregar imagens específicas
export function useImagePreloader(images: string[], priority = false) {
  useEffect(() => {
    if (!images || images.length === 0) return;

    const preloaded = new Set<string>();
    
    const preloadImages = async () => {
      const promises = images
        .filter(src => src && !preloaded.has(src))
        .map(src => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            
            img.onload = () => {
              preloaded.add(src);
              resolve();
            };
            
            img.onerror = () => {
              resolve();
            };
            
            img.src = src;
          });
        });

      if (priority) {
        await Promise.all(promises);
      } else {
        Promise.all(promises).catch(() => {
          // Silently handle errors
        });
      }
    };

    preloadImages();
  }, [images, priority]);
} 
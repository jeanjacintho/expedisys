import { useState, useEffect, useMemo } from 'react';

// Cache global para imagens
const imageCache = new Map<string, { loaded: boolean; error: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface UseOptimizedImageOptions {
  src?: string;
  fallback?: string;
  preload?: boolean;
  cacheKey?: string;
}

interface UseOptimizedImageReturn {
  isLoaded: boolean;
  hasError: boolean;
  isLoading: boolean;
  imageSrc: string | undefined;
}

export function useOptimizedImage({
  src,
  fallback,
  preload = true,
  cacheKey
}: UseOptimizedImageOptions): UseOptimizedImageReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cacheKeyToUse = cacheKey || src;

  // Verificar cache
  const cachedResult = useMemo(() => {
    if (!cacheKeyToUse || !imageCache.has(cacheKeyToUse)) {
      return null;
    }

    const cached = imageCache.get(cacheKeyToUse)!;
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;

    if (isExpired) {
      imageCache.delete(cacheKeyToUse);
      return null;
    }

    return cached;
  }, [cacheKeyToUse]);

  // Limpar cache antigo periodicamente
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      for (const [key, value] of imageCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          imageCache.delete(key);
        }
      }
    };

    const interval = setInterval(cleanup, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    // Se já está no cache
    if (cachedResult) {
      setIsLoaded(cachedResult.loaded);
      setHasError(cachedResult.error);
      setIsLoading(false);
      return;
    }

    // Pré-carregar imagem
    if (preload) {
      const img = new Image();
      
      img.onload = () => {
        imageCache.set(cacheKeyToUse!, {
          loaded: true,
          error: false,
          timestamp: Date.now()
        });
        setIsLoaded(true);
        setHasError(false);
        setIsLoading(false);
      };

      img.onerror = () => {
        imageCache.set(cacheKeyToUse!, {
          loaded: false,
          error: true,
          timestamp: Date.now()
        });
        setIsLoaded(false);
        setHasError(true);
        setIsLoading(false);
      };

      img.src = src;
    } else {
      setIsLoading(false);
    }
  }, [src, preload, cacheKeyToUse, cachedResult]);

  const imageSrc = useMemo(() => {
    if (hasError && fallback) {
      return fallback;
    }
    return src;
  }, [src, fallback, hasError]);

  return {
    isLoaded,
    hasError,
    isLoading,
    imageSrc
  };
}

// Hook específico para avatars
export function useAvatarImage(avatarSrc?: string, pessoaId?: number) {
  return useOptimizedImage({
    src: avatarSrc,
    cacheKey: `avatar-${pessoaId}-${avatarSrc}`,
    preload: true
  });
} 
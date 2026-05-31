'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Portal } from '@/shared/ui/common/Portal';
import OptimizedImage from '@/shared/ui/common/OptimizedImage';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0) setCurrentIndex(images.length - 1);
      else if (index >= images.length) setCurrentIndex(0);
      else setCurrentIndex(index);
    },
    [images.length],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
      if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, currentIndex, goTo]);

  const hasMultiple = images.length > 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={onClose}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-90"
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>

            {hasMultiple && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(currentIndex - 1);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-90"
                  aria-label="Anterior"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(currentIndex + 1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-90"
                  aria-label="Siguiente"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <OptimizedImage
                src={images[currentIndex]}
                alt={`Foto ${currentIndex + 1}`}
                fill
                className="object-contain p-4"
                priority
              />
            </motion.div>

            {hasMultiple && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-3">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? 'bg-white w-8'
                        : 'bg-white/30 w-2 hover:bg-white/60'
                    }`}
                    aria-label={`Imagen ${i + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="absolute top-6 left-6 z-50 text-white/60 text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;

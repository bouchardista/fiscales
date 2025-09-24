import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface ImageCarouselProps {
  images: string[];
  autoPlayInterval?: number;
  className?: string;
  imagePositions?: { [key: number]: string };
  mobileImagePositions?: { [key: number]: { top?: string; left?: string } };
}

const ImageCarousel = ({ 
  images, 
  autoPlayInterval = 3000, 
  className = '',
  imagePositions = {},
  mobileImagePositions = {}
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

  // Auto-play functionality
  useEffect(() => {
    if (isHovered) return; // Pause on hover

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval, isHovered]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Images Container */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
              style={{
                position: 'absolute',
                top: isMobile && mobileImagePositions[index]?.top 
                  ? mobileImagePositions[index].top 
                  : imagePositions[index] || '50%',
                left: isMobile && mobileImagePositions[index]?.left 
                  ? mobileImagePositions[index].left 
                  : '50%',
                transform: 'translate(-50%, -50%) scale(1.4)',
                width: '177.77777778vh',
                height: '56.25vw',
                minWidth: '100%',
                minHeight: '100%',
                maxWidth: 'none',
                maxHeight: 'none',
              }}
            />
            {/* Difuminado violáceo a los costados */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-0 top-0 w-80 h-full bg-gradient-to-r from-[#832B99]/60 to-transparent blur-md"></div>
              <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-[#832B99]/60 to-transparent blur-md"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      <button
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-xl border border-white/40 text-white hover:bg-white/30 transition-all duration-300 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full touch-manipulation flex items-center justify-center hidden md:flex"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goToPrevious();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goToPrevious();
        }}
        style={{ touchAction: 'manipulation' }}
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <button
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-xl border border-white/40 text-white hover:bg-white/30 transition-all duration-300 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full touch-manipulation flex items-center justify-center hidden md:flex"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goToNext();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goToNext();
        }}
        style={{ touchAction: 'manipulation' }}
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-4 h-4 md:w-3 md:h-3 rounded-full transition-all duration-300 touch-manipulation ${
              index === currentIndex
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToSlide(index);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToSlide(index);
            }}
            style={{ touchAction: 'manipulation' }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20 z-20">
        <div 
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{
            width: isHovered ? '100%' : '0%',
            animation: isHovered ? 'none' : `progress ${autoPlayInterval}ms linear infinite`
          }}
        />
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ImageCarousel;

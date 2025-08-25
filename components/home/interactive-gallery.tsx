'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  title: string;
  category: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg",
    alt: "Luxury Hotel Pool",
    title: "Infinity Pool",
    category: "Amenities"
  },
  {
    id: 2,
    src: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg",
    alt: "Fine Dining Restaurant",
    title: "Gourmet Dining",
    category: "Dining"
  },
  {
    id: 3,
    src: "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg",
    alt: "Luxury Spa Treatment",
    title: "Wellness Spa",
    category: "Spa"
  },
  {
    id: 4,
    src: "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg",
    alt: "Luxury Hotel Room",
    title: "Deluxe Suite",
    category: "Rooms"
  },
  {
    id: 5,
    src: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg",
    alt: "Conference Room",
    title: "Business Center",
    category: "Business"
  },
  {
    id: 6,
    src: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg",
    alt: "Hotel Gym",
    title: "Fitness Center",
    category: "Fitness"
  },
  {
    id: 7,
    src: "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg",
    alt: "Hotel Lobby",
    title: "Grand Lobby",
    category: "Lobby"
  },
  {
    id: 8,
    src: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg",
    alt: "Hotel Bar",
    title: "Lounge Bar",
    category: "Entertainment"
  },
  {
    id: 9,
    src: "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg",
    alt: "Hotel Garden",
    title: "Garden Terrace",
    category: "Outdoor"
  }
];

export default function InteractiveGallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scrollPositionRef = useRef<number>(0);

  // Smooth auto-scroll using requestAnimationFrame
  const smoothAutoScroll = () => {
    if (!scrollContainerRef.current || !isAutoScrolling || isHovered) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const container = scrollContainerRef.current;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    // Increment scroll position
    scrollPositionRef.current += 0.5; // Adjust speed here (0.5px per frame)

    // Reset when reaching the end
    if (scrollPositionRef.current >= maxScroll) {
      scrollPositionRef.current = 0;
    }

    // Apply the scroll
    container.scrollLeft = scrollPositionRef.current;

    // Continue the animation
    animationFrameRef.current = requestAnimationFrame(smoothAutoScroll);
  };

  const startAutoScroll = () => {
    if (!animationFrameRef.current && isAutoScrolling && !isHovered) {
      animationFrameRef.current = requestAnimationFrame(smoothAutoScroll);
    }
  };

  const stopAutoScroll = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const toggleAutoScroll = () => {
    setIsAutoScrolling(prev => !prev);
  };

  // Handle mouse enter/leave for pause on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    stopAutoScroll();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Sync scroll position when user manually scrolls
  const handleScroll = () => {
    if (scrollContainerRef.current && !isAutoScrolling) {
      scrollPositionRef.current = scrollContainerRef.current.scrollLeft;
    }
  };

  // Initialize auto-scroll
  useEffect(() => {
    if (isAutoScrolling && !isHovered) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
  }, [isAutoScrolling, isHovered]);



  // Cleanup on unmount
  useEffect(() => {
    return () => stopAutoScroll();
  }, []);

  const openModal = (image: GalleryImage) => {
    setSelectedImage(image);
    setZoomLevel(1);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    setZoomLevel(1);
  };

  const nextImage = () => {
    if (!selectedImage) return;
    const currentIndex = galleryImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % galleryImages.length;
    setSelectedImage(galleryImages[nextIndex]);
    setZoomLevel(1);
  };

  const prevImage = () => {
    if (!selectedImage) return;
    const currentIndex = galleryImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    setSelectedImage(galleryImages[prevIndex]);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isModalOpen) return;
    
    switch (e.key) {
      case 'Escape':
        closeModal();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case '+':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case '0':
        resetZoom();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedImage]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 lg:p-12">
          
          {/* Header */}
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Experience Our{" "}
              <span className="text-amber-600">
                Luxury
              </span>{" "}
              Facilities
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Take a virtual tour of our world-class facilities and discover the perfect setting for your stay
            </p>
          </div>



        {/* Gallery Grid */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onScroll={handleScroll}
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
                     {/* Duplicate images for seamless loop */}
           {[...galleryImages, ...galleryImages].map((image, index) => (
             <div
               key={`${image.id}-${index}`}
               className="flex-shrink-0 w-80 h-64 group cursor-pointer"
               onClick={() => openModal(image)}
               style={{
                 animation: 'fadeInOut 0.8s ease-in-out',
                 opacity: 0,
                 animationFillMode: 'forwards',
                 animationDelay: `${index * 0.1}s`
               }}
             >
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold text-lg">{image.title}</h3>
                    <p className="text-sm text-blue-200">{image.category}</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>



        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative w-[90vw] h-[80vh] max-w-4xl">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 z-50 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-50 bg-white/20 hover:bg-white/30 text-white rounded-full p-4 transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-50 bg-white/20 hover:bg-white/30 text-white rounded-full p-4 transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Zoom Controls */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <button
                  onClick={handleZoomOut}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-all duration-300"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={resetZoom}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-all duration-300"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={handleZoomIn}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-all duration-300"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>

              {/* Image */}
              {selectedImage && (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    className="max-w-full max-h-full object-contain transition-transform duration-300"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                  
                  {/* Image Info */}
                  <div className="absolute bottom-6 left-6 text-white bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <h3 className="font-semibold text-lg">{selectedImage.title}</h3>
                    <p className="text-sm text-blue-200">{selectedImage.category}</p>
                    <p className="text-xs text-gray-300 mt-1">Zoom: {Math.round(zoomLevel * 100)}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes fadeInOut {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            50% {
              opacity: 0.8;
              transform: translateY(10px) scale(0.98);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
                 `}</style>
         </div>
       </div>
     </section>
   );
 }

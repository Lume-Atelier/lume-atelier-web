"use client";
import Image from "next/image";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: Array<{
    id: string;
    url: string;
    alt: string;
  }>;
  selectedIndex: number;
  onSelectImage: (index: number) => void;
}

export function ImageCarousel({
  images,
  selectedIndex,
  onSelectImage,
}: ImageCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 200; // pixels
    const newScrollLeft =
      direction === "left"
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Não renderizar carrossel se houver apenas 1 imagem
  if (images.length <= 1) return null;

  return (
    <div className="relative group">
      {/* Seta Esquerda */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 backdrop-blur-md bg-black/30 hover:bg-black/60 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5" style={{ color: "#ceab67" }} />
        </button>
      )}

      {/* Container de Scroll */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => onSelectImage(index)}
            className={`relative flex-shrink-0 w-32 aspect-[16/9] rounded-lg overflow-hidden border-2 transition-all snap-start ${
              selectedIndex === index
                ? "border-primary"
                : "border-foreground/20 hover:border-foreground/40"
            }`}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="128px"
            />
          </button>
        ))}
      </div>

      {/* Seta Direita */}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 backdrop-blur-md bg-black/30 hover:bg-black/60 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Próximo"
        >
          <ChevronRight className="h-5 w-5" style={{ color: "#ceab67" }} />
        </button>
      )}

      {/* CSS para esconder scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

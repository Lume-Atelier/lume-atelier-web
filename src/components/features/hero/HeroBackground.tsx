"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HERO_CONFIG } from "@/config/hero.config";

/**
 * HeroBackground - Componente de background rotativo para a hero section
 *
 * Funcionalidades:
 * - Detecta automaticamente todas as imagens na pasta /public/hero-backgrounds
 * - Rotaciona as imagens automaticamente baseado em HERO_CONFIG.ROTATION_INTERVAL
 * - Suporta 1 a N imagens (sem limite)
 * - Transições suaves com fade
 * - Overlay escuro configurável para manter legibilidade do conteúdo
 */

interface HeroBackgroundProps {
  images: string[];
}

export function HeroBackground({ images }: HeroBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Se não há imagens ou só tem uma, não precisa rotacionar
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);

      // Após a transição de fade out, muda a imagem
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, HERO_CONFIG.TRANSITION_DURATION * 500); // Metade do tempo para fade out
    }, HERO_CONFIG.ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [images.length]);

  // Se não há imagens, retorna apenas o overlay
  if (images.length === 0) {
    return (
      <div className="absolute inset-0 bg-background">
        <div
          className="absolute inset-0 bg-black/60"
          style={{ opacity: HERO_CONFIG.OVERLAY_OPACITY }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background Image */}
      <div
        className={`absolute inset-0 transition-opacity duration-${HERO_CONFIG.TRANSITION_DURATION * 1000}`}
        style={{
          opacity: isTransitioning ? 0 : 1,
          transitionDuration: `${HERO_CONFIG.TRANSITION_DURATION}s`,
        }}
      >
        <Image
          src={images[currentIndex]}
          alt="Hero Background"
          fill
          priority
          quality={95}
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Dark Overlay para garantir legibilidade do conteúdo */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"
        style={{ opacity: HERO_CONFIG.OVERLAY_OPACITY }}
      />
    </div>
  );
}

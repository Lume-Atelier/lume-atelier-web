import { getHeroBackgrounds } from "@/lib/hero-backgrounds";
import { HomePageClient } from "./HomePageClient";

/**
 * Homepage - Server Component
 *
 * Carrega as imagens de background do hero server-side e passa para o Client Component
 * Isso evita múltiplas requisições HTTP no cliente
 */

export default async function HomePage() {
  // Carrega backgrounds server-side (sem gerar requisições HTTP no cliente)
  const heroBackgrounds = await getHeroBackgrounds();

  return <HomePageClient heroBackgrounds={heroBackgrounds} />;
}

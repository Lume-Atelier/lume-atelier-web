import { readdir } from 'fs/promises';
import { join } from 'path';
import { HERO_CONFIG } from '@/config/hero.config';

/**
 * Utility server-side para carregar imagens de background da hero section
 *
 * Esta função lê diretamente do filesystem, evitando múltiplas requisições HTTP
 */

export async function getHeroBackgrounds(): Promise<string[]> {
  try {
    const backgroundsDir = join(process.cwd(), 'public', 'hero-backgrounds');

    // Lê todos os arquivos da pasta
    const files = await readdir(backgroundsDir);

    // Filtra apenas arquivos de imagem que seguem o padrão hero-X.ext
    const imageFiles = files
      .filter(file => {
        const match = file.match(/^hero-(\d+)\.(jpg|jpeg|png|webp)$/i);
        return match !== null;
      })
      .sort((a, b) => {
        // Extrai o número do arquivo para ordenar corretamente
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      })
      .map(file => `${HERO_CONFIG.BACKGROUNDS_PATH}/${file}`);

    return imageFiles;
  } catch (error) {
    // Se a pasta não existe ou está vazia, retorna array vazio
    console.log('Hero backgrounds folder is empty or does not exist');
    return [];
  }
}

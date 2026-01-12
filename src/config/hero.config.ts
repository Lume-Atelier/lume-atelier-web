/**
 * Configuração do Hero Background Carousel
 *
 * ROTATION_INTERVAL: Tempo em milissegundos entre cada troca de imagem
 * - 1 hora = 3600000ms
 * - 1 dia = 86400000ms
 * - 5 minutos = 300000ms (útil para testes)
 */

export const HERO_CONFIG = {
  // Intervalo de rotação em milissegundos (padrão: 1 hora)
  ROTATION_INTERVAL: 3600000,

  // Pasta onde as imagens de background estão armazenadas
  BACKGROUNDS_PATH: "/hero-backgrounds",

  // Duração da transição de fade entre imagens (em segundos)
  TRANSITION_DURATION: 1,

  // Opacidade do overlay escuro (0 a 1)
  OVERLAY_OPACITY: 0.7,
} as const;

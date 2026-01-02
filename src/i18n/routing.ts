import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // Lista de locales suportados
  locales: ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE'],

  // Locale padrão
  defaultLocale: 'pt-BR',

  // Estratégia de prefixo de locale nas URLs
  localePrefix: 'as-needed', // pt-BR não terá prefixo, outros sim
});

// Exporta funções de navegação tipadas
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

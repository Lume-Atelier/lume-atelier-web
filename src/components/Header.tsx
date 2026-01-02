'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/Button';

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { items } = useCartStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="border-b border-foreground/20 sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="container !px-12 md:!px-20 lg:!px-32">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Image
                src="/assets/logo-dark.png"
                alt="Lume Atelier"
                width={400}
                height={200}
                className="h-8 w-auto"
              />
            ) : (
              <Image
                src="/assets/logo-light.png"
                alt="Lume Atelier"
                width={400}
                height={200}
                className="h-8 w-auto"
              />
            )}
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className={`hover:text-primary transition ${
                pathname?.includes('/products') ? 'text-primary' : ''
              }`}
            >
              Produtos
            </Link>
            <Link
              href="/categories"
              className={`hover:text-primary transition ${
                pathname?.includes('/categories') ? 'text-primary' : ''
              }`}
            >
              Categorias
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative group hover:text-primary transition-all duration-300 hover:scale-110"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg
                  className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 transition-transform duration-300 group-hover:-rotate-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
              {/* Glow effect on hover */}
              <span className="absolute inset-0 rounded-full bg-primary/20 scale-0 group-hover:scale-150 transition-transform duration-300 -z-10 blur-md" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative group hover:text-primary transition-all duration-300 hover:scale-110"
            >
              <svg
                className="w-6 h-6 transition-transform duration-300 group-hover:-rotate-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-background text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-125 animate-pulse">
                  {items.length}
                </span>
              )}
              {/* Glow effect on hover */}
              <span className="absolute inset-0 rounded-full bg-primary/20 scale-0 group-hover:scale-150 transition-transform duration-300 -z-10 blur-md" />
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

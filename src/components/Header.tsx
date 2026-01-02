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
      <header className="h-16 bg-background border-b border-foreground/20 sticky top-0 backdrop-blur z-50">
        <div className="h-full max-w-[1400px] mx-auto px-6">
          <div className="h-full grid grid-cols-3 items-center">
            {/* Logo - Esquerda */}
            <div className="flex items-center justify-start">
              <Link href="/" className="flex items-center">
                {theme === 'dark' ? (
                    <Image
                        src="/assets/logo-dark.png"
                        alt="Lume Atelier"
                        width={240}
                        height={60}
                        className="h-12 w-auto object-contain"
                        priority
                    />
                ) : (
                    <Image
                        src="/assets/logo-light.png"
                        alt="Lume Atelier"
                        width={240}
                        height={60}
                        className="h-12 w-auto object-contain"
                        priority
                    />
                )}
              </Link>
            </div>

            {/* Menu - Centro */}
            <nav className="hidden md:flex items-center justify-center gap-8">
              <Link
                  href="/products"
                  className={`text-foreground hover:text-primary transition ${
                      pathname?.includes('/products') ? 'text-primary' : ''
                  }`}
              >
                Produtos
              </Link>
              <Link
                  href="/categories"
                  className={`text-foreground hover:text-primary transition ${
                      pathname?.includes('/categories') ? 'text-primary' : ''
                  }`}
              >
                Categorias
              </Link>
            </nav>

            {/* Ações - Direita */}
            <div className="flex items-center justify-end gap-4">
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
              <Link href="/cart" className="relative p-2 hover:text-primary transition">
                <svg
                    className="w-5 h-5"
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
                    <span className="absolute -top-1 -right-1 bg-primary text-background text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {items.length}
                </span>
                )}
              </Link>

              {/* User - Container com largura fixa */}
              <div className="flex items-center gap-2 min-w-[140px] justify-end">
                {!isAuthenticated ? (
                        <Link href="/login">
                          <Button variant="outline" size="sm">
                            Entrar
                          </Button>
                        </Link> 
                ) : (
                    <>
                      <Button
                          onClick={handleLogout}
                          className="px-4 py-2 text-sm border border-[#D4AF37] text-[#D4AF37] rounded hover:bg-[#D4AF37] hover:text-black transition"
                      >
                        Sair
                      </Button>
                      {isAdmin && (
                          <Link href="/admin">
                            <Button className="px-4 py-2 text-sm text-[#D4AF37] hover:opacity-80 transition">
                              Admin
                            </Button>
                          </Link>
                      )}
                    </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
  );
}
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart-store';
import { AuthService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  const handleCheckout = () => {
    const isAuth = AuthService.isAuthenticated();

    if (!isAuth) {
      router.push('/login?redirect=/checkout');
      return;
    }

    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-bold mb-4">Seu carrinho está vazio</h1>
          <p className="text-foreground/60 mb-8">
            Adicione produtos ao carrinho para continuar comprando.
          </p>
          <Button
            onClick={() => router.push('/products')}
            variant="outline"
            size="lg"
          >
            Explorar Produtos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Carrinho de Compras</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 p-4 border border-foreground/20 rounded-lg"
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-24 bg-foreground/5 rounded overflow-hidden flex-shrink-0">
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    📦
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-xl font-bold text-primary">
                  R$ {item.priceInBRL.toFixed(2)}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.productId)}
                className="text-foreground/60 hover:text-red-500 transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}

          <Button
            onClick={() => clearCart()}
            variant="outline"
            size="sm"
            fullWidth
          >
            Limpar Carrinho
          </Button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border border-foreground/20 rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-foreground/60">Subtotal</span>
                <span className="font-medium">R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Itens</span>
                <span className="font-medium">{items.length}</span>
              </div>
            </div>

            <div className="border-t border-foreground/20 pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              variant="outline"
              size="lg"
              fullWidth
              className="mb-3"
            >
              Finalizar Compra
            </Button>

            <Button
              onClick={() => router.push('/products')}
              variant="outline"
              size="lg"
              fullWidth
            >
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

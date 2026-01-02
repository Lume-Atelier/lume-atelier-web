'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/stores';
import { CheckoutService } from '@/lib/api/services';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'PAYPAL' | 'PIX'>('STRIPE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError('');

      const productIds = items.map(item => item.productId);
      const order = await CheckoutService.createOrder(productIds, paymentMethod);

      clearCart();
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Carrinho vazio</h1>
        <p className="text-foreground/70 mb-8">Adicione produtos ao carrinho para continuar</p>
        <Link href="/products">
          <Button variant="outline" size="lg">
            Explorar Produtos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Finalizar Compra</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Itens do Pedido</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="border border-foreground/20 p-4 rounded">
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-primary">R$ {item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-foreground/20 pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span className="text-primary">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Método de Pagamento</h2>

          <div className="space-y-4 mb-8">
            <label className="flex items-center gap-3 p-4 border-2 border-foreground/20 rounded cursor-pointer hover:border-primary transition-colors">
              <input
                type="radio"
                name="payment"
                value="STRIPE"
                checked={paymentMethod === 'STRIPE'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="accent-primary"
              />
              <span>Cartão de Crédito (Stripe)</span>
            </label>

            <label className="flex items-center gap-3 p-4 border-2 border-foreground/20 rounded cursor-pointer hover:border-primary transition-colors">
              <input
                type="radio"
                name="payment"
                value="PAYPAL"
                checked={paymentMethod === 'PAYPAL'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="accent-primary"
              />
              <span>PayPal</span>
            </label>

            <label className="flex items-center gap-3 p-4 border-2 border-foreground/20 rounded cursor-pointer hover:border-primary transition-colors">
              <input
                type="radio"
                name="payment"
                value="PIX"
                checked={paymentMethod === 'PIX'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="accent-primary"
              />
              <span>PIX</span>
            </label>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-500">
              {error}
            </div>
          )}

          <Button
            onClick={handleCheckout}
            disabled={loading}
            loading={loading}
            variant="outline"
            size="xl"
            fullWidth
          >
            Confirmar Pagamento
          </Button>
        </div>
      </div>
    </div>
  );
}

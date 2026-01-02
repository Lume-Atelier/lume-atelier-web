'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckoutService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      CheckoutService.getOrderById(orderId)
        .then(setOrder)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <svg className="w-24 h-24 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold mb-4">Pagamento Confirmado!</h1>
        <p className="text-foreground/70 mb-8">
          Seu pedido foi processado com sucesso. Você já pode acessar seus produtos na biblioteca.
        </p>

        {order && (
          <div className="mb-8 p-6 border border-foreground/20 rounded text-left">
            <h2 className="text-xl font-bold mb-4">Detalhes do Pedido</h2>
            <p><strong>ID:</strong> {order.id}</p>
            <p><strong>Total:</strong> R$ {order.totalAmountBRL.toFixed(2)}</p>
            <p><strong>Status:</strong> {order.status}</p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Link href="/library">
            <Button variant="outline" size="xl">
              Ir para Biblioteca
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="xl">
              Continuar Comprando
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

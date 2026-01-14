'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/stores';
import { usePaymentStatus } from '@/hooks/queries/usePaymentStatus';
import { Button } from '@/components/ui/Button';
import { OrderStatus } from '@/types';

/**
 * Página de sucesso após pagamento no Stripe
 *
 * Fluxo:
 * 1. Recebe order_id da URL (passado pelo Stripe via success_url)
 * 2. Faz polling no backend até status = COMPLETED
 * 3. Quando confirmado, limpa carrinho e mostra sucesso
 *
 * Estados:
 * - Loading: Aguardando confirmação do pagamento
 * - Success: Pagamento confirmado (status = COMPLETED)
 * - Failed: Pagamento falhou (status = FAILED)
 * - Error: Erro ao buscar pedido
 */
export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCartStore();
  const cartClearedRef = useRef(false);

  // Hook com polling automático
  const {
    data: order,
    isLoading,
    isError,
    isConfirmed,
    isFailed,
    isPending,
  } = usePaymentStatus(orderId);

  // Limpa carrinho quando pagamento é confirmado
  // useRef para garantir que só limpa uma vez
  useEffect(() => {
    if (isConfirmed && !cartClearedRef.current) {
      console.log('Payment confirmed, clearing cart');
      clearCart();
      cartClearedRef.current = true;
    }
  }, [isConfirmed, clearCart]);

  // Estado: Sem orderId na URL
  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Pedido Incompleto</h1>
          <p className="text-foreground/70 mb-8">
            Não foi possível identificar o pedido. Por favor, verifique seus pedidos na biblioteca.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/library">
              <Button variant="outline" size="xl">
                Ver Meus Pedidos
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

  // Estado: Erro ao buscar pedido
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Erro ao Carregar Pedido</h1>
          <p className="text-foreground/70 mb-8">
            Não foi possível carregar os detalhes do pedido. Por favor, tente novamente.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/library">
              <Button variant="outline" size="xl">
                Ver Meus Pedidos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Pagamento falhou
  if (isFailed) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Pagamento Falhou</h1>
          <p className="text-foreground/70 mb-8">
            Infelizmente seu pagamento não foi processado. Por favor, tente novamente.
          </p>
          {order && (
            <div className="mb-8 p-6 border border-red-500/30 bg-red-500/10 rounded text-left">
              <p><strong>Pedido:</strong> {order.id}</p>
              <p><strong>Status:</strong> {order.status}</p>
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <Link href="/cart">
              <Button variant="outline" size="xl">
                Voltar ao Carrinho
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Aguardando confirmação (loading ou PENDING)
  if (isLoading || isPending) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Confirmando Pagamento...</h1>
          <p className="text-foreground/70 mb-8">
            Aguarde enquanto processamos seu pagamento. Isso pode levar alguns segundos.
          </p>
          {order && (
            <div className="mb-8 p-6 border border-foreground/20 rounded text-left">
              <p><strong>Pedido:</strong> {order.id}</p>
              <p><strong>Status:</strong> <span className="text-yellow-500">{order.status}</span></p>
              <p className="text-sm text-foreground/50 mt-2">
                Verificando a cada 2 segundos...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Estado: Pagamento confirmado (COMPLETED)
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
          <div className="mb-8 p-6 border border-green-500/30 bg-green-500/10 rounded text-left">
            <h2 className="text-xl font-bold mb-4">Detalhes do Pedido</h2>
            <p><strong>ID:</strong> {order.id}</p>
            <p><strong>Total:</strong> R$ {order.totalAmountBRL.toFixed(2)}</p>
            <p><strong>Status:</strong> <span className="text-green-500">{order.status}</span></p>
            {order.items && order.items.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Itens:</p>
                <ul className="list-disc list-inside text-sm">
                  {order.items.map((item: any) => (
                    <li key={item.id}>{item.productTitle}</li>
                  ))}
                </ul>
              </div>
            )}
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

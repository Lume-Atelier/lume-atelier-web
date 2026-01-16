'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OrderService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';
import { DownloadProgressButton } from '@/components/features/download/DownloadProgressButton';
import type { OrderDTO } from '@/types';

export default function LibraryPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await OrderService.getMyOrders(0, 50);
      const completedOrders = response.content.filter((o) => o.status === 'COMPLETED');
      setOrders(completedOrders);
    } catch (error) {
      console.error('Erro ao carregar biblioteca:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtem o nome do produto para o ZIP
   * Se tiver multiplos produtos, usa o nome do primeiro + quantidade
   */
  const getProductNameForZip = (order: OrderDTO): string => {
    if (order.items.length === 1) {
      return order.items[0].productTitle;
    }
    return `${order.items[0].productTitle}_e_mais_${order.items.length - 1}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Carregando biblioteca...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Biblioteca Vazia</h1>
        <p className="text-foreground/70 mb-8">Você ainda não comprou nenhum produto</p>
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
      <h1 className="text-4xl font-bold mb-8">Minha Biblioteca</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border border-foreground/20 rounded p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-foreground/60">Pedido #{order.id.substring(0, 8)}</p>
                <p className="text-sm text-foreground/60">
                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <p className="text-primary font-bold">R$ {order.totalAmountBRL.toFixed(2)}</p>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-foreground/5 rounded">
                  <div>
                    <h3 className="font-bold">{item.productTitle}</h3>
                    <p className="text-sm text-foreground/60">R$ {item.priceBRL.toFixed(2)}</p>
                  </div>
                  {/* Download agora é por pedido, não por produto */}
                </div>
              ))}
              {/* Botão de download único por pedido (todos os produtos como ZIP) */}
              <div className="flex justify-end mt-4">
                <DownloadProgressButton
                  orderId={order.id}
                  productName={getProductNameForZip(order)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

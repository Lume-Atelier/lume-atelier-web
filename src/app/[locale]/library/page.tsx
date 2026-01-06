'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OrderService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';
import type { OrderDTO } from '@/types';

export default function LibraryPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
   * 🔐 NOVO FLUXO SEGURO DE DOWNLOAD
   * 1. Chama POST /orders/{id}/downloads
   * 2. Backend valida ownership, status COMPLETED
   * 3. Retorna presigned URLs temporárias (60 min)
   * 4. Browser faz download direto do R2
   */
  const handleDownload = async (orderId: string) => {
    try {
      setDownloadingId(orderId);
      await OrderService.generateAndDownload(orderId);
    } catch (error: any) {
      console.error('Erro no download:', error);

      // Mensagens de erro específicas
      if (error.response?.status === 403) {
        alert('Você não tem permissão para baixar este pedido.');
      } else if (error.response?.status === 400) {
        alert('Pedido ainda não está completo.');
      } else {
        alert('Erro ao fazer download. Tente novamente.');
      }
    } finally {
      setDownloadingId(null);
    }
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
              {/* Botão de download único por pedido (todos os produtos de uma vez) */}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => handleDownload(order.id)}
                  disabled={downloadingId === order.id}
                  variant="outline"
                  size="md"
                >
                  {downloadingId === order.id ? 'Baixando...' : 'Baixar Todos os Arquivos'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

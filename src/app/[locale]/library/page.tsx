'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckoutService, LibraryService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';

export default function LibraryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await CheckoutService.getMyOrders(0, 50);
      const completedOrders = response.content.filter((o: any) => o.status === 'COMPLETED');
      setOrders(completedOrders);
    } catch (error) {
      console.error('Erro ao carregar biblioteca:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (productId: string, productTitle: string) => {
    try {
      setDownloadingId(productId);
      await LibraryService.downloadProduct(productId, `${productTitle}.zip`);
    } catch (error) {
      console.error('Erro no download:', error);
      alert('Erro ao fazer download. Tente novamente.');
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
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-foreground/5 rounded">
                  <div>
                    <h3 className="font-bold">{item.productTitle}</h3>
                    <p className="text-sm text-foreground/60">R$ {item.priceBRL.toFixed(2)}</p>
                  </div>
                  <Button
                    onClick={() => handleDownload(item.product.id, item.productTitle)}
                    disabled={downloadingId === item.product.id}
                    loading={downloadingId === item.product.id}
                    variant="outline"
                    size="md"
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { AdminService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAllOrders(page, 20);
      setOrders(response.content);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Gerenciar Pedidos</h1>

      <div className="border border-foreground/20 rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-foreground/10">
            <tr>
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Data</th>
              <th className="text-left p-4">Total</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Método</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-foreground/20">
                <td className="p-4 font-mono text-sm">{order.id.substring(0, 8)}</td>
                <td className="p-4">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="p-4">R$ {order.totalAmountBRL.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' :
                    order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                    order.status === 'FAILED' ? 'bg-red-500/20 text-red-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">{order.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 justify-center items-center mt-8">
        <Button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          variant="outline"
          size="md"
        >
          Anterior
        </Button>
        <span className="px-6 py-2 font-semibold">Página {page + 1}</span>
        <Button
          onClick={() => setPage(p => p + 1)}
          disabled={orders.length < 20}
          variant="outline"
          size="md"
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { AdminService } from "@/lib/api/services";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ActionButtons } from "@/components/admin/ActionButtons";

interface Order {
  id: string;
  createdAt: string;
  totalAmountBRL: number;
  status: string;
  paymentMethod: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = (await AdminService.getAllOrders(page, 20)) as any;
      setOrders(response.content || []);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Definição das colunas da tabela
  const columns: Column<Order>[] = [
    {
      key: "id",
      header: "ID",
      align: "left",
      render: (order) => (
        <span className="font-mono text-sm">{order.id.substring(0, 8)}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Data",
      align: "left",
      render: (order) => new Date(order.createdAt).toLocaleDateString("pt-BR"),
    },
    {
      key: "totalAmountBRL",
      header: "Total",
      align: "left",
      render: (order) => `R$ ${order.totalAmountBRL.toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      align: "left",
      render: (order) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            order.status === "COMPLETED"
              ? "bg-green-500/20 text-green-500"
              : order.status === "PENDING"
                ? "bg-yellow-500/20 text-yellow-500"
                : order.status === "FAILED"
                  ? "bg-red-500/20 text-red-500"
                  : "bg-blue-500/20 text-blue-500"
          }`}
        >
          {order.status}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      header: "Método de Pagamento",
      align: "left",
    },
    {
      key: "actions",
      header: "Ações",
      align: "right",
      render: (order) => (
        <ActionButtons viewHref={`/admin/orders/${order.id}`} />
      ),
    },
  ];

  // Loading inicial: mostra tela completa de carregamento
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-foreground/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Gerenciar Pedidos</h1>

      {/* Tabela de dados */}
      <DataTable
        columns={columns}
        data={orders}
        keyExtractor={(order) => order.id}
        loading={false}
        emptyMessage="Nenhum pedido encontrado"
      />

      {/* Paginação */}
      <div className="flex gap-4 justify-center items-center mt-8">
        <Button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          variant="outline"
          size="md"
        >
          Anterior
        </Button>
        <span className="px-6 py-2 font-semibold">Página {page + 1}</span>
        <Button
          onClick={() => setPage((p) => p + 1)}
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

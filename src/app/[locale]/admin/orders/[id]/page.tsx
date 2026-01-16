"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { OrderService } from "@/lib/api/services";
import { Button } from "@/components/ui/Button";
import type { OrderDTO } from "@/types";

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "bg-green-500/20 text-green-500";
    case "PENDING":
      return "bg-yellow-500/20 text-yellow-500";
    case "FAILED":
      return "bg-red-500/20 text-red-500";
    default:
      return "bg-blue-500/20 text-blue-500";
  }
}

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR");
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await OrderService.getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      setError("Erro ao carregar pedido");
      console.error("Erro ao carregar pedido:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-foreground/20 border-t-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()}>
          &larr; Voltar
        </Button>
        <div className="mt-8 text-center">
          <p className="text-red-500">{error || "Pedido não encontrado"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          &larr; Voltar
        </Button>
        <h1 className="text-4xl font-bold">Detalhes do Pedido</h1>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card: Informações do Pedido */}
        <div className="border border-foreground/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Informações do Pedido</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-foreground/50">ID</span>
              <span className="font-medium font-mono">
                {order.id.substring(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Data</span>
              <span className="font-medium">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Status</span>
              <span
                className={`px-2 py-1 rounded text-sm ${getStatusBadgeClass(order.status)}`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Pagamento</span>
              <span className="font-medium">{order.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Card: Cliente */}
        <div className="border border-foreground/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Cliente</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-foreground/50">Nome</span>
              <span className="font-medium">{order.userName || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Email</span>
              <span className="font-medium">{order.userEmail || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">ID</span>
              <span className="font-medium font-mono">
                {order.userId ? `${order.userId.substring(0, 8)}...` : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card: Itens do Pedido */}
      <div className="border border-foreground/20 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Itens do Pedido</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 border border-foreground/10 rounded-lg"
            >
              <div className="relative w-16 h-16 flex-shrink-0 bg-foreground/5 rounded overflow-hidden">
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.productTitle}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground/30">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{item.productTitle}</h3>
                <p className="text-sm text-foreground/50 font-mono">
                  {item.productId.substring(0, 8)}...
                </p>
              </div>
              <div className="text-right">
                <span className="font-semibold">
                  {formatCurrency(item.priceBRL)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card: Resumo */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Resumo</h2>
          <div className="text-right">
            <span className="text-foreground/50 mr-2">Total:</span>
            <span className="text-2xl font-bold">
              {formatCurrency(order.totalAmountBRL)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

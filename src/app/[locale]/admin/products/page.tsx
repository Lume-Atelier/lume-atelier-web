"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminService } from "@/lib/api/services";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ActionButtons } from "@/components/admin/ActionButtons";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [syncingProducts, setSyncingProducts] = useState<Set<string>>(
    new Set(),
  );

  // Debounce para o campo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset para primeira página ao buscar
    }, 500); // Aguarda 500ms após parar de digitar

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadProducts();
  }, [page, debouncedSearch]);

  const loadProducts = async () => {
    try {
      // Usa searchLoading se não for o primeiro carregamento
      if (initialLoading) {
        setInitialLoading(true);
      } else {
        setSearchLoading(true);
      }

      const response = await AdminService.getAllProducts(
        page,
        20,
        debouncedSearch,
      );
      setProducts(response.content);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setInitialLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await AdminService.deleteProduct(id);
      loadProducts();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao excluir produto");
    }
  };

  // Definição das colunas da tabela
  const columns: Column<any>[] = [
    {
      key: "title",
      header: "Título",
      align: "left",
    },
    {
      key: "category",
      header: "Categoria",
      align: "left",
    },
    {
      key: "priceInBRL",
      header: "Preço",
      align: "left",
      render: (product) => (
        <span>
          {product.freeProduct ? (
            <span className="px-2 py-1 rounded text-sm bg-green-500/20 text-green-500 font-medium">
              GRÁTIS
            </span>
          ) : (
            `R$ ${product.priceInBRL.toFixed(2)}`
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "left",
      render: (product) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            product.status === "PUBLISHED"
              ? "bg-green-500/20 text-green-500"
              : product.status === "DRAFT"
                ? "bg-yellow-500/20 text-yellow-500"
                : "bg-red-500/20 text-red-500"
          }`}
        >
          {product.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      align: "right",
      render: (product) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButtons
            editHref={`/admin/products/${product.id}/edit`}
            onDelete={() => handleDelete(product.id)}
          />
        </div>
      ),
    },
  ];

  // Loading inicial: mostra tela completa de carregamento
  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-foreground/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold">Gerenciar Produtos</h1>
        <div className="flex gap-3">
          <Link href="/admin/products/new">
            <Button variant="outline" size="lg">
              + Novo Produto
            </Button>
          </Link>
        </div>
      </div>

      {/* Campo de busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar produtos por título..."
          value={search}
          onChange={handleSearch}
          className="w-full md:w-96 px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
        />
      </div>

      {/* Tabela de dados */}
      <DataTable
        columns={columns}
        data={products}
        keyExtractor={(product) => product.id}
        loading={searchLoading}
        emptyMessage="Nenhum produto encontrado"
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
          disabled={products.length < 20}
          variant="outline"
          size="md"
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
      setLoading(true);
      const response = await AdminService.getAllProducts(page, 20, debouncedSearch);
      setProducts(response.content);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await AdminService.deleteProduct(id);
      loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Gerenciar Produtos</h1>
        <Link href="/admin/products/new">
          <Button variant="outline" size="lg">
            + Novo Produto
          </Button>
        </Link>
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

      <div className="border border-foreground/20 rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-foreground/10">
            <tr>
              <th className="text-left p-4">Título</th>
              <th className="text-left p-4">Categoria</th>
              <th className="text-left p-4">Preço</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-foreground/20">
                <td className="p-4">{product.title}</td>
                <td className="p-4">{product.category}</td>
                <td className="p-4">R$ {product.priceInBRL.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    product.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-500' :
                    product.status === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      variant="outline"
                      size="sm"
                    >
                      Excluir
                    </Button>
                  </div>
                </td>
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

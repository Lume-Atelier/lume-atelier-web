'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
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
    loadUsers();
  }, [page, debouncedSearch]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAllUsers(page, 20, debouncedSearch);
      setUsers(response.content);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      await AdminService.deleteUser(id);
      loadUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Gerenciar Usuários</h1>

      {/* Campo de busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={handleSearch}
          className="w-full md:w-96 px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
        />
      </div>

      <div className="border border-foreground/20 rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-foreground/10">
            <tr>
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Criado em</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-foreground/20">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    user.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-foreground/10'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="p-4">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Editar
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleDelete(user.id)}
                      disabled={user.role === 'ADMIN'}
                      variant="destructive"
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
          disabled={users.length < 20}
          variant="outline"
          size="md"
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}

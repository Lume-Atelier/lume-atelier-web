'use client';

import { useState, useEffect } from 'react';
import { AdminService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/admin/DataTable';
import { ActionButtons } from '@/components/admin/ActionButtons';
import type { User } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
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
      // Usa searchLoading se não for o primeiro carregamento
      if (initialLoading) {
        setInitialLoading(true);
      } else {
        setSearchLoading(true);
      }

      const response = await AdminService.getAllUsers(page, 20, debouncedSearch);
      setUsers(response.content);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setInitialLoading(false);
      setSearchLoading(false);
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

  // Definição das colunas da tabela
  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nome',
      align: 'left',
    },
    {
      key: 'email',
      header: 'Email',
      align: 'left',
    },
    {
      key: 'role',
      header: 'Role',
      align: 'left',
      render: (user) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            user.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-foreground/10'
          }`}
        >
          {user.role}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Criado em',
      align: 'left',
      render: (user) => new Date(user.createdAt).toLocaleDateString('pt-BR'),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (user) => (
        <ActionButtons
          editHref={`/admin/users/${user.id}/edit`}
          onDelete={() => handleDelete(user.id)}
          deleteDisabled={user.role === 'ADMIN'}
          deleteTooltip="Administradores não podem ser excluídos"
        />
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

      {/* Tabela de dados */}
      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(user) => user.id}
        loading={searchLoading}
        emptyMessage="Nenhum usuário encontrado"
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

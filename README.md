# Lume Atelier - Frontend

Loja global de assets 3D construída com Next.js 15+, TypeScript e Tailwind CSS.

## Stack Tecnológica

### Core
- **Next.js 15+** - React framework com App Router
- **TypeScript 5+** - Tipagem estática
- **React 18+** - Biblioteca UI

### Estilização
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Componentes reutilizáveis

### Gerenciamento de Estado
- **Zustand** - State management leve (carrinho, sessão)
- **TanStack Query** - Cache e sincronização de dados da API

### Formulários & Validação
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas TypeScript

### Upload de Arquivos
- **react-dropzone** - Drag & drop de arquivos
- **Uppy** - Upload de arquivos grandes com chunking

### Internacionalização
- **next-intl** - i18n para Next.js

### Pagamentos
- **@stripe/stripe-js** - Integração com Stripe

### HTTP Client
- **Axios** - Requisições HTTP

## Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.local.example .env.local

# Editar .env.local com suas credenciais
```

## Desenvolvimento

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## Estrutura de Pastas

```
frontend/
├── public/              # Arquivos estáticos
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── [locale]/   # Rotas internacionalizadas
│   │   ├── admin/      # Painel administrativo
│   │   └── api/        # API Routes (proxy/webhooks)
│   ├── components/     # Componentes React
│   │   ├── ui/         # Componentes base (shadcn)
│   │   ├── forms/      # Formulários
│   │   └── layouts/    # Layouts
│   ├── lib/            # Utilitários e configurações
│   │   ├── api/        # Cliente API (axios)
│   │   ├── hooks/      # Custom hooks
│   │   └── utils/      # Funções utilitárias
│   ├── stores/         # Zustand stores
│   ├── types/          # TypeScript types/interfaces
│   └── messages/       # Arquivos de tradução (i18n)
└── package.json
```

## Variáveis de Ambiente

Veja `.env.local.example` para todas as variáveis necessárias.

## Integração com Backend

O backend Java Spring Boot deve rodar em `http://localhost:8080` (configurável via `NEXT_PUBLIC_API_URL`).

## Deploy

O projeto está otimizado para deploy na Vercel, mas pode ser deployado em qualquer plataforma que suporte Next.js.

```bash
npm run build
npm start
```

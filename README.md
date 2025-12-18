# Marcenaria Silva - Sistema de Gestão

Sistema completo de gestão para marcenaria com site público, dashboard administrativo e integração com Supabase.

## Funcionalidades

### Site Público
- Página inicial com informações da empresa
- Catálogo de produtos com filtros por categoria
- Carrossel de imagens nos produtos
- Formulário de contato com upload de imagens
- Botão WhatsApp flutuante
- Tema personalizável (cores configuráveis)

### Dashboard Administrativo
- Gerenciamento de produtos (CRUD completo)
- Gerenciamento de categorias
- Gerenciamento de orçamentos
- Gerenciamento de contatos
- Configurações da empresa (nome, logo, cores, informações)
- Gestão de imagens dos produtos

## Como Rodar Localmente

### 1. Clone o projeto
```bash
# Baixe o ZIP do projeto ou clone do repositório
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase - Obtenha essas informações no painel do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon

# Senha de admin para cadastro de usuários
ADMIN_SIGNUP_PASSWORD=sua-senha-admin
```

**Onde encontrar as credenciais do Supabase:**
1. Acesse [supabase.com](https://supabase.com)
2. Faça login e selecione seu projeto
3. Vá em Settings → API
4. Copie a `URL` e a `anon public` key

### 4. Configure o banco de dados

Execute os scripts SQL na ordem (disponíveis na pasta `scripts/`):

1. `001_create_tables.sql` - Cria as tabelas principais
2. `002_seed_data.sql` - Insere dados de exemplo
3. Outros scripts conforme necessário

**Como executar os scripts:**
1. Acesse o painel do Supabase
2. Vá em SQL Editor
3. Cole o conteúdo de cada script e execute

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000)

## Deploy no Vercel

1. Faça push do código para um repositório Git (GitHub, GitLab, etc)
2. Importe o projeto no Vercel
3. Configure as variáveis de ambiente no painel do Vercel
4. O Vercel fará o deploy automaticamente

## Estrutura do Projeto

```
├── app/                    # Rotas Next.js
│   ├── page.tsx           # Página pública (home)
│   ├── login/             # Página de login
│   └── app/               # Dashboard (área administrativa)
├── components/            # Componentes reutilizáveis
├── lib/                   # Utilitários e configurações
│   └── supabase/         # Cliente Supabase
├── hooks/                 # React hooks customizados
├── types/                 # TypeScript types
├── scripts/              # Scripts SQL do banco de dados
└── public/               # Arquivos estáticos

```

## Tecnologias

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase (Database + Storage + Auth)
- Radix UI (Componentes)
- shadcn/ui

## Problemas Comuns

### Erro: Failed to fetch / ERR_NAME_NOT_RESOLVED
Verifique se as variáveis de ambiente estão configuradas corretamente no arquivo `.env.local`

### Produtos não aparecem
Execute os scripts SQL do banco de dados na ordem correta

### Erro de autenticação
Verifique se a `ADMIN_SIGNUP_PASSWORD` está configurada

## Suporte

Para problemas ou dúvidas, abra uma issue no repositório.

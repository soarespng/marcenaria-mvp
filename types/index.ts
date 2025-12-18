export interface Produto {
  id: string
  nome: string
  descricao: string | null
  preco: number
  estoque: number
  created_at: string
}

export interface Contato {
  id: string
  nome: string
  email: string
  mensagem: string
  created_at: string
}

export interface ContatoSimples {
  id: string
  nome: string
  email: string
  numero: string | null
  observacao: string | null
  created_at: string
  updated_at: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  nome: string
  slug: string
  descricao: string | null
  created_at: string
}

export interface ProdutoImagem {
  id: string
  produto_id: string
  url: string
  ordem: number
  created_at: string
}

export interface ProdutoComImagens extends Produto {
  categoria_id: string | null
  categoria?: Categoria
  imagens: ProdutoImagem[]
}

export interface Configuracoes {
  id: string
  nome_empresa: string
  logo_url: string | null
  telefone: string | null
  endereco: string | null
  horario_funcionamento: string | null
  cor_primaria: string | null
  cor_secundaria: string | null
  cor_destaque: string | null
  created_at: string
  updated_at: string
}

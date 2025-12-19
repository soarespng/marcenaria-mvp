"use client"

import Link from "next/link"
import { Award, Ruler, Sparkles, ChevronLeft, ChevronRight, Book, History } from "lucide-react"

import { useEffect } from "react"

import { useRef } from "react"

import { useState } from "react"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock, Loader2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useConfig } from "@/hooks/use-config"
import WhatsAppButton from "@/components/whatsapp-button"

interface Produto {
  id: string
  nome: string
  descricao: string
  preco: number
  estoque: number
  categoria: { id: string; nome: string }
  imagens: Array<{ id: string; url: string }>
}

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Array<{ id: string; nome: string }>>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas")
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: "",
    arquivos: [] as File[],
  })
  const [enviando, setEnviando] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const mensagemRef = useRef<HTMLTextAreaElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})

  const { config, loading: configLoading } = useConfig()
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadCategorias() {
      const { data } = await supabase.from("categorias").select("*").order("nome", { ascending: true })

      if (data) {
        setCategorias(data)
      }
    }

    loadCategorias()
  }, [])

  useEffect(() => {
    async function fetchData() {
      let query = supabase
        .from("produtos")
        .select("*, categoria:categorias(id, nome), imagens:produto_imagens(*)")
        .order("created_at", { ascending: false })

      if (categoriaFiltro !== "todas") {
        query = query.eq("categoria_id", categoriaFiltro)
      }

      const { data, error } = await query

      if (data) {
        setProdutos(data)
      }
    }

    fetchData()
  }, [categoriaFiltro])

  useEffect(() => {
    if (produtoSelecionado) {
      const mensagemProduto = `Olá! Gostaria de solicitar um orçamento para:

Produto: ${produtoSelecionado.nome}
${produtoSelecionado.descricao ? `Descrição: ${produtoSelecionado.descricao}` : ""}

Aguardo retorno. Obrigado!`

      setFormData((prev) => ({ ...prev, mensagem: mensagemProduto }))

      const contatoSection = document.getElementById("contato")
      if (contatoSection) {
        contatoSection.scrollIntoView({ behavior: "smooth", block: "start" })
      }

      setTimeout(() => {
        mensagemRef.current?.focus()
      }, 800)
    }
  }, [produtoSelecionado])

  const solicitarOrcamento = (produto: Produto) => {
    setProdutoSelecionado(produto)
  }

  const nextImage = (produtoId: string, totalImages: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [produtoId]: ((prev[produtoId] || 0) + 1) % totalImages,
    }))
  }

  const prevImage = (produtoId: string, totalImages: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [produtoId]: ((prev[produtoId] || 0) - 1 + totalImages) % totalImages,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)

    try {
      const arquivosUrls: string[] = []

      if (formData.arquivos.length > 0) {
        for (const arquivo of formData.arquivos) {
          const nomeArquivo = `${Date.now()}-${arquivo.name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("produtos")
            .upload(nomeArquivo, arquivo)

          if (uploadError) {
            console.error("Erro ao fazer upload:", uploadError)
          } else {
            const { data: urlData } = supabase.storage.from("produtos").getPublicUrl(uploadData.path)

            arquivosUrls.push(urlData.publicUrl)
          }
        }
      }

      const { error } = await supabase.from("contatos").insert([
        {
          nome: formData.nome,
          email: formData.email,
          mensagem: formData.mensagem,
          arquivos: arquivosUrls.length > 0 ? JSON.stringify(arquivosUrls) : null,
        },
      ])

      if (error) throw error

      alert("Mensagem enviada com sucesso! Entraremos em contato em breve.")
      setFormData({ nome: "", email: "", mensagem: "", arquivos: [] })
      setProdutoSelecionado(null)
    } catch (error) {
      console.error("Erro ao enviar:", error)
      alert("Erro ao enviar mensagem. Tente novamente.")
    } finally {
      setEnviando(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const novosArquivos = Array.from(e.target.files)
      setFormData((prev) => ({
        ...prev,
        arquivos: [...prev.arquivos, ...novosArquivos],
      }))
    }
  }

  const removerArquivo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      arquivos: prev.arquivos.filter((_, i) => i !== index),
    }))
  }

  console.log(config);

  return (
    <>
      {configLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : config != null && (
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
              <Link href="/" className="flex items-center gap-3">
                {config?.logo_url ? (
                  <img
                    src={config.logo_url || "/placeholder.svg"}
                    alt={config.nome_empresa}
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <img src="/placeholder.svg" alt="Hammer" className="h-6 w-6 text-primary-foreground" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xl font-bold leading-none">{config?.nome_empresa || "Marcenaria Artesanal"}</span>
                  <span className="text-xs text-muted-foreground">Móveis sob medida</span>
                </div>
              </Link>
              <nav className="hidden items-center gap-8 md:flex">
                <Link href="#produtos" className="text-sm font-medium transition-colors hover:text-primary">
                  Produtos
                </Link>
                <Link href="#sobre" className="text-sm font-medium transition-colors hover:text-primary">
                  Sobre Nós
                </Link>
                <Link href="#contato" className="text-sm font-medium transition-colors hover:text-primary">
                  Contato
                </Link>
              </nav>
            </div>
          </header>

          {/* Hero Section */}
          <section
            className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
            style={{
              background:
                config?.cor_primaria && config?.cor_secundaria
                  ? `linear-gradient(135deg, ${config.cor_secundaria} 0%, ${config.cor_primaria}15 50%, ${config.cor_secundaria} 100%)`
                  : "linear-gradient(135deg, #fef3c7 0%, #78350f15 50%, #fef3c7 100%)",
            }}
          >
            <div className="container relative z-10 px-4 py-20 mx-auto text-center">
              <h1 className="mb-6 text-4xl font-bold leading-tight text-balance md:text-6xl lg:text-7xl">
                Móveis de Madeira Artesanais e Únicos
              </h1>
              <p className="mb-8 text-lg text-muted-foreground text-pretty md:text-xl">
                Criamos peças exclusivas com madeira de qualidade, unindo tradição e design moderno para transformar seu
                espaço.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-base px-8 shadow-lg"
                  style={{
                    backgroundColor: config?.cor_primaria || "#78350f",
                    color: "#fff",
                  }}
                >
                  <Book className="mr-2 h-5 w-5" />
                  Ver catálogo
                </Button>
                <Button size="lg" variant="secondary" className="text-base px-8 bg-white/80 backdrop-blur shadow-lg">
                  Faça um orçamento
                </Button>
              </div>
            </div>
          </section>

          {/* Sobre a Marcenaria */}
          <section id="sobre" className="py-20 bg-gradient-to-b from-white to-amber-50/30">
            <div className="container px-4 mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h2 className="text-3xl font-bold md:text-4xl">Nossa História</h2>
              </div>
              <div className="mb-12 text-center">
                <p className="text-lg text-muted-foreground">Transformando madeira em arte há mais de 20 anos</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <Card className="border-none bg-muted/50">
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Award className="h-8 w-8 text-primary" style={{
                          color: config?.cor_primaria || "#78350f",
                        }} />
                      </div>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Qualidade Premium</h3>
                    <p className="text-sm text-muted-foreground">
                      Trabalhamos apenas com madeiras nobres e acabamento impecável
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none bg-muted/50">
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Ruler className="h-8 w-8 text-primary" style={{
                          color: config?.cor_primaria || "#78350f",
                        }} />
                      </div>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Sob Medida</h3>
                    <p className="text-sm text-muted-foreground">Cada peça é criada especialmente para você e seu espaço</p>
                  </CardContent>
                </Card>

                <Card className="border-none bg-muted/50">
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-8 w-8 text-primary" style={{
                          color: config?.cor_primaria || "#78350f",
                        }} />
                      </div>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Design Exclusivo</h3>
                    <p className="text-sm text-muted-foreground">Unimos tradição artesanal com tendências contemporâneas</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Produtos */}
          <section id="produtos" className="py-20 bg-white">
            <div className="container px-4 mx-auto">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">Nossos Produtos</h2>
                <p className="text-lg text-muted-foreground">Móveis artesanais de alta qualidade</p>
              </div>

              {categorias.length > 0 && (
                <div className="mb-8 flex flex-wrap justify-center gap-3">
                  <Button
                    variant={categoriaFiltro === "todas" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoriaFiltro("todas")}
                    className="min-w-[100px]"
                  >
                    Todas
                  </Button>
                  {categorias.map((categoria) => (
                    <Button
                      key={categoria.id}
                      variant={categoriaFiltro === categoria.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoriaFiltro(categoria.id)}
                      className="min-w-[100px]"
                    >
                      {categoria.nome}
                    </Button>
                  ))}
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {produtos.map((produto) => {
                  const imagens =
                    produto.imagens?.length > 0
                      ? produto.imagens
                      : [
                        {
                          id: "placeholder",
                          url: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(produto.nome)}`,
                        },
                      ]

                  const currentIndex = currentImageIndex[produto.id] || 0
                  const imageUrl = imagens[currentIndex]?.url

                  return (
                    <Card key={produto.id} className="group overflow-hidden transition-all hover:shadow-xl">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={produto.nome}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />

                        {/* Navegação do carrossel - só aparece se tiver mais de 1 imagem */}
                        {imagens.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                prevImage(produto.id, imagens.length)
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                              aria-label="Imagem anterior"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                nextImage(produto.id, imagens.length)
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                              aria-label="Próxima imagem"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>

                            {/* Indicadores de página */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {imagens.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setCurrentImageIndex((prev) => ({ ...prev, [produto.id]: idx }))
                                  }}
                                  className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
                                    }`}
                                  aria-label={`Ir para imagem ${idx + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <CardContent className="flex flex-col gap-4 p-5">
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold text-lg line-clamp-1">{produto.nome}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                            {produto.descricao || "Produto artesanal de alta qualidade"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t pt-3">
                          <span className="text-xl font-bold text-primary" style={{
                            color: config?.cor_primaria || "#000",
                          }}>
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(produto.preco)}
                          </span>
                          <div className="rounded bg-primary/10 px-2 py-1 text-xs shadow-lg">
                            {produto.estoque > 0 ? "Disponível" : "Sob encomenda"}
                          </div>
                        </div>

                        <Button className="w-full" size="sm" onClick={() => solicitarOrcamento(produto)} style={{
                          backgroundColor: config?.cor_primaria || "#78350f",
                          color: "#fff",
                        }}>
                          Solicitar Orçamento
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Contato */}
          <section id="contato" className="bg-background py-20">
            <div className="container mx-auto px-4">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">Entre em Contato</h2>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                  Tire suas dúvidas, solicite um orçamento ou agende uma visita
                </p>
              </div>

              <div className="mx-auto max-w-6xl space-y-6">
                {/* Card principal com formulário e mapa */}
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <div className="grid gap-8 lg:grid-cols-2">
                      {/* Formulário */}
                      <div>
                        <div className="mb-6">
                          <h3 className="mb-2 text-xl font-semibold">Envie sua mensagem</h3>
                          <p className="text-sm text-muted-foreground">
                            Preencha o formulário e entraremos em contato em breve
                          </p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <label htmlFor="nome" className="mb-1.5 block text-sm font-medium">
                              Nome completo
                            </label>
                            <Input
                              id="nome"
                              placeholder="Digite seu nome"
                              value={formData.nome}
                              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                              required
                              className="h-11"
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                              E-mail
                            </label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="seu@email.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              required
                              className="h-11"
                            />
                          </div>
                          <div>
                            <label htmlFor="mensagem" className="mb-1.5 block text-sm font-medium">
                              Mensagem
                            </label>
                            <Textarea
                              ref={mensagemRef}
                              id="mensagem"
                              placeholder="Descreva o móvel que você procura ou tire suas dúvidas..."
                              rows={5}
                              value={formData.mensagem}
                              onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                              required
                              className="resize-none"
                            />
                          </div>

                          <div>
                            <label htmlFor="arquivos" className="mb-1.5 block text-sm font-medium">
                              Anexar fotos (opcional)
                            </label>
                            <Input
                              id="arquivos"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleFileChange}
                              className="h-11"
                            />
                            {formData.arquivos.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {formData.arquivos.map((arquivo, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between rounded bg-muted px-3 py-2 text-sm"
                                  >
                                    <span className="truncate">{arquivo.name}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removerArquivo(index)}
                                      className="h-6 px-2 text-xs"
                                    >
                                      Remover
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <Button type="submit" className="w-full" size="lg" disabled={enviando} style={{
                            backgroundColor: config?.cor_primaria || "#78350f",
                            color: "#fff",
                          }}>
                            {enviando ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Mail className="mr-2 h-4 w-4" />
                                Enviar Mensagem
                              </>
                            )}
                          </Button>
                        </form>
                      </div>

                      {/* Mapa */}
                      <div className="relative min-h-[400px] lg:min-h-full">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1974788420833!2d-46.65883668502196!3d-23.561684684682358!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1234567890123!5m2!1spt-BR!2sbr"
                          className="absolute inset-0 h-full w-full"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Localização da marcenaria"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informações de contato */}

                {config?.endereco || config?.telefone || config?.email_contato || config?.horario_funcionamento && (
                  <Card className="overflow-hidden border-2 py-0">
                    <CardContent className="p-0">
                      <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4">
                        {config?.endereco && (
                          <div className="bg-background p-6 transition-colors hover:bg-muted/50">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                              <MapPin className="h-6 w-6 text-primary" style={{
                                color: config?.cor_primaria || "#78350f",
                              }} />
                            </div>
                            <h4 className="mb-2 font-semibold">Endereço</h4>
                            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                              {config.endereco}
                            </p>
                          </div>
                        )}

                        {config?.telefone && (
                          <div className="bg-background p-6 transition-colors hover:bg-muted/50">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                              <Phone className="h-6 w-6 text-primary" style={{
                                color: config?.cor_primaria || "#78350f",
                              }} />
                            </div>
                            <h4 className="mb-2 font-semibold">Telefone</h4>
                            <p className="mb-1 text-sm font-medium">{config.telefone}</p>
                            <p className="text-xs text-muted-foreground">WhatsApp disponível</p>
                          </div>
                        )}

                        {config?.email_contato && (
                          <div className="bg-background p-6 transition-colors hover:bg-muted/50">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                              <Mail className="h-6 w-6 text-primary" style={{
                                color: config?.cor_primaria || "#78350f",
                              }} />
                            </div>
                            <h4 className="mb-2 font-semibold">E-mail</h4>
                            <p className="mb-1 text-sm font-medium break-all">contato@marcenaria.com.br</p>
                            <p className="text-xs text-muted-foreground">Respondemos em até 24h</p>
                          </div>
                        )}

                        {config?.horario_funcionamento && (
                          <div className="bg-background p-6 transition-colors hover:bg-muted/50">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                              <Clock className="h-6 w-6 text-primary" style={{
                                color: config?.cor_primaria || "#78350f",
                              }} />
                            </div>
                            <h4 className="mb-2 font-semibold">Horário</h4>
                            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                              {config.horario_funcionamento}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t bg-muted/30 py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex items-center gap-3">
                  {config?.logo_url ? (
                    <img
                      src={config.logo_url || ""}
                      alt={config.nome_empresa}
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <img src="/placeholder.svg" className="h-6 w-6 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-bold leading-none">{config?.nome_empresa || "Marcenaria Artesanal"}</span>
                    <span className="text-xs text-muted-foreground">Móveis sob medida desde 2003</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">© 2025 Todos os direitos reservados.</p>
              </div>
            </div>
          </footer>

          <WhatsAppButton />
        </div>

      )}
    </>
  )
}

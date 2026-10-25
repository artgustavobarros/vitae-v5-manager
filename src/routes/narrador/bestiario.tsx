import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Plus, Trash2, Edit3, ShieldAlert, Copy, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { BarraApp } from '#/components/barra-app'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '#/components/ui/card'
import { CarrosselBadges } from '#/components/ui/carrossel-badges'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input, InputNumero } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { EditorRichText, VisualizadorMarkdown } from '#/components/ui/editor-rich-text'
import {
  criarModeloAntagonistaPadrao,
  type ModeloAntagonista,
} from '#/domain/bestiario'
import {
  excluirModeloBestiario,
  listarModelosBestiario,
  salvarModeloBestiario,
} from '#/server/bestiario'

export const Route = createFileRoute('/narrador/bestiario')({
  beforeLoad: ({ context }) => {
    if (!context.usuario || context.usuario.papel !== 'narrador') {
      throw redirect({ to: '/' })
    }
  },
  loader: async () => {
    return listarModelosBestiario()
  },
  component: PaginaBestiario,
})

function BadgeEspecial({ nome, descricao }: { nome: string; descricao?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
        >
          {nome}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-64 overflow-y-auto p-3 text-xs" side="top">
        <h4 className="font-semibold text-sm mb-1.5 text-foreground">{nome}</h4>
        {descricao?.trim() ? (
          <div className="text-muted-foreground text-xs leading-relaxed">
            <VisualizadorMarkdown markdown={descricao} />
          </div>
        ) : (
          <p className="text-muted-foreground italic text-xs">Sem detalhes adicionais.</p>
        )}
      </PopoverContent>
    </Popover>
  )
}

function PaginaBestiario() {
  const modelos = Route.useLoaderData()
  const router = useRouter()

  const [dialogAberto, setDialogAberto] = useState(false)
  const [modeloEmEdicao, setModeloEmEdicao] = useState<ModeloAntagonista | null>(null)
  const [modeloParaExcluir, setModeloParaExcluir] = useState<ModeloAntagonista | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todas')
  const [busca, setBusca] = useState<string>('')

  const categorias = useMemo(() => {
    const cats = new Set(modelos.map((m) => m.categoria?.trim() || 'Geral'))
    return ['Todas', ...Array.from(cats).sort()]
  }, [modelos])

  const categoriasExistentes = useMemo(() => {
    const cats = new Set(modelos.map((m) => m.categoria?.trim() || 'Geral'))
    return Array.from(cats).sort()
  }, [modelos])

  const modelosFiltrados = useMemo(() => {
    return modelos.filter((m) => {
      const cat = m.categoria?.trim() || 'Geral'
      const bateCategoria = categoriaAtiva === 'Todas' || cat === categoriaAtiva
      if (!bateCategoria) return false

      if (!busca.trim()) return true
      const termo = busca.toLowerCase()
      return (
        m.nome.toLowerCase().includes(termo) ||
        cat.toLowerCase().includes(termo) ||
        m.notas.toLowerCase().includes(termo) ||
        m.especiais.some(
          (e) =>
            e.nome.toLowerCase().includes(termo) ||
            e.descricao.toLowerCase().includes(termo),
        )
      )
    })
  }, [modelos, categoriaAtiva, busca])

  function abrirNovo() {
    setModeloEmEdicao(criarModeloAntagonistaPadrao())
    setErro(null)
    setDialogAberto(true)
  }

  function abrirEditar(m: ModeloAntagonista) {
    setModeloEmEdicao({
      ...m,
      paradasExcepcionais: [...m.paradasExcepcionais],
      especiais: [...m.especiais],
    })
    setErro(null)
    setDialogAberto(true)
  }

  function abrirDuplicar(m: ModeloAntagonista) {
    setModeloEmEdicao({
      ...m,
      id: undefined,
      nome: `${m.nome} (Cópia)`,
      categoria: m.categoria || 'Geral',
      paradasExcepcionais: m.paradasExcepcionais.map((p) => ({ ...p })),
      especiais: m.especiais.map((e) => ({ ...e })),
    })
    setErro(null)
    setDialogAberto(true)
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!modeloEmEdicao) return
    if (!modeloEmEdicao.nome.trim()) {
      setErro('Nome do modelo é obrigatório.')
      return
    }

    setSalvando(true)
    setErro(null)
    try {
      await salvarModeloBestiario({ data: modeloEmEdicao })
      setDialogAberto(false)
      setModeloEmEdicao(null)
      router.invalidate()
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Falha ao salvar modelo.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir() {
    if (!modeloParaExcluir?.id) return
    try {
      await excluirModeloBestiario({ data: { id: modeloParaExcluir.id } })
      setModeloParaExcluir(null)
      router.invalidate()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Falha ao excluir modelo.')
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0">
      <BarraApp />
      <div className="flex flex-col gap-6 pt-2 pb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-display text-balance">Bestiário</h1>
            <p className="text-sm text-muted-foreground">
              Modelos de antagonistas com ficha simplificada de V5, privados do Narrador.
            </p>
          </div>
          <Button onClick={abrirNovo} className="gap-2 self-start sm:self-auto">
            <Plus className="size-4" />
            Novo Modelo
          </Button>
        </div>

        {modelos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <ShieldAlert className="size-10 text-muted-foreground mb-3" />
            <h3 className="font-serif text-xl font-medium">Nenhum Modelo cadastrado</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
              Crie modelos de antagonistas (como policiais, ghouls ou vampiros rivais) para adicionar rapidamente aos combates.
            </p>
            <Button onClick={abrirNovo} variant="secondary" className="gap-2">
              <Plus className="size-4" />
              Criar Primeiro Modelo
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Abas de Categorias com Carrossel Drag-Free */}
              <div className="min-w-0 flex-1">
                <CarrosselBadges>
                  {categorias.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={categoriaAtiva === cat ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-xs rounded-full px-3 shrink-0"
                      onClick={() => setCategoriaAtiva(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </CarrosselBadges>
              </div>

              {/* Busca por texto */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar modelo ou especial..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>

            {modelosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum modelo encontrado para o filtro atual.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modelosFiltrados.map((m) => (
                  <Card key={m.id} className="flex flex-col justify-between">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="font-serif text-xl leading-tight">{m.nome}</CardTitle>
                        <Badge variant="secondary" className="text-xs shrink-0 font-normal">
                          {m.categoria || 'Geral'}
                        </Badge>
                      </div>
                      <CardDescription>
                        Vitalidade {m.vitalidade} &bull; Força de Vontade {m.vontade}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 text-sm">
                      <div className="grid grid-cols-3 gap-2 rounded-md bg-muted/40 p-2 text-center">
                        <div>
                          <span className="block text-xs text-muted-foreground">Físico</span>
                          <span className="font-semibold text-base tabular-nums">{m.paradaFisico}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-muted-foreground">Social</span>
                          <span className="font-semibold text-base tabular-nums">{m.paradaSocial}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-muted-foreground">Mental</span>
                          <span className="font-semibold text-base tabular-nums">{m.paradaMental}</span>
                        </div>
                      </div>

                      {m.paradasExcepcionais.length > 0 && (
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">Paradas excepcionais:</span>
                          <CarrosselBadges>
                            {m.paradasExcepcionais.map((pe, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs shrink-0">
                                {pe.nome}: {pe.valor}
                              </Badge>
                            ))}
                          </CarrosselBadges>
                        </div>
                      )}

                      {m.especiais.length > 0 && (
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">Especiais:</span>
                          <CarrosselBadges>
                            {m.especiais.map((esp, idx) => (
                              <BadgeEspecial key={idx} nome={esp.nome} descricao={esp.descricao} />
                            ))}
                          </CarrosselBadges>
                        </div>
                      )}

                      {m.notas && (
                        <div className="text-xs text-muted-foreground line-clamp-3 italic">
                          <VisualizadorMarkdown markdown={m.notas} />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-1.5 border-t pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => abrirDuplicar(m)}
                        title="Duplicar modelo como nova variante"
                      >
                        <Copy className="size-3.5" />
                        Duplicar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => abrirEditar(m)}
                      >
                        <Edit3 className="size-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs text-destructive hover:text-destructive"
                        onClick={() => setModeloParaExcluir(m)}
                      >
                        <Trash2 className="size-3.5" />
                        Excluir
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog para Criar/Editar Modelo */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSalvar}>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {modeloEmEdicao?.id ? 'Editar Modelo' : 'Novo Modelo de Antagonista'}
              </DialogTitle>
              <DialogDescription>
                Ficha simplificada de V5 para antagonistas e inimigos no Combate.
              </DialogDescription>
            </DialogHeader>

            {erro && (
              <div className="my-2 rounded bg-destructive/15 p-3 text-sm text-destructive">
                {erro}
              </div>
            )}

            {modeloEmEdicao && (
              <div className="flex flex-col gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="nome-modelo">Nome do Modelo</Label>
                    <Input
                      id="nome-modelo"
                      placeholder="Ex: Padrão, De Ataque, Ocultista..."
                      value={modeloEmEdicao.nome}
                      onChange={(e) =>
                        setModeloEmEdicao({ ...modeloEmEdicao, nome: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="categoria-modelo">Categoria / Arquétipo</Label>
                    <Input
                      id="categoria-modelo"
                      list="categorias-existentes"
                      placeholder="Ex: Carniçal, Mortal, Segunda Inquisição..."
                      value={modeloEmEdicao.categoria}
                      onChange={(e) =>
                        setModeloEmEdicao({ ...modeloEmEdicao, categoria: e.target.value })
                      }
                      required
                    />
                    <datalist id="categorias-existentes">
                      {categoriasExistentes.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="parada-fisico">Físico</Label>
                    <InputNumero
                      id="parada-fisico"
                      min={1}
                      max={15}
                      value={modeloEmEdicao.paradaFisico}
                      onChange={(val) =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          paradaFisico: val,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="parada-social">Social</Label>
                    <InputNumero
                      id="parada-social"
                      min={1}
                      max={15}
                      value={modeloEmEdicao.paradaSocial}
                      onChange={(val) =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          paradaSocial: val,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="parada-mental">Mental</Label>
                    <InputNumero
                      id="parada-mental"
                      min={1}
                      max={15}
                      value={modeloEmEdicao.paradaMental}
                      onChange={(val) =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          paradaMental: val,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="vitalidade">Vitalidade</Label>
                    <InputNumero
                      id="vitalidade"
                      min={1}
                      max={20}
                      value={modeloEmEdicao.vitalidade}
                      onChange={(val) =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          vitalidade: val,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="vontade">Força de Vontade</Label>
                    <InputNumero
                      id="vontade"
                      min={1}
                      max={20}
                      value={modeloEmEdicao.vontade}
                      onChange={(val) =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          vontade: val,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Paradas Excepcionais */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Paradas Excepcionais</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          paradasExcepcionais: [
                            ...modeloEmEdicao.paradasExcepcionais,
                            { nome: '', valor: 4 },
                          ],
                        })
                      }
                    >
                      <Plus className="size-3.5" />
                      Adicionar
                    </Button>
                  </div>
                  {modeloEmEdicao.paradasExcepcionais.map((pe, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Nome (ex: Armas de Fogo)"
                        value={pe.nome}
                        onChange={(e) => {
                          const copia = [...modeloEmEdicao.paradasExcepcionais]
                          copia[idx] = { ...copia[idx], nome: e.target.value }
                          setModeloEmEdicao({ ...modeloEmEdicao, paradasExcepcionais: copia })
                        }}
                        className="flex-1"
                      />
                      <InputNumero
                        min={1}
                        max={15}
                        placeholder="Dados"
                        value={pe.valor}
                        onChange={(val) => {
                          const copia = [...modeloEmEdicao.paradasExcepcionais]
                          copia[idx] = {
                            ...copia[idx],
                            valor: val,
                          }
                          setModeloEmEdicao({ ...modeloEmEdicao, paradasExcepcionais: copia })
                        }}
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 shrink-0 text-destructive"
                        onClick={() => {
                          const copia = modeloEmEdicao.paradasExcepcionais.filter((_, i) => i !== idx)
                          setModeloEmEdicao({ ...modeloEmEdicao, paradasExcepcionais: copia })
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Especiais */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Especiais</Label>
                      <span className="block text-xs text-muted-foreground">
                        Poderes, vantagens táticas ou regras especiais. Ficam como badges clicáveis na ficha.
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs shrink-0"
                      onClick={() =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          especiais: [
                            ...modeloEmEdicao.especiais,
                            { nome: '', descricao: '' },
                          ],
                        })
                      }
                    >
                      <Plus className="size-3.5" />
                      Adicionar
                    </Button>
                  </div>
                  {modeloEmEdicao.especiais.map((esp, idx) => (
                    <div key={idx} className="flex flex-col gap-2 rounded-md border p-3 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Nome do Especial (ex: Sentidos Aguçados, Mordida Feroz)"
                          value={esp.nome}
                          onChange={(e) => {
                            const copia = [...modeloEmEdicao.especiais]
                            copia[idx] = { ...copia[idx], nome: e.target.value }
                            setModeloEmEdicao({ ...modeloEmEdicao, especiais: copia })
                          }}
                          className="flex-1 h-9 text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            const copia = modeloEmEdicao.especiais.filter((_, i) => i !== idx)
                            setModeloEmEdicao({ ...modeloEmEdicao, especiais: copia })
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <EditorRichText
                        placeholder="Descrição ou regras do Especial (suporta Markdown: negrito, itálico, listas...)"
                        rows={3}
                        value={esp.descricao}
                        onChange={(val) => {
                          const copia = [...modeloEmEdicao.especiais]
                          copia[idx] = { ...copia[idx], descricao: val }
                          setModeloEmEdicao({ ...modeloEmEdicao, especiais: copia })
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Notas */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="notas">Notas e Equipamentos</Label>
                  <EditorRichText
                    id="notas"
                    placeholder="Informações táticas, equipamentos ou armas (suporta Markdown: negrito, listas...)"
                    rows={4}
                    value={modeloEmEdicao.notas}
                    onChange={(val) =>
                      setModeloEmEdicao({ ...modeloEmEdicao, notas: val })
                    }
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogAberto(false)}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar Modelo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog
        open={Boolean(modeloParaExcluir)}
        onOpenChange={(aberto) => !aberto && setModeloParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">
              Excluir {modeloParaExcluir?.nome}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá este modelo do Bestiário. Inimigos já instanciados em combates anteriores não serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

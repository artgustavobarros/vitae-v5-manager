import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Plus, Trash2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import { CatalogoDaCoterie } from '#/components/catalogo-coterie'
import { Combobox } from '#/components/combobox'
import { TermoRegra } from '#/components/consulta-regra'
import { Pontos, SeletorPontos } from '#/components/ficha/marcadores'
import { PainelCard } from '#/components/painel-card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  adicionarPdnCoterie,
  apagarCoterie,
  buscarCoterie,
  cancelarConviteCoterie,
  convidarParaCoterie,
  editarCoterie,
  expulsarMembro,
  sairDaCoterie,
} from '#/server/coteries'

export const Route = createFileRoute('/coteries/$id')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    return { usuario: context.usuario }
  },
  loader: async ({ params }) => {
    try {
      return await buscarCoterie({ data: { id: params.id } })
    } catch {
      throw redirect({ to: '/' })
    }
  },
  component: DetalheCoterie,
})

function DetalheCoterie() {
  const { usuario } = Route.useRouteContext()
  const { coterie, membros, convitesPendentes, candidatosConvite, pdnsDisponiveis } =
    Route.useLoaderData()
  const router = useRouter()

  const ehNarrador = usuario.papel === 'narrador'

  // Estados de edição de dados básicos (Narrador)
  const [modalEditar, setModalEditar] = useState(false)
  const [nomeEditado, setNomeEditado] = useState(coterie.nome)
  const [conceitoEditado, setConceitoEditado] = useState(coterie.conceito ?? '')
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  // Estados de convite de personagem (Narrador)
  const [modalConvidar, setModalConvidar] = useState(false)
  const [personagemParaConvidar, setPersonagemParaConvidar] = useState<string>('')
  const [salvandoConvite, setSalvandoConvite] = useState(false)

  // Estados de adição de PdN (Narrador)
  const [modalAdicionarPdn, setModalAdicionarPdn] = useState(false)
  const [pdnParaAdicionar, setPdnParaAdicionar] = useState<string>('')
  const [salvandoPdn, setSalvandoPdn] = useState(false)

  // Estado de expulsão/saída
  const [membroParaExpulsar, setMembroParaExpulsar] = useState<{ id: string; nome: string } | null>(
    null,
  )
  const [membroParaSair, setMembroParaSair] = useState<{ id: string; nome: string } | null>(null)

  // Domínio rápido (Narrador)
  async function alterarDominio(campo: 'caca' | 'abrigo' | 'porte', valor: number) {
    try {
      await editarCoterie({
        data: {
          id: coterie.id,
          dados: {
            nome: coterie.nome,
            conceito: coterie.conceito,
            caca: campo === 'caca' ? valor : coterie.caca,
            abrigo: campo === 'abrigo' ? valor : coterie.abrigo,
            porte: campo === 'porte' ? valor : coterie.porte,
          },
        },
      })
      router.invalidate()
    } catch {
      toast.error('Erro ao atualizar o domínio.')
    }
  }

  async function handleSalvarEdicao(e: React.FormEvent) {
    e.preventDefault()
    if (!nomeEditado.trim()) return

    setSalvandoEdicao(true)
    try {
      await editarCoterie({
        data: {
          id: coterie.id,
          dados: {
            nome: nomeEditado.trim(),
            conceito: conceitoEditado.trim() || null,
            caca: coterie.caca,
            abrigo: coterie.abrigo,
            porte: coterie.porte,
          },
        },
      })
      toast.success('Coterie atualizada.')
      setModalEditar(false)
      router.invalidate()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao salvar.')
    } finally {
      setSalvandoEdicao(false)
    }
  }

  async function handleConvidar(e: React.FormEvent) {
    e.preventDefault()
    if (!personagemParaConvidar) return

    setSalvandoConvite(true)
    try {
      await convidarParaCoterie({
        data: { coterieId: coterie.id, personagemId: personagemParaConvidar },
      })
      toast.success('Convite de Coterie enviado.')
      setPersonagemParaConvidar('')
      setModalConvidar(false)
      router.invalidate()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao enviar convite.')
    } finally {
      setSalvandoConvite(false)
    }
  }

  async function handleAdicionarPdn(e: React.FormEvent) {
    e.preventDefault()
    if (!pdnParaAdicionar) return

    setSalvandoPdn(true)
    try {
      await adicionarPdnCoterie({
        data: { coterieId: coterie.id, personagemId: pdnParaAdicionar },
      })
      toast.success('PdN adicionado à Coterie.')
      setPdnParaAdicionar('')
      setModalAdicionarPdn(false)
      router.invalidate()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao adicionar PdN.')
    } finally {
      setSalvandoPdn(false)
    }
  }

  async function handleCancelarConvite(conviteId: string) {
    try {
      await cancelarConviteCoterie({ data: { conviteId } })
      toast.success('Convite cancelado.')
      router.invalidate()
    } catch {
      toast.error('Erro ao cancelar convite.')
    }
  }

  async function handleExpulsarMembro() {
    if (!membroParaExpulsar) return
    try {
      await expulsarMembro({
        data: { coterieId: coterie.id, personagemId: membroParaExpulsar.id },
      })
      toast.success(`${membroParaExpulsar.nome} foi expulso da Coterie.`)
      setMembroParaExpulsar(null)
      router.invalidate()
    } catch {
      toast.error('Erro ao expulsar membro.')
    }
  }

  async function handleSair() {
    if (!membroParaSair) return
    try {
      await sairDaCoterie({
        data: { coterieId: coterie.id, personagemId: membroParaSair.id },
      })
      toast.success(`Você saiu de ${coterie.nome}.`)
      setMembroParaSair(null)
      router.navigate({ to: '/coteries' })
    } catch {
      toast.error('Erro ao sair da Coterie.')
    }
  }

  async function handleApagarCoterie() {
    try {
      await apagarCoterie({ data: { id: coterie.id } })
      toast.success(`Coterie ${coterie.nome} apagada.`)
      router.navigate({ to: '/narrador/coteries' })
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao apagar Coterie.')
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0">
      <BarraApp />
      <div className="flex flex-col gap-6 pt-2 pb-12">
        {/* Cabeçalho da Coterie */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-display text-balance">{coterie.nome}</h1>
                {coterie.ehPadrao && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Coterie Padrão
                  </Badge>
                )}
              </div>
              {coterie.conceito && (
                <p className="mt-1 text-sm text-muted-foreground">{coterie.conceito}</p>
              )}
            </div>

            {ehNarrador && (
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setModalEditar(true)}>
                  Editar
                </Button>
                {!coterie.ehPadrao && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Apagar Coterie {coterie.nome}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          A Coterie será excluída permanentemente. Todos os membros serão removidos e notificados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleApagarCoterie}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Apagar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Domínio da Coterie: seção entre linhas finas, como as demais (DESIGN.md), sem cartão. */}
        <section className="flex flex-col gap-3 border-t pt-4">
          <h2 className="font-serif text-2xl">Domínio</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Caça */}
            <div className="flex flex-col gap-1">
              <TermoRegra tipo="dominio" id="caca" className="text-xs font-semibold uppercase text-muted-foreground">
                Caça (Chasse)
              </TermoRegra>
              {ehNarrador ? (
                <SeletorPontos
                  valor={coterie.caca}
                  max={5}
                  rotulo="Caça"
                  onChange={(v) => alterarDominio('caca', v)}
                />
              ) : (
                <Pontos valor={coterie.caca} max={5} rotulo="Caça" />
              )}
            </div>

            {/* Abrigo */}
            <div className="flex flex-col gap-1">
              <TermoRegra tipo="dominio" id="abrigo" className="text-xs font-semibold uppercase text-muted-foreground">
                Abrigo (Lien)
              </TermoRegra>
              {ehNarrador ? (
                <SeletorPontos
                  valor={coterie.abrigo}
                  max={5}
                  rotulo="Abrigo"
                  onChange={(v) => alterarDominio('abrigo', v)}
                />
              ) : (
                <Pontos valor={coterie.abrigo} max={5} rotulo="Abrigo" />
              )}
            </div>

            {/* Porte */}
            <div className="flex flex-col gap-1">
              <TermoRegra tipo="dominio" id="porte" className="text-xs font-semibold uppercase text-muted-foreground">
                Porte (Portillon)
              </TermoRegra>
              {ehNarrador ? (
                <SeletorPontos
                  valor={coterie.porte}
                  max={5}
                  rotulo="Porte"
                  onChange={(v) => alterarDominio('porte', v)}
                />
              ) : (
                <Pontos valor={coterie.porte} max={5} rotulo="Porte" />
              )}
            </div>
          </div>
        </section>

        <CatalogoDaCoterie
          key={coterie.atualizadoEm.toString()}
          id={coterie.id}
          inicial={{ tipo: coterie.tipo, vantagens: coterie.vantagens, defeitos: coterie.defeitos }}
          ehNarrador={ehNarrador}
        />

        {/* Membros */}
        <section className="flex flex-col gap-4 border-t pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-serif text-2xl">Membros</h2>
            {ehNarrador && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={candidatosConvite.length === 0}
                  onClick={() => setModalConvidar(true)}
                >
                  <UserPlus className="size-4" />
                  Convidar Personagem
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pdnsDisponiveis.length === 0}
                  onClick={() => setModalAdicionarPdn(true)}
                >
                  <Plus className="size-4" />
                  Adicionar PdN
                </Button>
              </div>
            )}
          </div>

          {membros.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum membro nesta Coterie ainda.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {membros.map((m) => (
                <div key={m.id} className="relative flex flex-col">
                  <PainelCard
                    item={{
                      id: m.id,
                      nome: m.nome,
                      jogador: m.jogador,
                      coteries: [],
                      ehMeu: m.ehMeu,
                      compartilhaCondicao: m.compartilhaCondicao,
                      condicao: m.condicao,
                    }}
                  />

                  {/* Ação de Expulsar (Narrador) ou Sair (Jogador dono) */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    {ehNarrador ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setMembroParaExpulsar({ id: m.id, nome: m.nome })
                        }}
                      >
                        Expulsar
                      </Button>
                    ) : m.ehMeu ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setMembroParaSair({ id: m.id, nome: m.nome })
                        }}
                      >
                        Sair
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Convites pendentes (Narrador) */}
        {ehNarrador && convitesPendentes.length > 0 && (
          <section className="flex flex-col gap-3 border-t pt-4">
            <h2 className="font-serif text-2xl">Convites pendentes</h2>
            <div className="divide-y border-y">
              {convitesPendentes.map((cp) => (
                <div key={cp.id} className="flex min-h-12 items-center justify-between py-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{cp.nomePersonagem}</span>
                    <span className="text-xs text-muted-foreground">{cp.nomeJogador}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => handleCancelarConvite(cp.id)}
                  >
                    Cancelar
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Dialog Editar Coterie (Narrador) */}
      <Dialog open={modalEditar} onOpenChange={setModalEditar}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSalvarEdicao} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Editar Coterie</DialogTitle>
              <DialogDescription>Altere as informações gerais da Coterie.</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor="nome-editar">Nome</Label>
              <Input
                id="nome-editar"
                value={nomeEditado}
                onChange={(e) => setNomeEditado(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="conceito-editar">Conceito ou território (opcional)</Label>
              <Input
                id="conceito-editar"
                value={conceitoEditado}
                onChange={(e) => setConceitoEditado(e.target.value)}
              />
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setModalEditar(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvandoEdicao || !nomeEditado.trim()}>
                {salvandoEdicao ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Convidar Personagem (Narrador) */}
      <Dialog open={modalConvidar} onOpenChange={setModalConvidar}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleConvidar} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Convidar Personagem</DialogTitle>
              <DialogDescription>
                Envie uma proposta de entrada para um Personagem Ativo de um Jogador.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor="personagem-convite">Escolha o Personagem</Label>
              <Combobox
                id="personagem-convite"
                opcoes={candidatosConvite.map((c) => ({ valor: c.id, rotulo: `${c.nome} (${c.jogador})` }))}
                valor={personagemParaConvidar || null}
                onChange={setPersonagemParaConvidar}
                placeholder="Selecione um Personagem"
                busca="Buscar Personagem"
              />
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setModalConvidar(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvandoConvite || !personagemParaConvidar}>
                {salvandoConvite ? 'Enviando...' : 'Enviar Convite'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar PdN (Narrador) */}
      <Dialog open={modalAdicionarPdn} onOpenChange={setModalAdicionarPdn}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAdicionarPdn} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Adicionar PdN</DialogTitle>
              <DialogDescription>
                Adicione um PdN diretamente à Coterie sem necessidade de convite.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor="pdn-adicionar">Escolha o PdN</Label>
              <Combobox
                id="pdn-adicionar"
                opcoes={pdnsDisponiveis.map((p) => ({ valor: p.id, rotulo: p.nome }))}
                valor={pdnParaAdicionar || null}
                onChange={setPdnParaAdicionar}
                placeholder="Selecione um PdN"
                busca="Buscar PdN"
              />
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setModalAdicionarPdn(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvandoPdn || !pdnParaAdicionar}>
                {salvandoPdn ? 'Adicionando...' : 'Adicionar PdN'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Expulsar Membro (Narrador) */}
      <AlertDialog
        open={membroParaExpulsar !== null}
        onOpenChange={(aberto) => !aberto && setMembroParaExpulsar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Expulsar {membroParaExpulsar?.nome}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O Personagem será removido desta Coterie e seu Jogador será notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExpulsarMembro}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Expulsar Membro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog Sair da Coterie (Jogador) */}
      <AlertDialog
        open={membroParaSair !== null}
        onOpenChange={(aberto) => !aberto && setMembroParaSair(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Sair de {coterie.nome}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {membroParaSair?.nome} deixará de fazer parte desta Coterie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSair}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sair da Coterie
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

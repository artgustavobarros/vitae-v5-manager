import * as ts from 'typescript'

export type SugestaoFonte = { itemId: string; sugestaoNome: string | null; sugestaoDescricao: string | null }

type Edicao = { inicio: number; fim: number; texto: string }

function nomePropriedade(propriedade: ts.ObjectLiteralElementLike): string | null {
  if (!ts.isPropertyAssignment(propriedade)) return null
  return ts.isIdentifier(propriedade.name) || ts.isStringLiteral(propriedade.name) ? propriedade.name.text : null
}

/** null significa que o id está em outro arquivo. */
export function aplicarSugestaoNaFonte(fonte: string, sugestao: SugestaoFonte): string | null {
  const consulta = /^consulta-(atributo|habilidade|cla|disciplina|dominio|termo)-(.+)$/.exec(sugestao.itemId)
  const id = consulta ? consulta[2] : sugestao.itemId
  const campoNome = consulta ? 'titulo' : 'nome'
  const arquivo = ts.createSourceFile('catalogo.ts', fonte, ts.ScriptTarget.Latest, true)
  const encontrados: ts.ObjectLiteralExpression[] = []

  function visitar(node: ts.Node) {
    if (ts.isObjectLiteralExpression(node)) {
      const propriedadeId = node.properties.find((p) => nomePropriedade(p) === 'id')
      if (
        propriedadeId &&
        ts.isPropertyAssignment(propriedadeId) &&
        ts.isStringLiteral(propriedadeId.initializer) &&
        propriedadeId.initializer.text === id
      ) encontrados.push(node)
    }
    ts.forEachChild(node, visitar)
  }
  visitar(arquivo)
  if (encontrados.length === 0) return null
  if (encontrados.length > 1) throw new Error(`Id ambíguo: ${sugestao.itemId}`)

  const item = encontrados[0]
  const edicoes: Edicao[] = []
  const atualizar = (campo: string, valor: string) => {
    const propriedade = item.properties.find((p) => nomePropriedade(p) === campo)
    if (!propriedade || !ts.isPropertyAssignment(propriedade)) {
      throw new Error(`Campo ${campo} ausente: ${sugestao.itemId}`)
    }
    edicoes.push({ inicio: propriedade.initializer.getStart(arquivo), fim: propriedade.initializer.getEnd(), texto: valor })
  }

  if (sugestao.sugestaoNome !== null) atualizar(campoNome, JSON.stringify(sugestao.sugestaoNome))
  if (sugestao.sugestaoDescricao !== null) atualizar('descricao', JSON.stringify(sugestao.sugestaoDescricao))

  const confianca = item.properties.find((p) => nomePropriedade(p) === 'confianca')
  if (confianca) {
    atualizar('confianca', "'certo'")
  } else {
    const fim = item.getEnd() - 1
    const trecho = fonte.slice(item.properties.at(-1)?.getEnd() ?? item.getStart(), fim)
    const virgula = trecho.includes(',') ? '' : ','
    const inicioLinha = fonte.lastIndexOf('\n', fim - 1) + 1
    const indentacao = /^\s*/.exec(fonte.slice(inicioLinha, fim))?.[0] ?? ''
    edicoes.push({ inicio: fim, fim, texto: `${virgula}\n${indentacao}  confianca: 'certo',\n${indentacao}` })
  }

  return edicoes
    .sort((a, b) => b.inicio - a.inicio)
    .reduce((texto, edicao) => texto.slice(0, edicao.inicio) + edicao.texto + texto.slice(edicao.fim), fonte)
}

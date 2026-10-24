import { cn } from 'cn'
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
} from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'

import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'

/**
 * Editor de texto rico baseado em Markdown puro para histórias e biografias de personagens.
 * Focado em texto formatado estruturado (negrito, itálico, títulos, listas, citações), sem suporte a imagens.
 */
export function EditorRichText({
  id,
  value,
  onChange,
  placeholder = 'Escreva a história do personagem (suporta Markdown: negrito, itálico, listas, títulos)...',
  className,
  rows = 6,
}: {
  id?: string
  value: string
  onChange: (valor: string) => void
  placeholder?: string
  className?: string
  rows?: number
}) {
  const [aba, setAba] = useState<'editar' | 'visualizar'>('editar')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function aplicarFormatacao(prefixo: string, sufixo: string = prefixo, padrao = 'texto') {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selecionado = value.substring(start, end)
    const textoInserido = selecionado || padrao

    const novoValor =
      value.substring(0, start) + prefixo + textoInserido + sufixo + value.substring(end)
    onChange(novoValor)

    requestAnimationFrame(() => {
      textarea.focus()
      const novoStart = start + prefixo.length
      const novoEnd = novoStart + textoInserido.length
      textarea.setSelectionRange(novoStart, novoEnd)
    })
  }

  function aplicarPrefixoLinha(prefixo: string) {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    const inicioLinha = value.lastIndexOf('\n', start - 1) + 1
    const novoValor =
      value.substring(0, inicioLinha) + prefixo + ' ' + value.substring(inicioLinha)
    onChange(novoValor)

    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefixo.length + 1, end + prefixo.length + 1)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault()
        aplicarFormatacao('**', '**', 'negrito')
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault()
        aplicarFormatacao('*', '*', 'itálico')
      }
    }
  }

  return (
    <div className={cn('flex flex-col rounded-md border bg-background overflow-hidden', className)}>
      {/* Barra de Ferramentas */}
      <div className="flex flex-wrap items-center justify-between border-b bg-muted/30 px-2 py-1 gap-1">
        <div className="flex flex-wrap items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => aplicarFormatacao('**', '**', 'negrito')}
            className="h-7 w-7 p-0"
            title="Negrito (Ctrl+B)"
            aria-label="Negrito"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => aplicarFormatacao('*', '*', 'itálico')}
            className="h-7 w-7 p-0"
            title="Itálico (Ctrl+I)"
            aria-label="Itálico"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => aplicarFormatacao('~~', '~~', 'tachado')}
            className="h-7 w-7 p-0"
            title="Tachado"
            aria-label="Tachado"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </Button>
          <span className="mx-1 h-4 w-px bg-border/60" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => aplicarPrefixoLinha('##')}
            className="h-7 w-7 p-0 font-semibold"
            title="Título de Seção"
            aria-label="Título"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => aplicarPrefixoLinha('###')}
            className="h-7 w-7 p-0 font-semibold"
            title="Subtítulo"
            aria-label="Subtítulo"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </Button>
          <span className="mx-1 h-4 w-px bg-border/60" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => aplicarPrefixoLinha('-')}
            className="h-7 w-7 p-0"
            title="Lista com marcadores"
            aria-label="Lista com marcadores"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => aplicarPrefixoLinha('1.')}
            className="h-7 w-7 p-0"
            title="Lista numerada"
            aria-label="Lista numerada"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => aplicarPrefixoLinha('>')}
            className="h-7 w-7 p-0"
            title="Citação"
            aria-label="Citação"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => aplicarFormatacao('\n---\n', '', '')}
            className="h-7 w-7 p-0"
            title="Linha divisória"
            aria-label="Divisória"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Abas Escrever / Visualizar */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={aba === 'editar' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setAba('editar')}
            className="h-7 text-xs px-2.5"
          >
            Escrever
          </Button>
          <Button
            type="button"
            variant={aba === 'visualizar' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setAba('visualizar')}
            className="h-7 text-xs px-2.5"
          >
            Visualizar
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      {aba === 'editar' ? (
        <Textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className="rounded-t-none border-0 shadow-none focus-visible:ring-0 font-sans text-sm resize-y"
        />
      ) : (
        <div className="min-h-[140px] p-3 text-sm text-foreground/90 leading-relaxed overflow-y-auto">
          {value.trim() ? (
            <VisualizadorMarkdown markdown={value} />
          ) : (
            <p className="text-muted-foreground italic text-xs">Nada escrito para pré-visualizar ainda.</p>
          )}
        </div>
      )}
    </div>
  )
}

/** Componente independente para renderizar texto em Markdown estilizado sem imagens. */
export function VisualizadorMarkdown({ markdown }: { markdown: string }) {
  const blocos = markdown.split(/\n\s*\n/)

  return (
    <div className="flex flex-col gap-3">
      {blocos.map((bloco, i) => {
        const linhaTrim = bloco.trim()
        if (!linhaTrim) return null

        if (linhaTrim === '---') {
          return <hr key={i} className="border-border/60 my-2" />
        }

        if (linhaTrim.startsWith('### ')) {
          return (
            <h4 key={i} className="font-semibold text-base text-foreground mt-1">
              <FormatadorTexto inline={linhaTrim.slice(4)} />
            </h4>
          )
        }

        if (linhaTrim.startsWith('## ')) {
          return (
            <h3 key={i} className="font-serif font-bold text-lg text-foreground mt-2 border-b border-border/40 pb-1">
              <FormatadorTexto inline={linhaTrim.slice(3)} />
            </h3>
          )
        }

        if (linhaTrim.startsWith('# ')) {
          return (
            <h2 key={i} className="font-serif font-bold text-xl text-foreground mt-2">
              <FormatadorTexto inline={linhaTrim.slice(2)} />
            </h2>
          )
        }

        if (linhaTrim.startsWith('> ')) {
          return (
            <blockquote key={i} className="border-l-2 border-vinho pl-3 italic text-muted-foreground my-1">
              <FormatadorTexto inline={linhaTrim.slice(2)} />
            </blockquote>
          )
        }

        // Lista com marcadores
        if (bloco.split('\n').every((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '))) {
          const itens = bloco.split('\n').filter((l) => l.trim().length > 0)
          return (
            <ul key={i} className="list-disc pl-5 flex flex-col gap-1">
              {itens.map((item, j) => (
                <li key={j}>
                  <FormatadorTexto inline={item.trim().replace(/^[-*]\s+/, '')} />
                </li>
              ))}
            </ul>
          )
        }

        // Lista numerada
        if (bloco.split('\n').every((l) => /^\d+\.\s+/.test(l.trim()))) {
          const itens = bloco.split('\n').filter((l) => l.trim().length > 0)
          return (
            <ol key={i} className="list-decimal pl-5 flex flex-col gap-1">
              {itens.map((item, j) => (
                <li key={j}>
                  <FormatadorTexto inline={item.trim().replace(/^\d+\.\s+/, '')} />
                </li>
              ))}
            </ol>
          )
        }

        return (
          <p key={i} className="leading-relaxed">
            <FormatadorTexto inline={bloco} />
          </p>
        )
      })}
    </div>
  )
}

function FormatadorTexto({ inline }: { inline: string }) {
  const linhas = inline.split('\n')

  return (
    <>
      {linhas.map((linha, lIdx) => (
        <span key={lIdx}>
          {lIdx > 0 && <br />}
          {renderizarInline(linha)}
        </span>
      ))}
    </>
  )
}

function renderizarInline(texto: string): ReactNode[] {
  const regex = /(\*\*.*?\*\*|\*.*?\*|~~.*?~~|`.*?`)/g
  const partes = texto.split(regex)

  return partes.map((parte, idx) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-foreground">
          {parte.slice(2, -2)}
        </strong>
      )
    }
    if (parte.startsWith('*') && parte.endsWith('*')) {
      return (
        <em key={idx} className="italic text-foreground">
          {parte.slice(1, -1)}
        </em>
      )
    }
    if (parte.startsWith('~~') && parte.endsWith('~~')) {
      return (
        <del key={idx} className="line-through text-muted-foreground">
          {parte.slice(2, -2)}
        </del>
      )
    }
    if (parte.startsWith('`') && parte.endsWith('`')) {
      return (
        <code key={idx} className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-vinho">
          {parte.slice(1, -1)}
        </code>
      )
    }
    return parte
  })
}

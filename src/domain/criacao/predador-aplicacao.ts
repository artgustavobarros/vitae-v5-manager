import type { TipoPredador } from '../catalogo/tipos'
import type { EscolhasPredador } from './tipos'

/**
 * Aplica os efeitos do Tipo de Predador à ficha ou aos dados de criação:
 * - Disciplina escolhida (+1 ponto) e poder opcional;
 * - Especialização escolhida (marcada com origem 'predador');
 * - Vantagens e Defeitos canônicos do predador e traços opcionais de `escolhasTracos`;
 * - Modificadores de Humanidade (+1 ou -1) e Potência do Sangue (+1).
 */
export function aplicarPredador<T extends Record<string, any>>(
  dadosFicha: T,
  predador: TipoPredador,
  escolhas: EscolhasPredador,
): T {
  const resultado: any = structuredClone(dadosFicha)

  // 1. Modificador de Humanidade
  if (predador.modificadorHumanidade !== undefined && typeof resultado.humanidade === 'number') {
    resultado.humanidade = Math.max(0, Math.min(10, resultado.humanidade + predador.modificadorHumanidade))
  }

  // 2. Modificador de Potência do Sangue
  if (predador.modificadorPotenciaSangue !== undefined && typeof resultado.potenciaSangue === 'number') {
    resultado.potenciaSangue = Math.max(0, Math.min(10, resultado.potenciaSangue + predador.modificadorPotenciaSangue))
  }

  // 3. Disciplina (+1 ponto)
  if (Array.isArray(resultado.disciplinas)) {
    const idx = resultado.disciplinas.findIndex(
      (d: any) => (d.id ?? d.disciplina) === escolhas.disciplina,
    )

    if (idx !== -1) {
      resultado.disciplinas[idx].nivel += 1
      if (escolhas.poder && Array.isArray(resultado.disciplinas[idx].poderes)) {
        if (!resultado.disciplinas[idx].poderes.includes(escolhas.poder)) {
          resultado.disciplinas[idx].poderes.push(escolhas.poder)
        }
      }
    } else {
      const usaKeyDisciplina =
        resultado.disciplinas.length > 0 && 'disciplina' in resultado.disciplinas[0]

      if (usaKeyDisciplina) {
        resultado.disciplinas.push({
          disciplina: escolhas.disciplina,
          nivel: 1,
        })
      } else {
        resultado.disciplinas.push({
          id: escolhas.disciplina,
          nivel: 1,
          poderes: escolhas.poder ? [escolhas.poder] : [],
        })
      }
    }
  }

  if (escolhas.poder && Array.isArray(resultado.poderes)) {
    if (!resultado.poderes.includes(escolhas.poder)) {
      resultado.poderes.push(escolhas.poder)
    }
  }

  // 4. Especialização
  if (Array.isArray(resultado.especializacoes)) {
    resultado.especializacoes.push({
      habilidade: escolhas.especializacao.habilidade,
      especializacao: escolhas.especializacao.especializacao,
      origem: 'predador',
    })
  }

  if (
    resultado.habilidades &&
    resultado.habilidades[escolhas.especializacao.habilidade]?.especializacoes &&
    Array.isArray(resultado.habilidades[escolhas.especializacao.habilidade].especializacoes)
  ) {
    resultado.habilidades[escolhas.especializacao.habilidade].especializacoes.push(
      escolhas.especializacao.especializacao,
    )
  }

  // 5. Vantagens e Defeitos
  const temArrayDefeitosSeparado = Array.isArray(resultado.defeitos)

  if (temArrayDefeitosSeparado && Array.isArray(resultado.vantagens)) {
    for (const v of predador.vantagens) {
      resultado.vantagens.push({
        id: v.id,
        nivel: v.nivel,
        nota: v.nota,
        origem: 'predador',
      })
    }

    for (const d of predador.defeitos) {
      resultado.defeitos.push({
        id: d.id,
        nivel: d.nivel,
        nota: d.nota,
        origem: 'predador',
      })
    }

    if (escolhas.tracoEscolhido) {
      const ehDefeito =
        escolhas.tracoEscolhido.tipo === 'defeito' ||
        escolhas.tracoEscolhido.id.startsWith('defeito-')

      const listaAlvo = ehDefeito ? resultado.defeitos : resultado.vantagens
      listaAlvo.push({
        id: escolhas.tracoEscolhido.id,
        nivel: escolhas.tracoEscolhido.nivel,
        nota: escolhas.tracoEscolhido.nota,
        origem: 'predador',
      })
    }
  } else if (Array.isArray(resultado.vantagens)) {
    for (const v of predador.vantagens) {
      resultado.vantagens.push({
        id: v.id,
        nivel: v.nivel,
        nota: v.nota,
        origem: 'predador',
      })
    }

    for (const d of predador.defeitos) {
      resultado.vantagens.push({
        id: d.id,
        nivel: d.nivel,
        nota: d.nota,
        origem: 'predador',
      })
    }

    if (escolhas.tracoEscolhido) {
      resultado.vantagens.push({
        id: escolhas.tracoEscolhido.id,
        nivel: escolhas.tracoEscolhido.nivel,
        nota: escolhas.tracoEscolhido.nota,
        origem: 'predador',
      })
    }
  }

  return resultado
}

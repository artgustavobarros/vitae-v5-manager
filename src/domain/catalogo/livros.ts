/**
 * Livros do V5 citados como fonte, pelo nome da edição em inglês.
 * Livro novo entra no fim da lista; nada sai depois de usado.
 */
export const LIVROS = [
  'Corebook',
  'Players Guide',
  'Companion',
  'Camarilla',
  'Anarch',
  'Chicago by Night',
  'Cults of the Blood Gods',
  'Sabbat: The Black Hand',
  'Gehenna War',
  'Fall of London',
  'Let the Streets Run Red',
  'Trails of Ash and Bone',
  'Forbidden Religions',
  'The Chicago Folios',
  'Blood Sigils',
  'Children of the Blood',
  'Blood Stained Love',
  'Live from the Succubus Club',
  'In Memoriam',
  'Tattered Façade',
  "Winter's Teeth",
  'Courts of the Damned',
  'Book of Nod Apocrypha',
  'Second Inquisition',
] as const

export type Livro = (typeof LIVROS)[number]

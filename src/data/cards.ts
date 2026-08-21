export type Rarity = 'basic' | 'baby' | 'fullart' | 'foil' | 'golden' | 'legendary' | 'space'

export interface CardVariant {
  id: string
  characterId: string
  name: string
  rarity: Rarity
  image: string
}

export interface RarityMeta {
  key: Rarity
  label: string
  color: string
  glow: string
}

export const RARITIES: RarityMeta[] = [
  { key: 'basic',     label: 'Basic',     color: '#94a3b8', glow: 'rgba(148,163,184,0.4)' },
  { key: 'baby',      label: 'Babies',    color: '#4ade80', glow: 'rgba(74,222,128,0.4)'  },
  { key: 'fullart',   label: 'Full Art',  color: '#60a5fa', glow: 'rgba(96,165,250,0.4)'  },
  { key: 'golden',    label: 'Golden',    color: '#facc15', glow: 'rgba(250,204,21,0.4)'  },
  { key: 'legendary', label: 'Legendary', color: '#c084fc', glow: 'rgba(192,132,252,0.5)' },
  { key: 'space',     label: 'Space',     color: '#a78bfa', glow: 'rgba(167,139,250,0.6)' },
]

const RARITY_SUFFIX: Record<Rarity, string> = {
  basic:     '1basic',
  baby:      '2baby',
  fullart:   '3fullart',
  foil:      '4foil',
  golden:    '5gold',
  legendary: '6legend',
  space:     '8space',
}

const RARITY_EXT: Record<Rarity, string> = {
  basic:     'webp',
  baby:      'webp',
  fullart:   'webp',
  foil:      'webp',
  golden:    'webp',
  legendary: 'webp',
  space:     'png',
}

const CHARACTERS: { id: string; name: string }[] = [
  { id: 'black-king',     name: 'Black King'     },
  { id: 'chessbeard',     name: 'Chessbeard'     },
  { id: 'crystal-queen',  name: 'Crystal Queen'  },
  { id: 'general-gambit', name: 'General Gambit' },
  { id: 'happy-pawn',     name: 'Happy Pawn'     },
  { id: 'kings-guard',    name: "King's Guard"   },
  { id: 'pirate-queen',   name: 'Pirate Queen'   },
  { id: 'puzzle-pete',    name: 'Puzzle Pete'    },
  { id: 'robin-rook',     name: 'Robin Rook'     },
  { id: 'unipop',         name: 'Unipop'         },
]

export const ALL_CARDS: CardVariant[] = CHARACTERS.flatMap(char =>
  RARITIES.map(rarity => ({
    id: `${char.id}_${RARITY_SUFFIX[rarity.key]}`,
    characterId: char.id,
    name: char.name,
    rarity: rarity.key,
    image: `/images/cards/${char.id}_${RARITY_SUFFIX[rarity.key]}.${RARITY_EXT[rarity.key]}`,
  }))
)

export function getCardsByRarity(rarity: Rarity): CardVariant[] {
  return ALL_CARDS.filter(c => c.rarity === rarity)
}

export function pickRandomCards(count: number): CardVariant[] {
  const shuffled = [...ALL_CARDS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

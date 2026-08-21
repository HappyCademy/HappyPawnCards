import type { PieceSymbol } from 'chess.js'

export interface CardPowerDef {
  pieceSymbol?: PieceSymbol
  unipopLPath?: boolean
  robinRookStay?: boolean
  puzzlePeteBounce?: boolean
  pirateQueenBounce?: boolean
  generalGambitRespawn?: boolean
  blackKingCapture?: boolean
  happyPawnPush?: boolean
  chessbeardSacrifice?: boolean
  crystalQueenImmune?: boolean
  implemented: boolean
  implementedLegendary?: boolean
  implementedSpace?: boolean
  legendaryUpgrade?: string  // characterId that replaces this card at legendary rarity
  powerLabel?: string
  powerDescription?: string
  spacePowerLabel?: string
  spacePowerDescription?: string
}

export const CARD_POWERS: Record<string, CardPowerDef> = {
  'happy-pawn': {
    pieceSymbol: 'p', happyPawnPush: true, implemented: true,
    powerLabel: '🫸 Push',
    powerDescription: 'When your pawn moves forward, it shoves every piece on that file ahead by one square. Any piece pushed off the board is eliminated — friend or foe!',
  },
  'unipop': {
    pieceSymbol: 'n', unipopLPath: true, implemented: true, implementedSpace: true,
    powerLabel: '🦄 L-Path',
    powerDescription: 'Your knight traces its L-move one step at a time: pick 3 directions to build the path. Every enemy piece it passes through is destroyed!',
    spacePowerLabel: '🦄 Double Jump',
    spacePowerDescription: "Your knight can leap twice in a single turn — make one L-move, then optionally jump again from the new landing square!",
  },
  'puzzle-pete': {
    pieceSymbol: 'b', puzzlePeteBounce: true, implemented: true,
    legendaryUpgrade: 'pirate-queen',
    powerLabel: '🔀 Bounce',
    powerDescription: 'Your bishop bounces off the edges of the board like a billiard ball, reaching squares a normal bishop never could!',
    spacePowerLabel: '🏴‍☠️ Stacking',
    spacePowerDescription: 'Your pieces can use the same square if you can balance them on top of each other. If the square is captured, all pieces on it get captured.',
  },
  'pirate-queen': {
    pieceSymbol: 'q', pirateQueenBounce: true, implemented: false, implementedLegendary: true,
    powerLabel: '🌊 Bouncing Queen',
    powerDescription: 'Your queen bounces off the edges of the board like a billiard ball, reaching squares no normal queen can access!',
  },
  'robin-rook': {
    pieceSymbol: 'r', robinRookStay: true, implemented: true,
    powerLabel: '🏹 Shoot',
    powerDescription: "Your rook can fire an arrow straight along its file or rank, capturing an enemy piece without moving. Shoot without giving up your position!",
    spacePowerLabel: '🏹 Cosmic Volley',
    spacePowerDescription: "Your rook can shoot in all 8 directions — rank, file, and diagonals. No enemy is out of range!",
  },
  'crystal-queen': {
    pieceSymbol: 'q', implemented: false, implementedSpace: true, crystalQueenImmune: true,
    powerLabel: '🔮 Coming Soon',
    powerDescription: "The Crystal Queen's standard power is still being forged. Check back soon!",
    spacePowerLabel: '🔮 Phantom Queen',
    spacePowerDescription: "The Crystal Queen cannot be captured — enemy pieces pass right through. But if she takes an enemy piece, she becomes vulnerable for one opponent turn!",
  },
  'black-king': {
    pieceSymbol: 'k', blackKingCapture: true, implemented: true,
    powerLabel: '👑 Royal Gambit',
    powerDescription: 'Your king can capture its own pieces to earn an immediate bonus move. Chain captures to race across the board in a single turn!',
  },
  'kings-guard': {
    pieceSymbol: 'p', implemented: false,
    powerLabel: '🛡 Coming Soon',
    powerDescription: "The King's Guard power is still being designed. Check back soon!",
  },
  'general-gambit': {
    generalGambitRespawn: true, implemented: true, implementedSpace: true,
    powerLabel: '♟ Respawn',
    powerDescription: 'Whenever one of your pawns is captured, it respawns on its starting square at the beginning of your next turn. Your army never stays down for long!',
    spacePowerLabel: '⭐ Admiral Respawn',
    spacePowerDescription: 'Same as General Gambit — any captured pawn respawns on its starting square next turn. Now commanded by the Admiral himself!',
  },
  'chessbeard': {
    chessbeardSacrifice: true, implemented: true, implementedSpace: true,
    powerLabel: '⚔ Sacrifice',
    powerDescription: 'Once per turn, you can sacrifice one of your own pieces to destroy any lower-value enemy piece anywhere on the board. A bold trade — use it wisely!',
    spacePowerLabel: '⚔ Cosmic Sacrifice',
    spacePowerDescription: "Sacrifice any of your pieces to destroy ANY enemy piece on the board, regardless of value!",
  },
}

// Baby piece sprites: keyed by characterId, applied when baby rarity card is in hand
export const BABY_PIECE_IMAGES: Partial<Record<string, string>> = {
  'black-king':     '/images/pieces/babies/black-king.webp',
  'chessbeard':     '/images/pieces/babies/chessbeard.webp',
  'crystal-queen':  '/images/pieces/babies/crystal-queen.webp',
  'general-gambit': '/images/pieces/babies/general-gambit.webp',
  'happy-pawn':     '/images/pieces/babies/happy-pawn.webp',
  'kings-guard':    '/images/pieces/babies/kings-guard.webp',
  'puzzle-pete':    '/images/pieces/babies/puzzle-pete.webp',
  'robin-rook':     '/images/pieces/babies/robin-rook.webp',
  'unipop':         '/images/pieces/babies/unipop.webp',
}

export const UNIPOP_PIECE_IMAGE: Partial<Record<string, string>> = {
  basic:     '/images/pieces/unipop-main.png',
  baby:      '/images/pieces/unipop-baby.png',
  fullart:   '/images/pieces/unipop-main.png',
  foil:      '/images/pieces/unipop-main.png',
  golden:    '/images/pieces/unipop-main.png',
  legendary: '/images/pieces/unipop-main.png',
  space:     '/images/pieces/unipop-space.png',
}

export const ROBIN_ROOK_PIECE_IMAGE: Partial<Record<string, string>> = {
  basic:     '/images/pieces/robin-rook.png',
  baby:      '/images/pieces/robin-rook.png',
  fullart:   '/images/pieces/robin-rook.png',
  foil:      '/images/pieces/robin-rook.png',
  golden:    '/images/pieces/robin-rook.png',
  legendary: '/images/pieces/robin-rook.png',
  space:     '/images/pieces/robin-rook.png',
}

export const PUZZLE_PETE_PIECE_IMAGE: Partial<Record<string, string>> = {
  basic:     '/images/pieces/puzzle-pete-main.webp',
  baby:      '/images/pieces/puzzle-pete-baby.webp',
  fullart:   '/images/pieces/puzzle-pete-main.webp',
  foil:      '/images/pieces/puzzle-pete-main.webp',
  golden:    '/images/pieces/puzzle-pete-main.webp',
  legendary: '/images/pieces/puzzle-pete-main.webp',
  space:     '/images/pieces/puzzle-pete-main.webp',
}

export const GENERAL_GAMBIT_PIECE_IMAGE = '/images/pieces/general-gambit.png'
export const GENERAL_GAMBIT_SPACE_PIECE_IMAGE = '/images/pieces/general-gambit-space.png'
export const BLACK_KING_PIECE_IMAGE = '/images/pieces/black-king.webp'
export const CRYSTAL_QUEEN_PIECE_IMAGE = '/images/pieces/crystal-queen.png'
export const PIRATE_QUEEN_PIECE_IMAGE = '/images/pieces/pirate-queen.png'
export const HAPPY_PAWN_PIECE_IMAGE = '/images/pieces/happy-pawn.webp'
export const KINGS_GUARD_PIECE_IMAGE = '/images/pieces/kings-guard.webp'

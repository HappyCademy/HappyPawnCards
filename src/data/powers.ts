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
  crystalQueenSwap?: boolean
  kingsGuardBlock?: boolean
  crystalQueenImmune?: boolean
  implemented: boolean
  implementedLegendary?: boolean
  implementedSpace?: boolean
  legendaryUpgrade?: string  // characterId that replaces this card at legendary rarity
  powerLabel?: string
  powerDescription?: string
  legendaryPowerLabel?: string
  legendaryPowerDescription?: string
  spacePowerLabel?: string
  spacePowerDescription?: string
}

export const CARD_POWERS: Record<string, CardPowerDef> = {
  'happy-pawn': {
    pieceSymbol: 'p', happyPawnPush: true, implemented: true, implementedLegendary: true, implementedSpace: true,
    powerLabel: '🫸 Push',
    powerDescription: 'When your pawn moves forward, it shoves every piece on that file ahead by one square. Any piece pushed off the board is eliminated — friend or foe!',
    legendaryPowerLabel: '♟ Early Promotion',
    legendaryPowerDescription: 'When a pawn reaches the 6th rank, promote it to any piece except the queen.',
    spacePowerLabel: '🚀 Reserve',
    spacePowerDescription: 'Instead of moving, you may place a pawn from off the board onto any empty square on the first 4 ranks.',
  },
  'unipop': {
    pieceSymbol: 'n', unipopLPath: true, implemented: true, implementedLegendary: true, implementedSpace: true,
    powerLabel: '🦄 L-Path',
    powerDescription: 'Your knight traces its L-move one step at a time: pick 3 directions to build the path. Every enemy piece it passes through is destroyed!',
    legendaryPowerLabel: '🌀 Phase Jump',
    legendaryPowerDescription: "Your knight wraps around the left and right edges of the board — move off one side and appear on the other! Up and down edges are still walls.",
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
    pieceSymbol: 'q', pirateQueenBounce: true, implemented: true, implementedLegendary: true,
    powerLabel: '🌊 Bouncing Queen',
    powerDescription: 'Your queen bounces off the edges of the board like a billiard ball, reaching squares no normal queen can access!',
  },
  'robin-rook': {
    pieceSymbol: 'r', robinRookStay: true, implemented: true,
    powerLabel: '🏹 Shoot',
    powerDescription: "Your rook can fire an arrow straight along its file or rank, capturing an enemy piece without moving. Shoot without giving up your position!",
    legendaryPowerLabel: '🦅 Coming Soon',
    legendaryPowerDescription: "Rookin Hood's legendary power is still being designed. Check back soon!",
    spacePowerLabel: '🏹 Cosmic Volley',
    spacePowerDescription: "Your rook can shoot in all 8 directions — rank, file, and diagonals. No enemy is out of range!",
  },
  'crystal-queen': {
    pieceSymbol: 'q', crystalQueenSwap: true, implemented: true, implementedSpace: true, crystalQueenImmune: true,
    powerLabel: '🔮 Royal Switch',
    powerDescription: "Instead of moving, your queen can swap places with any of your own knights, bishops, or rooks — instantly repositioning both pieces in one turn.",
    legendaryPowerLabel: '🗺 Coming Soon',
    legendaryPowerDescription: "The Crystal Queen's legendary power is still being designed. Check back soon!",
    spacePowerLabel: '🔮 Phantom Queen',
    spacePowerDescription: "The Crystal Queen cannot be captured — enemy pieces pass right through. But if she takes an enemy piece, she becomes vulnerable for one opponent turn!",
  },
  'black-king': {
    pieceSymbol: 'k', blackKingCapture: true, implemented: true,
    powerLabel: '👑 Royal Gambit',
    powerDescription: 'Your king can capture its own pieces to earn an immediate bonus move. Chain captures to race across the board in a single turn!',
    legendaryPowerLabel: '☠ Death Aura',
    legendaryPowerDescription: 'At the end of every move, the Black King automatically destroys all pieces on the 8 squares adjacent to him — friend or foe. Rule through fear!',
  },
  'kings-guard': {
    pieceSymbol: 'k', kingsGuardBlock: true, implemented: true,
    powerLabel: '🛡 Pawn Shield',
    powerDescription: "When your king is in check, any of your pawns can teleport to any square that blocks the check — friend rushes to protect the king!",
    legendaryPowerLabel: '🔥 Coming Soon',
    legendaryPowerDescription: "The King's Guard legendary power is still being designed. Check back soon!",
  },
  'general-gambit': {
    generalGambitRespawn: true, implemented: true, implementedSpace: true,
    powerLabel: '♟ Respawn',
    powerDescription: 'Whenever one of your pawns is captured, it respawns on its starting square at the beginning of your next turn. Your army never stays down for long!',
    legendaryPowerLabel: '🪔 Coming Soon',
    legendaryPowerDescription: "Admiral Gambit's legendary power is still being designed. Check back soon!",
    spacePowerLabel: '⭐ Admiral Respawn',
    spacePowerDescription: 'Same as General Gambit — any captured pawn respawns on its starting square next turn. Now commanded by the Admiral himself!',
  },
  'chessbeard': {
    chessbeardSacrifice: true, implemented: true, implementedSpace: true,
    powerLabel: '⚔ Sacrifice',
    powerDescription: 'Once per turn, you can sacrifice one of your own pieces to destroy any lower-value enemy piece anywhere on the board. A bold trade — use it wisely!',
    legendaryPowerLabel: '☯ Coming Soon',
    legendaryPowerDescription: "Chessbeard's legendary power is still being designed. Check back soon!",
    spacePowerLabel: '🔒 Freeze',
    spacePowerDescription: "Every move, choose a piece. Your opponent cannot move this piece next turn.",
  },
}

// Baby piece sprites: keyed by characterId, applied when baby rarity card is in hand
export const BABY_PIECE_IMAGES: Partial<Record<string, string>> = {
  // No baby-specific piece sprites yet — falls back to standard SVG pieces
}

export const UNIPOP_PIECE_IMAGE: Partial<Record<string, string>> = {
  basic:     '/images/characters/unipop/basic-piece.png',
  baby:      '/images/characters/unipop/baby-piece.png',
  fullart:   '/images/characters/unipop/fullart-piece.png',
  foil:      '/images/characters/unipop/basic-piece.png',
  golden:    '/images/characters/unipop/golden-piece.png',
  legendary: '/images/characters/unipop/legendary-piece.png',
  space:     '/images/characters/unipop/space-piece.png',
}

export const ROBIN_ROOK_PIECE_IMAGE: Partial<Record<string, string>> = {
  basic:     '/images/characters/robin-rook/basic-piece.png',
  baby:      '/images/characters/robin-rook/baby-piece.png',
  fullart:   '/images/characters/robin-rook/fullart-piece.png',
  foil:      '/images/characters/robin-rook/basic-piece.png',
  golden:    '/images/characters/robin-rook/golden-piece.png',
  legendary: '/images/characters/robin-rook/legendary-piece.png',
  space:     '/images/characters/robin-rook/space-piece.png',
}

export const PUZZLE_PETE_PIECE_IMAGE: Partial<Record<string, string>> = {
  basic:     '/images/characters/puzzle-pete/basic-piece.png',
  baby:      '/images/characters/puzzle-pete/baby-piece.png',
  fullart:   '/images/characters/puzzle-pete/fullart-piece.png',
  foil:      '/images/characters/puzzle-pete/basic-piece.png',
  golden:    '/images/characters/puzzle-pete/golden-piece.png',
  legendary: '/images/characters/puzzle-pete/golden-piece.png',  // no legendary-piece art
  space:     '/images/characters/puzzle-pete/space-piece.png',
}

export const CHESSBEARD_PIECE_IMAGE = '/images/characters/chessbeard/basic-piece.png'
export const GENERAL_GAMBIT_PIECE_IMAGE: Partial<Record<string, string>> = {
  basic:     '/images/characters/general-gambit/basic-piece.png',
  baby:      '/images/characters/general-gambit/baby-piece.png',
  fullart:   '/images/characters/general-gambit/fullart-piece.png',
  foil:      '/images/characters/general-gambit/basic-piece.png',
  golden:    '/images/characters/general-gambit/golden-piece.png',
  legendary: '/images/characters/general-gambit/legendary-piece.png',
  space:     '/images/characters/general-gambit/space-piece.png',
}
export const BLACK_KING_PIECE_IMAGE: Partial<Record<string, string>> = {
  basic:     '/images/characters/black-king/basic-piece.png',
  baby:      '/images/characters/black-king/baby-piece.png',
  fullart:   '/images/characters/black-king/fullart-piece.png',
  foil:      '/images/characters/black-king/basic-piece.png',
  golden:    '/images/characters/black-king/golden-piece.png',
  legendary: '/images/characters/black-king/golden-piece.png',  // no legendary-piece art
  space:     '/images/characters/black-king/space-piece.png',
}
export const CRYSTAL_QUEEN_PIECE_IMAGE: Partial<Record<string, string>> = {
  basic:     '/images/characters/crystal-queen/basic-piece.png',
  baby:      '/images/characters/crystal-queen/baby-piece.png',
  fullart:   '/images/characters/crystal-queen/fullart-piece.png',
  foil:      '/images/characters/crystal-queen/basic-piece.png',
  golden:    '/images/characters/crystal-queen/golden-piece.png',
  legendary: '/images/characters/crystal-queen/legendary-piece.png',
  space:     '/images/characters/crystal-queen/space-piece.png',
}
export const PIRATE_QUEEN_PIECE_IMAGE = ''
export const HAPPY_PAWN_PIECE_IMAGE: Partial<Record<string, string>> = {
  basic:     '/images/characters/happy-pawn/basic-piece.png',
  baby:      '/images/characters/happy-pawn/baby-piece.png',
  fullart:   '/images/characters/happy-pawn/fullart-piece.png',
  foil:      '/images/characters/happy-pawn/basic-piece.png',
  golden:    '/images/characters/happy-pawn/golden-piece.png',
  legendary: '/images/characters/happy-pawn/legendary-piece.png',
  space:     '/images/characters/happy-pawn/space-piece.png',
}
export const KINGS_GUARD_PIECE_IMAGE: Partial<Record<string, string>> = {
  basic:     '/images/characters/kings-guard/basic-piece.png',
  baby:      '/images/characters/kings-guard/baby-piece.png',
  fullart:   '/images/characters/kings-guard/fullart-piece.png',
  foil:      '/images/characters/kings-guard/basic-piece.png',
  golden:    '/images/characters/kings-guard/golden-piece.png',
  legendary: '/images/characters/kings-guard/legendary-piece.png',
  space:     '/images/characters/kings-guard/space-piece.png',
}

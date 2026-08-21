import { createContext, useContext, useState } from 'react'
import type { PieceSymbol, Color } from 'chess.js'

export interface PieceSetMeta {
  key: string
  label: string
}

export const PIECE_SETS: PieceSetMeta[] = [
  { key: 'cburnett',  label: 'Classic'     },
  { key: 'merida',    label: 'Merida'      },
  { key: 'alpha',     label: 'Alpha'       },
  { key: 'maestro',   label: 'Maestro'     },
  { key: 'california',label: 'California'  },
  { key: 'cardinal',  label: 'Cardinal'    },
  { key: 'staunty',   label: 'Staunty'     },
  { key: 'tatiana',   label: 'Tatiana'     },
  { key: 'pirouetti', label: 'Pirouetti'   },
  { key: 'anarcandy', label: 'Anarcandy'   },
  { key: 'pixel',     label: 'Pixel'       },
  { key: 'horsey',    label: 'Horsey'      },
]

const PIECE_LETTER: Record<PieceSymbol, string> = {
  k: 'K', q: 'Q', r: 'R', b: 'B', n: 'N', p: 'P',
}

export function pieceUrl(set: string, color: Color, type: PieceSymbol): string {
  return `https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/${set}/${color}${PIECE_LETTER[type]}.svg`
}

interface PieceSetContextValue {
  pieceSet: string
  setPieceSet: (key: string) => void
}

const PieceSetContext = createContext<PieceSetContextValue>({
  pieceSet: 'cburnett',
  setPieceSet: () => {},
})

export function PieceSetProvider({ children }: { children: React.ReactNode }) {
  const [pieceSet, setPieceSetState] = useState<string>(
    () => localStorage.getItem('pieceSet') ?? 'cburnett'
  )

  function setPieceSet(key: string) {
    setPieceSetState(key)
    localStorage.setItem('pieceSet', key)
  }

  return (
    <PieceSetContext.Provider value={{ pieceSet, setPieceSet }}>
      {children}
    </PieceSetContext.Provider>
  )
}

export function usePieceSet() {
  return useContext(PieceSetContext)
}

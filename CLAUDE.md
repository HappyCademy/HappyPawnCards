# Happy Pawn Cards — Claude Code Guide

## Project overview

A digital chess card game where players pick 2 character cards before the match, each granting unique powers that bend chess rules. Currently supports VS Computer (minimax AI) and VS Player (pass-and-play). The long-term goal is a full online multiplayer product with accounts, ratings, a queue system, and rich social features.

## Tech stack

- **Vite + React 18 + TypeScript** (strict)
- **Tailwind CSS v4** — import style: `@import "tailwindcss"` (no config file)
- **chess.js v1.4.0** — IMPORTANT: constructor throws if a king is missing from FEN. Always use `new Chess(fen, { skipValidation: true })` when constructing from a custom FEN that may lack a king (e.g. after king capture).
- **Deployed to Vercel** via `npx vercel --prod`

## Architecture

### Game flow (App.tsx)

```
'mode' screen → ModeSelectionScreen
  ↓ vsComputer: 'p1-selection' → CardSelectionScreen (player picks 2)
  ↓ vsPlayer:   'p1-selection' → 'p2-selection' → CardSelectionScreen × 2
  ↓ 'game' screen
```

### Game hook (src/hooks/useChessGame.ts)

Central state machine. Returns `GameState & GameActions`. Key logic:
- `chessRef`: mutable ref to the `Chess` instance; updated directly, then `bump()` triggers a re-render
- `currentCards`: in vsPlayer, follows whose turn it is; in vsComputer, always the human player's cards
- `withRespawns(before, after)`: wraps every move to apply General Gambit pawn respawning
- `clearSelection()`: resets all selection/mode state (selected square, valid targets, all special mode flags)
- Special move modes handled via dedicated state flags: `unipopState`, `isRookShootMode`, `rookChoiceSquare`, `blackKingBonusSquare`, `isChessbeardSelectMode`, `chessbeardSacrificeSquare`
- Win condition: `isKingOnBoard()` — king absence = victory, not checkmate
- AI moves via `getBestMove(fen, depth=3)` in a `useEffect` on `tick`

### Engine files (src/engine/)

Each power has its own file with three functions: `get<X>Targets`, `apply<X>Move`, and helpers.

| File | Power |
|------|-------|
| `pseudolegal.ts` | Base pseudo-legal moves (ignores check) + `isKingOnBoard` |
| `minimax.ts` | AI — minimax with alpha-beta |
| `unipop.ts` | Knight L-path (step-by-step, destroys pieces in path) |
| `robinrook.ts` | Rook shoot-in-place |
| `puzzlepete.ts` | Bishop bounces off board edges |
| `blackking.ts` | King captures friendly pieces + bonus move |
| `happypawn.ts` | Pawn pushes all pieces on file forward; off-board = dead |
| `chessbeard.ts` | Sacrifice own piece to destroy lower-value enemy |

### Card system (src/data/)

- `cards.ts` — `CardVariant` type, `RARITIES` list, `getCardsByRarity()`, `pickRandomCards()`
- `powers.ts` — `CARD_POWERS` map (`characterId → CardPowerDef`), piece image exports

## Card powers

| Character | Piece | Power flag | Status |
|-----------|-------|-----------|--------|
| Happy Pawn | Pawn | `happyPawnPush` | ✅ |
| Unipop | Knight | `unipopLPath` | ✅ |
| Puzzle Pete | Bishop | `puzzlePeteBounce` | ✅ |
| Robin Rook | Rook | `robinRookStay` | ✅ |
| Crystal Queen | Queen | — | ❌ not designed yet |
| Black King | King | `blackKingCapture` | ✅ |
| King's Guard | King | — | ❌ not designed yet |
| General Gambit | (any) | `generalGambitRespawn` | ✅ |
| Chessbeard | (any) | `chessbeardSacrifice` | ✅ |

**Same-piece restriction**: two cards sharing the same `pieceSymbol` cannot be picked together (enforced in `CardSelectionScreen`).

## Key constraints & gotchas

- **`skipValidation: true`** is required whenever constructing a `Chess` from a FEN that might be missing a king. This applies to ALL engine files. Without it, chess.js v1 throws.
- **No check-based win**: the game uses king capture as the win condition. `isCheck()` still works for UI hints, but checkmate/stalemate are irrelevant.
- **AI (vsComputer) only plays Black**. The AI effect is gated by `chess.turn() === 'b'`.
- **vsPlayer mode**: `currentCards` switches to each player's cards based on `chess.turn()`. `playerCards` = White's cards, `aiCards` = Black's cards (despite the name).
- **General Gambit**: wraps ALL moves via `withRespawns()`, except Chessbeard sacrifice.
- **FEN manipulation**: all custom moves directly edit FEN strings. Pattern: split on `' '`, edit position part, join back. FEN row index = `7 - rank`.

## Roadmap

### Frontend-only (no backend needed)
- [ ] **Timer**: 1 min per move, standard — in progress / done
- [ ] **Missing powers**: Crystal Queen and King's Guard (need power designs)
- [ ] **Sounds**: move, capture, win/lose, card power sounds
- [ ] **Better piece styles**: offer different visual styles for standard chess pieces
- [ ] **App icon**: custom chess-themed favicon

### Requires backend / infra
- [ ] **Online multiplayer**: real-time play via WebSockets (Vercel supports WebSockets on Fluid Compute)
- [ ] **Queue system**: matchmaking queue with live player count displayed
- [ ] **Account system**: sign up / login
- [ ] **Ratings & league**: ELO-style rating, seasonal leagues
- [ ] **Profile**: avatar, username, stats overview
- [ ] **Friends**: add/remove, see online status
- [ ] **Game history**: replay past games
- [ ] **Stats**: win rate, most-used cards, etc.
- [ ] **Invite via link**: generate a game link to challenge a specific person

### TCG progression system (big vision)
Core idea: new players start with 2 basic cards and unlock the full collection through play.

- [ ] **Campaign mode**: players face each character they don't own as an AI opponent; beating them offers that character's card as a reward — teaches the power before you can use it
- [ ] **Achievement-gated cards**: certain rarities (legendary, space) only unlock by hitting milestones — e.g. reach rating X, win N games, win with every character, etc.
- [ ] **In-game currency**: earned by playing games (win/lose/ranked bonuses); used to buy booster packs
- [ ] **Booster packs**: random card drops with rarity weighting; classic TCG pull feel
- [ ] **Collection screen**: view all cards owned vs. locked, with unlock hints for locked ones

### Design / polish
- [ ] **Drag and drop**: drag pieces to move them instead of click-click — needs careful integration with the multi-step power modes (Unipop L-path, Robin Rook choice, Chessbeard select) where drag alone can't express the full interaction, so click-click must remain as a fallback
- [ ] **Improve overall design**: more character, more of the card art used throughout the UI
- [ ] **Animations**: piece movement, power activation, card-play effects
- [ ] **App icon**: replace Vite default with Happy Pawn branding

## File structure (key files)

```
src/
  App.tsx                        # Screen routing, card zoom modal, CardStrip
  hooks/
    useChessGame.ts              # All game state & actions
  engine/
    pseudolegal.ts               # Base moves + king detection
    minimax.ts                   # AI
    unipop.ts / robinrook.ts / puzzlepete.ts
    blackking.ts / happypawn.ts / chessbeard.ts
  components/
    Board/
      Board.tsx                  # Square grid + overlays + piece image map
      Square.tsx                 # Single square with all highlight variants
      Piece.tsx                  # Renders piece image (cardImage or standard SVG)
      RookChoiceMenu.tsx         # Move vs Shoot popup
      animations/FireTrail.tsx, ArrowShot.tsx
    GameInfo/
      GameInfo.tsx               # Status, timer, player badges, action buttons
      MoveHistory.tsx
    CardSelection/
      CardSelectionScreen.tsx    # Rarity tabs, card grid, pick slots
      CardTile.tsx               # Individual card with selection/conflict/coming-soon states
    ModeSelection/
      ModeSelectionScreen.tsx    # VS Computer / VS Player / Online (coming soon)
  data/
    cards.ts                     # Card variants, rarities
    powers.ts                    # CardPowerDef, CARD_POWERS, piece image constants
public/
  images/
    cards/                       # Card artwork (named by characterId + rarity)
    pieces/                      # Custom piece images (unipop, robin-rook, etc.)
```

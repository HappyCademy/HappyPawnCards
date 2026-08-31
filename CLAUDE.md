# Happy Pawn Cards — Claude Code Guide

## Project overview

A digital chess card game where players pick 2 character cards before the match, each granting unique powers that bend chess rules. Currently supports VS Computer (minimax AI) and VS Player (pass-and-play). The long-term goal is a full online multiplayer product with accounts, ratings, a queue system, and rich social features.

This game is part of the **HappyCademy** ecosystem (a children's chess/STEM academy in Bangkok). The integration plan (see below) connects HappyPawnCards to the existing HappyCademy account and token system.

## Tech stack

- **Vite + React 18 + TypeScript** (strict)
- **Tailwind CSS v4** — import style: `@import "tailwindcss"` (no config file)
- **chess.js v1.4.0** — IMPORTANT: constructor throws if a king is missing from FEN. Always use `new Chess(fen, { skipValidation: true })` when constructing from a custom FEN that may lack a king (e.g. after king capture).
- **Firebase SDK v12** — already installed and wired. `src/lib/firebase.ts` initialises the app (dev vs prod auto-detected via `import.meta.env.PROD`). Auth only for now; Firestore not yet used in-game.
- **Deployed to Vercel** via `npx vercel --prod`. Staying on Vercel (not moving to Firebase Hosting — no meaningful gain for a pure Vite SPA).

## Authentication — already implemented

Firebase Auth is live. Key files:
- `src/lib/firebase.ts` — initialises Firebase (dev: `happy-app-dev-f90a0`, prod: `happy-app-prod-e2636`) — same Firebase projects as the Flutter app and Cloud Run backend
- `src/hooks/useAuth.ts` — `onAuthStateChanged`, `signIn(email, password)`, `signOut()`
- `src/components/Auth/SignInScreen.tsx` — complete sign-in UI, email/password, friendly error messages
- `App.tsx` — gates certain modes behind login, passes `auth.user` / `userEmail` / `onSignOut` down to screens

Students log in with their existing HappyCademy account. No new account system needed.

## Architecture

### Game flow (App.tsx)

```
'mode' screen → ModeSelectionScreen
  ↓ vsComputer: 'p1-selection' → CardSelectionScreen (player picks 2)
  ↓ vsPlayer:   'p1-selection' → 'p2-selection' → CardSelectionScreen × 2
  ↓ 'game' screen
```

Campaign flow also exists — see Campaign section below.

### Game hook (src/hooks/useChessGame.ts)

Central state machine. Returns `GameState & GameActions`. Key logic:
- `chessRef`: mutable ref to the `Chess` instance; updated directly, then `bump()` triggers a re-render
- `currentCards`: in vsPlayer, follows whose turn it is; in vsComputer, always the human player's cards
- `withRespawns(before, after)`: wraps every move to apply General Gambit pawn respawning
- `clearSelection()`: resets all selection/mode state (selected square, valid targets, all special mode flags)
- Special move modes handled via dedicated state flags: `unipopState`, `isRookShootMode`, `rookChoiceSquare`, `blackKingBonusSquare`, `isChessbeardSelectMode`, `chessbeardSacrificeSquare`
- Win condition: `isKingOnBoard()` — king absence = victory, not checkmate. **Stalemate = loss for the stalemated player** (not draw).
- AI moves via `getBestMove(fen, depth=1)` in a `useEffect` on `tick`
- **Move history**: maintained in `moveHistoryRef` (separate from `chess.history()` which is always empty due to FEN-based moves). Format: `e2-e4` / `Nf3xe5`. Recorded in `completeTurn()` and in the AI effect. Undo restores history count via `fenHistoryRef` snapshot (now stores `{ fen, moveCount }` instead of just `fen`).

### Board interaction (src/components/Board/Board.tsx)

All clicks go through `handleBoardPointerDown` on the board div — **Square.tsx has no `onClick`**. This prevents the double-call bug (pointer events + click events both firing `onSquareClick`, causing state to undo itself). `e.preventDefault()` is called for ALL board clicks (before the piece check) to suppress the synthetic `click` event.

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

Each character has **3 powers** tied to card variant rarity:
- **Base power** — regular, baby, full-art, foil, golden
- **Legendary power** — legendary and secret legendary variants
- **Space power** — space variant (newly released)

That's 9 characters × 3 powers = **27 powers total**.

| Character | Piece | Base power (flag) | Legendary power | Space power |
|-----------|-------|-------------------|-----------------|-------------|
| Happy Pawn | Pawn | `happyPawnPush` ✅ | ❌ not designed | ❌ not designed |
| Unipop | Knight | `unipopLPath` ✅ | ❌ not designed | ❌ not designed |
| Puzzle Pete | Bishop | `puzzlePeteBounce` ✅ | ❌ not designed | ❌ not designed |
| Robin Rook | Rook | `robinRookStay` ✅ | ❌ not designed | ❌ not designed |
| Crystal Queen | Queen | ❌ not designed | ❌ not designed | ❌ not designed |
| Black King | King | `blackKingCapture` ✅ | ❌ not designed | ❌ not designed |
| King's Guard | King | ❌ not designed | ❌ not designed | ❌ not designed |
| General Gambit | (any) | `generalGambitRespawn` ✅ | ❌ not designed | ❌ not designed |
| Chessbeard | (any) | `chessbeardSacrifice` ✅ | ❌ not designed | ❌ not designed |

**Same-piece restriction**: two cards sharing the same `pieceSymbol` cannot be picked together (enforced in `CardSelectionScreen`).

## Key constraints & gotchas

- **`skipValidation: true`** is required whenever constructing a `Chess` from a FEN that might be missing a king. This applies to ALL engine files. Without it, chess.js v1 throws.
- **No check-based win**: the game uses king capture as the win condition. `isCheck()` still works for UI hints, but checkmate/stalemate are irrelevant.
- **Stalemate = loss** for the player who can't move (`getStatus` checks `chess.isStalemate()` before `chess.isDraw()`).
- **AI (vsComputer) only plays Black**. The AI effect is gated by `chess.turn() === 'b'`.
- **vsPlayer mode**: `currentCards` switches to each player's cards based on `chess.turn()`. `playerCards` = White's cards, `aiCards` = Black's cards (despite the name).
- **General Gambit respawn bug (fixed)**: `capturedPawnFiles()` previously counted pawns per file, so a diagonal pawn capture (pawn moves to a different file) was wrongly detected as a captured pawn and triggered a spurious respawn. Fixed: the function now compares total pawn count first — if total didn't decrease, no pawn was actually captured.
- **FEN manipulation**: all custom moves directly edit FEN strings. Pattern: split on `' '`, edit position part, join back. FEN row index = `7 - rank`.
- **Double-click bug (fixed)**: `Square.tsx` has no `onClick`. All clicks are handled by `handleBoardPointerDown` on the Board div with `e.preventDefault()` called before any piece checks.

## Campaign mode

Single-player story campaign. 10 nodes (indices 0–8 = individual character bosses, index 9 = Final Battle).

Key files:
- `src/components/Campaign/CampaignScreen.tsx` — map UI, node rendering, progress display
- `src/data/dialogue.ts` — all dialogue data. `FINALE_PRE_SCENES` (14 scenes), `FINALE_POST_WIN` (4 scenes), `FINALE_POST_LOSE` (2 scenes). `FinaleScene` interface: `{ charId: string; lines: string[] }`.
- `App.tsx` — `'campaign'`, `'pre-dialogue'`, `'finale-dialogue'` screens; `campaignOpponent`, `campaignLastResult`, `finaleSceneIdx` state.

The finale node (index 9) triggers `'finale-dialogue'` (not `'pre-dialogue'`), cycles through all 14 `FINALE_PRE_SCENES` before the game, then post-game cycles through `FINALE_POST_WIN` or `FINALE_POST_LOSE`. The `isPost` flag in the `'finale-dialogue'` screen is `campaignLastResult !== null`.

Guard: the unlock `useEffect` skips `charId === 'finale'` (no card to unlock for the final battle).

---

## HappyCademy integration — the big picture

### Why this matters

HappyPawnCards is being integrated into the HappyCademy ecosystem. The game becomes a **reward loop** for chess students:
- Play games / solve puzzles → earn **points**
- Every 100 points → 1 **token** (automatic, server-side)
- Spend tokens on **digital booster packs** → unlock card variants
- Better cards → more engagement → kids attend more lessons → more points

### HappyCademy tech stack (relevant parts)

All in `/Users/ferrandsebastien/Downloads/New website/`:

| Component | What it is | Relevant to us |
|---|---|---|
| `happy-cloud-run-server/` | Node.js/Express API on Google Cloud Run | Auth middleware, token/point endpoints |
| `happy-functions/` | Firebase Cloud Functions | Callable services (leaderboard etc.) |
| `happy-app/` | Flutter mobile/web app | Reference for data models |
| Firebase projects | `happy-app-dev-f90a0` (dev), `happy-app-prod-e2636` (prod) | Same projects HappyPawnCards already uses |

Cloud Run base URL (prod): `https://happy-cloud-run-api-259857752083.us-central1.run.app`  
Auth: Firebase ID token in `Authorization: Bearer <token>` header — same pattern as Flutter app.

### Existing Firestore data model (relevant fields)

**`app_users/{userId}`** — top-level user document  
→ `academy_student_roles: Map<Academy, AcademyStudentRole>`  
→ per academy (key: `'happypawnchess'`):  
  - `tokens: number` — spendable currency  
  - `points: number` — performance points  

**Transaction collections** (full audit trail, already exists):
- `point_transactions` — every point award/deduction
- `token_transactions` — every token earn/spend (including `rewardPurchase` type)
- `reward_orders` — purchases; statuses: pending → processing → completed / canceled

### Existing Cloud Run endpoints (already usable)

- `POST /createRewardOrder` — spend tokens; handles balance check, deduction, transaction log. Returns error with `code/currency/balance/required` if insufficient. **This is how booster pack purchases work.**
- `POST /createCustomTokenTransaction` — manually award or deduct tokens (admin use)
- `POST /createCustomPointTransaction` — manually award points
- `POST /getTokenTransactions` — fetch history (params: `studentId`, `academyKey`)
- `POST /getPointTransactions` — fetch history

### What still needs to be built

#### 1. CORS — Cloud Run (5 min, one command)
Add `https://happypawnchess.vercel.app` to the Cloud Run service env var:
```bash
gcloud run services update happy-cloud-run-api \
  --update-env-vars "CORS_ALLOWED_ORIGINS=https://happypawnchess.com,...,https://happypawnchess.vercel.app" \
  --project happy-app-prod-e2636 --region us-central1
```

#### 2. New Cloud Run endpoint: `POST /awardGamePoints`
The existing point endpoints don't auto-convert points→tokens for arbitrary calls (that only happens in `adjustStudentByFeedback` which is event-feedback-specific). This new endpoint:
- Accepts `{ studentId, academyKey: 'happypawnchess', points, reason }`
- Awards points + calculates how many tokens were crossed (floor(newTotal/100) - floor(oldTotal/100))
- Creates a `point_transaction` + optional `token_transaction` in one Firestore batch
- Lives in `happy-cloud-run-server/src/api/` and `src/core/`

Suggested point rewards:
| Event | Points |
|---|---|
| Win vs AI | 15 |
| Draw vs AI | 5 |
| Win vs Player | 25 |
| Solve a puzzle (correct) | 10 |
| Daily first game bonus | 5 |

#### 3. Card ownership in Firestore
New collection: `chess_card_ownership/{userId}` with field `ownedCards: string[]` (e.g. `["happy-pawn_basic", "unipop_golden"]`).  
- On login: load from Firestore → replaces current local `ownedCardIds` state in App.tsx  
- On unlock (campaign win / pack opening): write back via Cloud Run (admin SDK), not directly from client  
- Security rules: users can read their own doc only; writes only via admin SDK  

#### 4. Token balance display
After login, fetch token balance from Firestore (direct client SDK read on `app_users/{userId}`) and display it in the UI (mode selection screen header, card shop screen). Refresh after any transaction.

#### 5. Booster pack shop + `POST /openBoosterPack` endpoint
Shop screen in HappyPawnCards. Pack tiers:

| Pack | Token cost |
|---|---|
| Basic pack | 3 tokens |
| Premium pack | 8 tokens |
| Legendary pack | 15 tokens |

Flow:
1. Player taps "Buy" → HappyPawnCards calls `createRewardOrder` (existing endpoint) with token cost
2. On success → calls new `openBoosterPack` endpoint with the `reward_order_id`
3. Server: verifies order paid & not already opened, runs weighted-random card selection, writes new cards to `chess_card_ownership`, marks order completed
4. Client: shows pack-opening animation, reveals cards

Rarity weights:
| Rarity | Weight |
|---|---|
| Basic / Baby | 60% |
| Full-art / Foil | 25% |
| Golden | 12% |
| Legendary | 2.5% |
| Space | 0.5% |

#### 6. Chess puzzles screen (future, independent)
A `PuzzleScreen` using the existing `Board` component. Source: Lichess puzzle API (free, no API key). Award 10 points per correct solve. This is pure frontend — separable from everything else.

### Recommended implementation order
1. **CORS fix** (one command, unblocks everything)
2. **Token balance display** after login (read-only, no new backend, quick win)
3. **`/awardGamePoints` endpoint** + call it on game end (core earn loop)
4. **Firestore card ownership** (migrate from local state)
5. **Booster pack shop** + `/openBoosterPack` (the exciting part)
6. **Chess puzzles** (anytime, independent)

### Design decision: enrolled students only
For Phase 1, only students with existing HappyCademy accounts can earn tokens. Guests can still play freely but don't earn. This avoids needing a public sign-up flow and creates a natural incentive to enroll.

---

## Roadmap

### In progress / next up
- [ ] HappyCademy token integration (see above — auth is already done, CORS is next)
- [ ] Missing powers: 20 of 27 powers not yet designed — Crystal Queen and King's Guard base powers, plus all legendary and space powers for every character
- [ ] Chess puzzles screen (Lichess API, awards points)

### Frontend-only
- [ ] **Sounds**: move, capture, win/lose, card power sounds
- [ ] **Better piece styles**: offer different visual styles for standard chess pieces
- [ ] **App icon**: custom chess-themed favicon

### Requires backend / infra
- [ ] **Online multiplayer**: real-time play via WebSockets (Vercel supports WebSockets on Fluid Compute)
- [ ] **Queue system**: matchmaking queue with live player count displayed
- [ ] **Ratings & league**: ELO-style rating, seasonal leagues
- [ ] **Profile**: avatar, username, stats overview
- [ ] **Friends**: add/remove, see online status
- [ ] **Game history**: replay past games
- [ ] **Stats**: win rate, most-used cards, etc.
- [ ] **Invite via link**: generate a game link to challenge a specific person

### TCG progression system
- [x] **Campaign mode**: implemented — 10 nodes, dialogue system, character unlock on win
- [ ] **Achievement-gated rarities**: legendary/space only unlock via milestones
- [ ] **Collection screen**: view all cards owned vs. locked, with unlock hints
- [ ] **Booster packs**: see HappyCademy integration section above

### Design / polish
- [ ] **Drag and drop**: already partially implemented (pointer events on Board); Unipop/Robin Rook/Chessbeard still require click-click for multi-step flows — drag selects piece only
- [ ] **Improve overall design**: more character, more card art throughout the UI
- [ ] **Animations**: piece movement, power activation, card-play effects

## File structure (key files)

```
src/
  App.tsx                        # Screen routing, card zoom modal, CardStrip, auth gating
  lib/
    firebase.ts                  # Firebase init (dev/prod auto-detected)
  hooks/
    useAuth.ts                   # Firebase Auth — onAuthStateChanged, signIn, signOut
    useChessGame.ts              # All game state & actions
  engine/
    pseudolegal.ts               # Base moves + king detection
    minimax.ts                   # AI
    aipowers.ts                  # AI power move selection (Unipop, Robin Rook, Happy Pawn, etc.)
    unipop.ts / robinrook.ts / puzzlepete.ts
    blackking.ts / happypawn.ts / chessbeard.ts
  components/
    Auth/
      SignInScreen.tsx            # Email/password sign-in UI
    Board/
      Board.tsx                  # Square grid + overlays + piece image map; all clicks via onPointerDown
      Square.tsx                 # Single square — NO onClick (prevented double-call bug)
      Piece.tsx                  # Renders piece image (cardImage or standard SVG)
      RookChoiceMenu.tsx         # Move vs Shoot popup
      PromotionMenu.tsx          # Legendary Happy Pawn promotion choice
      animations/FireTrail.tsx, ArrowShot.tsx
    GameInfo/
      GameInfo.tsx               # Status, timer, player badges, action buttons
      MoveHistory.tsx            # Coordinate notation (e2-e4 / Nf3xe5)
    CardSelection/
      CardSelectionScreen.tsx    # Rarity tabs, card grid, pick slots
      CardTile.tsx               # Individual card with selection/conflict/coming-soon states
    Campaign/
      CampaignScreen.tsx         # Map UI, node progression
    ModeSelection/
      ModeSelectionScreen.tsx    # VS Computer / VS Player / Online (coming soon)
  data/
    cards.ts                     # Card variants, rarities
    powers.ts                    # CardPowerDef, CARD_POWERS, piece image constants
    dialogue.ts                  # All campaign dialogue + FINALE_PRE/POST_WIN/POST_LOSE scenes
public/
  images/
    cards/                       # Card artwork (named by characterId + rarity)
    pieces/                      # Custom piece images (unipop, robin-rook, etc.)
    characters/                  # Character sprites used in dialogue/campaign
```

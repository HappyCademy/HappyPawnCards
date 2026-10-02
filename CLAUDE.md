# Happy Pawn Cards — Claude Code Guide

## Project overview

A digital chess card game where players pick 2 character cards before the match, each granting unique powers that bend chess rules. Supports VS Computer (minimax AI), VS Player (pass-and-play), and **Online multiplayer** (real-time via Firestore + URL sharing). Part of the **HappyCademy** ecosystem (a children's chess/STEM academy in Bangkok).

## Tech stack

- **Vite + React 18 + TypeScript** (strict)
- **Tailwind CSS v4** — import style: `@import "tailwindcss"` (no config file)
- **chess.js v1.4.0** — IMPORTANT: constructor throws if a king is missing from FEN. Always use `new Chess(fen, { skipValidation: true })` when constructing from a custom FEN that may lack a king (e.g. after king capture).
- **Firebase SDK v12** — Auth + Firestore (both in use). `src/lib/firebase.ts` initialises the app using `VITE_FIREBASE_ENV === 'production'` to select dev (`happy-app-dev-f90a0`) vs prod (`happy-app-prod-e2636`). **Vercel has no `VITE_FIREBASE_ENV` env var set → always uses dev Firebase.**
- **Deployed to Vercel** via `npx vercel --prod`. Staying on Vercel (not moving to Firebase Hosting).

## Firebase / Firestore — critical notes

- Dev project: `happy-app-dev-f90a0` | Prod project: `happy-app-prod-e2636`
- **Vercel deployment uses dev Firebase** — no `VITE_FIREBASE_ENV` set in Vercel env vars.
- **Always pass `--project dev` or `--project prod` explicitly** with Firebase CLI. The CLI's global project selection overrides `.firebaserc` — never trust the default.
- Dev rules (`happy-functions/firestore.rules`): permissive catch-all `allow read, write: if request.auth != null`.
- Prod rules (`happy-app/firestore.rules`): explicit per-collection rules including `online_games`.
- `online_games` collection is in **dev Firestore** (where the live game data lives).
- `src/lib/firestore.ts` exports the `db` instance.

## Authentication — already implemented

- `src/lib/firebase.ts` — Firebase init
- `src/hooks/useAuth.ts` — `onAuthStateChanged`, `signIn(email, password)`, `signOut()`
- `src/components/Auth/SignInScreen.tsx` — complete sign-in UI
- `App.tsx` — gates campaign mode behind login; passes `auth.user` / `userEmail` / `onSignOut` down

## Architecture

### Game flow (App.tsx)

```
'mode' screen → ModeSelectionScreen
  ↓ vsComputer:  'p1-selection' → CardSelectionScreen → 'game'
  ↓ vsPlayer:    'p1-selection' → 'p2-selection' → CardSelectionScreen × 2 → 'game'
  ↓ online/host: 'p1-selection' → 'online-time' (time control picker) → createGame → 'game'
  ↓ online/join: 'p1-selection' → joinGame (via URL ?join=gameId) → 'game'
  ↓ campaign:    'campaign' → 'pre-dialogue' / 'finale-dialogue' → 'p1-selection' → 'game'
```

### Game hook (src/hooks/useChessGame.ts)

Central state machine. Returns `GameState & GameActions`. Key logic:
- `chessRef`: mutable ref to the `Chess` instance; updated directly, then `bump()` triggers a re-render
- `currentCards`: in vsPlayer, follows whose turn it is; in vsComputer, always the human player's cards
- `withRespawns(before, after)`: wraps every move to apply General Gambit pawn respawning
- `clearSelection()`: resets all selection/mode state (selected square, valid targets, all special mode flags)
- Special move modes handled via dedicated state flags:
  - `unipopState`, `unipopBonusSquare` — Unipop L-path and legendary double jump
  - `isRookShootMode`, `rookChoiceSquare` — Robin Rook shoot
  - `blackKingBonusSquare` — Black King bonus move
  - `isChessbeardSelectMode`, `chessbeardSacrificeSquare` — Chessbeard sacrifice
  - `isSpaceHappyPawnPlaceMode` — Space Happy Pawn reserve placement
  - `isSpaceChessbeardFreezeMode`, `spaceChessbeardFrozenSquare` — Space Chessbeard freeze
  - `isAdmiralGambitPawnSelectMode`, `admiralGambitPawnSquare` — Admiral Gambit (legendary General Gambit) pawn sacrifice teleport
  - `crystalQueenVulnerable` — tracks whether Crystal Queen's Space immune power is active
  - `legendaryHappyPawnPromoteSquare` — pending promotion square for Legendary Happy Pawn
- Win condition: `isKingOnBoard()` — king absence = victory, not checkmate. **Stalemate = loss for the stalemated player** (not draw).
- AI moves via `getBestMove(fen, depth=1)` in a `useEffect` on `tick`
- **Move history**: maintained in `moveHistoryRef` (separate from `chess.history()` which is always empty due to FEN-based moves). Format: `e2-e4` / `Nf3xe5`. Undo restores history count via `fenHistoryRef` (stores `{ fen, moveCount }`).
- **Online sync**: `completeTurn` writes `OnlineSyncState` via `onlineConfig.onTurnComplete`. Timer pauses during opponent's online turn. `lastReceivedTimeRef` carries opponent's time pool across turns.

### Board interaction (src/components/Board/Board.tsx)

All clicks go through `handleBoardPointerDown` on the board div — **Square.tsx has no `onClick`**. This prevents the double-call bug. `e.preventDefault()` is called for ALL board clicks (before any piece check) to suppress the synthetic `click` event.

**iOS AudioContext unlock**: `unlockAudio()` is called at the very top of `handleBoardPointerDown` before any early returns — must happen inside a direct user gesture handler.

Drag-and-drop is fully implemented: dragging a piece works as selecting it; multi-step powers (Unipop, Robin Rook, Chessbeard) require click-click for the second step.

### Sounds (src/utils/sounds.ts)

Fully implemented. Exports: `playMove()`, `playCapture()`, `playCheck()`, `playPower()`, `playWin()`, `playLose()`, `playTimerTick()`, `unlockAudio()`. All wired into `useChessGame.ts`. Power activation sound (`playPower()`) triggered on entering each special mode state.

### Online multiplayer (src/hooks/useOnlineGame.ts + src/lib/onlineGame.ts)

Live via Firestore. Flow:
1. Host picks cards → `'online-time'` screen (3 min / 5 min / 10 min / No limit) → `createGame()` → gets `gameId`
2. Host shares URL (`?join=gameId`), opponent opens it → `joinGame()` — both enter `'game'` screen
3. Moves synced via `OnlineGameDoc.sync` (the `OnlineSyncState` object written on each turn)
4. Heartbeat (`wHeartbeat`/`bHeartbeat`) written every 15s via `serverTimestamp()`. Age checked on Firestore updates and every 15s locally. `>45s → 'maybe'`, `>90s → 'likely'`. "Claim Win" button appears at 'likely'.
5. `claimWinByDisconnect()` writes `resignedBy` to Firestore → opponent sees loss.
6. Active game cached in `localStorage` (`hpc_active_game`) for page-refresh rejoin.

Key types:
```ts
// In useChessGame.ts
export interface OnlineSyncState {
  fen: string; moveHistory: string[]; lastMove: [string, string] | null
  crystalQueenVulnerable: boolean; spaceChessbeardFrozenSquare: string | null
  status: GameStatus; resignedBy: 'w' | 'b' | null; timedOut?: 'w' | 'b' | null
  timeRemainingW?: number | null; timeRemainingB?: number | null
}
// In onlineGame.ts
export interface OnlineGameDoc {
  white: string; black: string | null; whiteDisplayName: string | null; blackDisplayName: string | null
  status: 'waiting' | 'playing' | 'white-wins' | 'black-wins' | 'draw'
  whiteCards: CardVariant[]; blackCards: CardVariant[] | null
  sync: OnlineSyncState; timeControlSeconds: number | null
  wHeartbeat?: Timestamp | null; bHeartbeat?: Timestamp | null
}
```

### Engine files (src/engine/)

| File | Powers |
|------|--------|
| `pseudolegal.ts` | Base pseudo-legal moves (ignores check) + `isKingOnBoard` |
| `minimax.ts` | AI — minimax with alpha-beta |
| `aipowers.ts` | AI power move selection for all 10 characters |
| `unipop.ts` | L-Path (base), Phase Jump (legendary), Double Jump (space) |
| `robinrook.ts` | Shoot (base), Cannon/legendary moves, Cosmic Volley (space all-dir) |
| `puzzlepete.ts` | Bounce (base) |
| `piratequeen.ts` | Bouncing Queen (legendary upgrade of Puzzle Pete) |
| `blackking.ts` | Royal Gambit (base), Death Aura (legendary), Cosmic King (space) |
| `happypawn.ts` | Push (base), Early Promotion (legendary), Reserve placement (space) |
| `chessbeard.ts` | Sacrifice (base), Even Trade (legendary), Freeze (space) |
| `crystalqueen.ts` | Royal Switch (base), Pawn Switch (legendary), Phantom Queen (space) |
| `kingsguard.ts` | Pawn Shield (base), Strike Check (legendary), Pawn Wall (space) |

### Card system (src/data/)

- `cards.ts` — `CardVariant` type, `RARITIES` list, `getCardsByRarity()`, `pickRandomCards()`
- `powers.ts` — `CARD_POWERS` map (`characterId → CardPowerDef`), piece image exports

## Card powers — all 27 implemented ✅

Each character has **3 powers** tied to card variant rarity:
- **Base power** — regular, baby, full-art, foil, golden
- **Legendary power** — legendary and secret legendary variants
- **Space power** — space variant

Note: Puzzle Pete's legendary rarity upgrades to a different character (Pirate Queen). All others upgrade in-place.

| Character | Piece | Base power | Legendary power | Space power |
|-----------|-------|-----------|-----------------|-------------|
| Happy Pawn | Pawn | `happyPawnPush` — Push ✅ | Early Promotion ✅ | Reserve ✅ |
| Unipop | Knight | `unipopLPath` — L-Path ✅ | Phase Jump ✅ | Double Jump ✅ |
| Puzzle Pete | Bishop | `puzzlePeteBounce` — Bounce ✅ | → upgrades to Pirate Queen ✅ | Stacking ✅ |
| Pirate Queen | Queen | `pirateQueenBounce` — Bouncing Queen ✅ | (Pirate Queen IS Puzzle Pete's legendary) | — |
| Robin Rook | Rook | `robinRookStay` — Shoot ✅ | Cannon ✅ | Cosmic Volley ✅ |
| Crystal Queen | Queen | `crystalQueenSwap` — Royal Switch ✅ | Pawn Switch ✅ | Phantom Queen ✅ |
| Black King | King | `blackKingCapture` — Royal Gambit ✅ | Death Aura ✅ | Cosmic King ✅ |
| King's Guard | King | `kingsGuardBlock` — Pawn Shield ✅ | Strike Check ✅ | Pawn Wall ✅ |
| General Gambit | (any) | `generalGambitRespawn` — Respawn ✅ | Pawn Sacrifice ✅ | Admiral Respawn ✅ |
| Chessbeard | (any) | `chessbeardSacrifice` — Sacrifice ✅ | Even Trade ✅ | Freeze ✅ |

**Same-piece restriction**: two cards sharing the same `pieceSymbol` cannot be picked together (enforced in `CardSelectionScreen`). Crystal Queen and Pirate Queen both use `'q'`.

## Key constraints & gotchas

- **`skipValidation: true`** is required whenever constructing a `Chess` from a FEN that might be missing a king. This applies to ALL engine files.
- **No check-based win**: king capture = win. `isCheck()` still works for UI hints only.
- **Stalemate = loss** for the player who can't move (`getStatus` checks `chess.isStalemate()` before `chess.isDraw()`).
- **AI (vsComputer) only plays Black**. AI effect gated by `chess.turn() === 'b'`.
- **vsPlayer mode**: `currentCards` switches to each player's cards based on `chess.turn()`. `playerCards` = White's cards, `aiCards` = Black's cards (despite the name).
- **General Gambit respawn bug (fixed)**: `capturedPawnFiles()` compares total pawn count first — if total didn't decrease, no capture, no respawn.
- **Admiral Gambit `noRespawn`**: `completeTurn(before, after, fromSq, toSq, noRespawn = false)` — the Admiral Gambit pawn sacrifice passes `noRespawn = true` to prevent triggering General Gambit respawn on its own sacrificed pawn.
- **Resign color online**: `onResign` uses `onlineConfig?.myColor ?? chess.turn()` — NOT `chess.turn()` alone, which would be wrong during the opponent's turn.
- **FEN manipulation**: all custom moves directly edit FEN strings. Split on `' '`, edit position part, join back. FEN row index = `7 - rank`.
- **Double-click bug (fixed)**: `Square.tsx` has no `onClick`. All clicks via `handleBoardPointerDown` on Board div.
- **iOS audio**: `unlockAudio()` must be called at the top of `handleBoardPointerDown` before any early returns.
- **Crystal Queen Phantom Queen (space)**: `crystalQueenVulnerable` state in `useChessGame` + `OnlineSyncState` tracks whether she's currently capturable after taking a piece.
- **`timedOutSyncedRef`**: ensures timeout result is synced to opponent exactly once (parallel to `resignSyncedRef`).

## Campaign mode

Single-player story campaign. 10 nodes (indices 0–8 = individual character bosses, index 9 = Final Battle).

Key files:
- `src/components/Campaign/CampaignScreen.tsx` — map UI, node rendering, progress display
- `src/data/dialogue.ts` — all dialogue data. `FINALE_PRE_SCENES` (14 scenes), `FINALE_POST_WIN` (4 scenes), `FINALE_POST_LOSE` (2 scenes). All 9 characters fully voiced across 3 chapters × 3 phases.
- `App.tsx` — `'campaign'`, `'pre-dialogue'`, `'finale-dialogue'` screens

**Campaign character locking**: `computeCampaignSelectableIds()` in App.tsx filters `ownedCardIds` to only cards from characters the player has already beaten in that chapter. Shop-purchased cards for future characters are excluded. Uses `CAMPAIGN_CHARS.slice(0, beatenCount)`.

The finale node (index 9) triggers `'finale-dialogue'` (not `'pre-dialogue'`), cycles through all 14 `FINALE_PRE_SCENES` before the game, then post-game `FINALE_POST_WIN` or `FINALE_POST_LOSE`. The `isPost` flag = `campaignLastResult !== null`.

Guard: unlock `useEffect` skips `charId === 'finale'` (no card to unlock for the final battle).

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
The existing point endpoints don't auto-convert points→tokens for arbitrary calls. This new endpoint:
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
Shop screen in HappyPawnCards (`src/components/Shop/ShopScreen.tsx` already exists as scaffold). Pack tiers:

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

## Play Zone (`src/components/PlayZone/PlayZoneScreen.tsx`)

A hub screen for quick-play activities — separate from the campaign and card game modes. Accessible from the mode selection screen.

Current activities in the Play Zone:
- **Bot Challenge** — standard chess game against the minimax AI (no card powers). Uses the same `useChessGame` hook but with `botCharacter = null` (no card picks). Deployed on `hpc-game-dev` Firebase Hosting and linked from the HPC website playground page.
- Additional activities are placeholders (Chess Puzzles, Guess the Move, etc.)

### Bot Challenge specifics
- Uses `botCharacter` prop on `GameScreen`. When `botCharacter` is a real character, cards are active; when it's the bot-challenge "no-cards" mode, all powers are disabled.
- **Piece art toggle** must be hidden in bot challenge — it only applies to Happy Pawn Cards game mode. Implemented by passing `onToggleSpecialPieces={undefined}` when `botCharacter` is set; `GameInfo` hides the toggle when the prop is `undefined`.
- **Checkmate detection**: `getStatus()` in `useChessGame.ts` checks `chess.isCheckmate()` before `chess.isStalemate()`. This is critical — `chess.js` does NOT return `isStalemate = true` on checkmate (they're mutually exclusive), so the stalemate check must come after an explicit checkmate check.

### Deployment
The Play Zone is part of HappyPawnCards, deployed to Vercel (`npx vercel --prod`) **and** Firebase Hosting (`hpc-game-dev` site — linked from `happypawnchess.com/playground`).

---

## Roadmap

### In progress / next up
- [ ] HappyCademy token integration (see above — auth is done, CORS is next)
- [ ] Chess puzzles screen (Lichess API, awards points)

### Frontend-only
- [x] **Sounds**: fully implemented in `src/utils/sounds.ts` (move, capture, check, power, win, lose, timer tick)
- [ ] **Better piece styles**: offer different visual styles for standard chess pieces (`PieceSetContext.tsx` + `PieceSetPicker.tsx` already exist as scaffold)
- [ ] **App icon**: custom chess-themed favicon

### Online multiplayer — implemented ✅
- [x] **Real-time play** via Firestore (`online_games` collection), URL sharing (`?join=gameId`)
- [x] **Time controls**: 3/5/10 min per player or no limit; pools track per-player remaining time
- [x] **Disconnection detection**: heartbeat every 15s, 'maybe'/'likely' states, Claim Win button
- [ ] **Queue system**: matchmaking queue with live player count displayed
- [ ] **Ratings & league**: ELO-style rating, seasonal leagues
- [ ] **Profile**: avatar, username, stats overview
- [ ] **Friends**: add/remove, see online status
- [ ] **Game history**: replay past games

### TCG progression system
- [x] **Campaign mode**: implemented — 10 nodes, dialogue system, character unlock on win, campaign character locking
- [x] **Collection screen**: scaffold exists at `src/components/Collection/CollectionScreen.tsx`
- [ ] **Achievement-gated rarities**: legendary/space only unlock via milestones
- [ ] **Booster packs**: see HappyCademy integration section above

### Design / polish
- [x] **Drag and drop**: fully implemented (pointer events on Board; multi-step powers require click for second step)
- [ ] **Improve overall design**: more character, more card art throughout the UI
- [ ] **Animations**: piece movement, power activation, card-play effects

## File structure (key files)

```
src/
  App.tsx                        # Screen routing, card zoom modal, CardStrip, auth gating, computeCampaignSelectableIds
  context/
    PieceSetContext.tsx           # Context for piece set selection (standard/custom)
  lib/
    firebase.ts                  # Firebase init — dev/prod via VITE_FIREBASE_ENV env var
    firestore.ts                 # Exports db (Firestore instance)
    onlineGame.ts                # Firestore read/write helpers for online_games collection
  hooks/
    useAuth.ts                   # Firebase Auth — onAuthStateChanged, signIn, signOut
    useChessGame.ts              # All game state & actions
    useOnlineGame.ts             # Online game lifecycle: create, join, rejoin, heartbeat, claimWin, leaveGame
  utils/
    sounds.ts                    # All audio: playMove/Capture/Check/Power/Win/Lose/TimerTick, unlockAudio
  engine/
    pseudolegal.ts               # Base pseudo-legal moves + isKingOnBoard
    minimax.ts                   # AI minimax with alpha-beta
    aipowers.ts                  # AI power move selection for all 10 characters
    unipop.ts                    # L-Path, Phase Jump (wrap edges), Double Jump, getLegendaryUnipopTargets
    robinrook.ts                 # Shoot, getAllDirShootTargets (space), getRobinRookLegendaryTargets (cannon)
    puzzlepete.ts                # getPuzzlePeteBishopTargets (bounce)
    piratequeen.ts               # getPirateQueenTargets (bouncing queen — legendary upgrade of Puzzle Pete)
    blackking.ts                 # Royal Gambit, applyDeathAura (legendary), getSpaceBlackKingTargets
    happypawn.ts                 # Push, space reserve placement, legendary early promotion
    chessbeard.ts                # Sacrifice, Even Trade (legendary), Freeze (space); PIECE_VALUE, countMaterial
    crystalqueen.ts              # Royal Switch (swap with n/b/r), Pawn Switch (legendary), Phantom Queen (space immune)
    kingsguard.ts                # Pawn Shield (teleport to block), Strike Check (legendary), Pawn Wall (space)
  components/
    Auth/
      SignInScreen.tsx            # Email/password sign-in UI
    Board/
      Board.tsx                  # Square grid + overlays; all clicks via onPointerDown; drag-and-drop; unlockAudio()
      Square.tsx                 # Single square — NO onClick
      Piece.tsx                  # Renders piece image (cardImage or standard SVG)
      RookChoiceMenu.tsx         # Move vs Shoot popup
      PromotionMenu.tsx          # Legendary Happy Pawn promotion choice
      animations/FireTrail.tsx, ArrowShot.tsx
    GameInfo/
      GameInfo.tsx               # Status, timer, player badges, action buttons
      MoveHistory.tsx            # Coordinate notation (e2-e4 / Nf3xe5)
      PieceSetPicker.tsx         # Piece style selector
    CardSelection/
      CardSelectionScreen.tsx    # Rarity tabs, card grid, pick slots
      CardTile.tsx               # Individual card with selection/conflict/coming-soon states
    Campaign/
      CampaignScreen.tsx         # Map UI, node progression
      DialogueScreen.tsx         # Character dialogue display
    Collection/
      CollectionScreen.tsx       # Card collection viewer (scaffold)
    ModeSelection/
      ModeSelectionScreen.tsx    # VS Computer / VS Player / Online
    Online/
      OnlineLobbyScreen.tsx      # Online game lobby: create link, join via gameId, display URL
    Shop/
      ShopScreen.tsx             # Token shop scaffold
  data/
    cards.ts                     # CardVariant type, rarities
    powers.ts                    # CardPowerDef, CARD_POWERS map (all 10 characters), piece image constants
    dialogue.ts                  # All campaign dialogue + FINALE_PRE/POST_WIN/POST_LOSE scenes
public/
  images/
    cards/                       # Card artwork (named by characterId + rarity)
    pieces/                      # Custom piece images (unipop, robin-rook, etc.)
    characters/                  # Character sprites used in dialogue/campaign
```

export interface BotDialogue {
  intro: string[]
  botCaptures: string[]
  playerCaptures: string[]
  check: string[]
  botInCheck: string[]
  botWins: string[]
  playerWins: string[]
}

export interface BotCharacterDef {
  characterId: string
  displayName: string
  level: number
  depth: number
  randomness: number
  themeColor: string
  portraitSrc: string
  tagline: string
  aiCardIds: string[]
  dialogue: BotDialogue
}

export const BOT_CHARACTERS: BotCharacterDef[] = [
  {
    characterId: 'happy-pawn',
    displayName: 'Happy Pawn',
    level: 1,
    depth: 1,
    randomness: 0.75,
    themeColor: '#4ade80',
    portraitSrc: '/images/characters/happy-pawn/basic-fullbody.png',
    tagline: 'Joyful & eager — the ultimate beginner!',
    aiCardIds: ['happy-pawn_1basic'],
    dialogue: {
      intro: [
        "Wow, a real opponent! I've been waiting for this!",
        "Hehe, I've been practising ALL week just for you!",
        "Don't go too easy on me! ...Actually, maybe a little?",
      ],
      botCaptures: [
        "Got one! Did you see that?! I DID IT!",
        "Oopsie, that was yours! I didn't mean to... okay I did!",
        "Teehee! Beginner's luck? ...It's not JUST luck!",
      ],
      playerCaptures: [
        "Nooo! That was my favourite piece...",
        "Oh no oh no... I'm okay! I'm totally okay!",
        "Yikes! Okay, strategy time. Do I even HAVE a strategy?",
      ],
      check: [
        "Is that... checkmate? Wait, no — that's CHECK. Still cool!",
        "CHECK! Oh wow I actually did it!",
        "Your king looks scared. Mine too, honestly.",
      ],
      botInCheck: [
        "AHHH my king! Not the king!!",
        "That's check! ...You're very good at this!",
        "Okay, okay, don't panic. I've trained for this. Sort of.",
      ],
      botWins: [
        "I WIN?! I actually WIN! Best day EVER!! 🎉",
        "YESSS! Wait till I tell my friends about this!",
      ],
      playerWins: [
        "You won! You're amazing! Can we play again? Please?",
        "Good game good game! You're way better than me but that was SO fun!",
      ],
    },
  },

  {
    characterId: 'chessbeard',
    displayName: 'Chessbeard',
    level: 2,
    depth: 1,
    randomness: 0.50,
    themeColor: '#f59e0b',
    portraitSrc: '/images/characters/chessbeard/basic-fullbody.png',
    tagline: 'The wise old master of the chessboard.',
    aiCardIds: ['chessbeard_1basic'],
    dialogue: {
      intro: [
        "Ah, a student dares challenge the old master. Very well.",
        "The board is life itself, young one. Let us see your wisdom.",
        "Every game is a lesson. Are you ready to learn?",
      ],
      botCaptures: [
        "As the ancient proverb says: remove the obstacle.",
        "Experience has its privileges, young one.",
        "Your resistance was admirable. But futile.",
      ],
      playerCaptures: [
        "Impressive. The student shows promise.",
        "Hmm. A fine move. The master is pleased.",
        "Well played. You have been paying attention.",
      ],
      check: [
        "Check. Contemplate your position carefully.",
        "Your king is troubled. Let this be a lesson.",
        "Do you feel the pressure? Remember this feeling.",
      ],
      botInCheck: [
        "The master acknowledges a fine tactic.",
        "In 70 years of chess, still surprises await. Remarkable.",
        "The student has found the path. Now survive the reply.",
      ],
      botWins: [
        "A good battle, young one. You will grow stronger.",
        "The lesson is complete. You fought with honour.",
      ],
      playerWins: [
        "The student has surpassed the teacher. This brings me great joy.",
        "Magnificent. You have beaten the old master. Treasure this victory.",
      ],
    },
  },

  {
    characterId: 'general-gambit',
    displayName: 'Admiral Gambit',
    level: 3,
    depth: 1,
    randomness: 0.25,
    themeColor: '#6366f1',
    portraitSrc: '/images/characters/general-gambit/basic-fullbody.png',
    tagline: 'The strict, righteous commander of the board.',
    aiCardIds: ['general-gambit_6legend'],
    dialogue: {
      intro: [
        "Attention! Battle begins NOW. Discipline is everything.",
        "I have studied your games. I know every weakness.",
        "No excuses. No mercy. Let the superior tactician win.",
      ],
      botCaptures: [
        "Capture confirmed. As planned.",
        "Tactical objective achieved.",
        "By order of the Admiral!",
      ],
      playerCaptures: [
        "...Adjusting formation.",
        "An unexpected manoeuvre. Noted.",
        "You are stronger than my intelligence suggested.",
      ],
      check: [
        "Check. This was inevitable.",
        "Your king is exposed. Reinforce your position!",
        "The campaign proceeds as projected.",
      ],
      botInCheck: [
        "Unacceptable. Regrouping immediately.",
        "Even the Admiral may be surprised. Once.",
        "A bold move. But I will recover.",
      ],
      botWins: [
        "Victory follows discipline. Well fought, soldier.",
        "Mission accomplished. You have earned my respect.",
      ],
      playerWins: [
        "...You have defeated the Admiral. I accept this honourably.",
        "Outstanding tactics. You are a worthy opponent, soldier.",
      ],
    },
  },

  {
    characterId: 'unipop',
    displayName: 'Unipop',
    level: 4,
    depth: 2,
    randomness: 0.55,
    themeColor: '#c084fc',
    portraitSrc: '/images/characters/unipop/basic-fullbody.png',
    tagline: 'Wild, chaotic, and totally unpredictable!',
    aiCardIds: ['unipop_1basic'],
    dialogue: {
      intro: [
        "WHOOOOO! LET'S GO! 🦄 I HAVE SO MUCH ENERGY RIGHT NOW!",
        "Did someone say CHESS?! More like CHAOS! HAHAHA!",
        "I don't have a plan and THAT IS MY PLAN! YEEEHAAAW!",
      ],
      botCaptures: [
        "YOINK! That piece is MINE now!! 🎉",
        "WHAM! My knight goes WEEEEE in an L-shape!",
        "Did you SEE THAT?! I can't believe that worked!!",
      ],
      playerCaptures: [
        "NOOO! My beautiful chaos!! 😱",
        "Fine fine fine, I have 17 backup plans!",
        "Rude!! ...okay that was actually a great move though.",
      ],
      check: [
        "CHECK!! I SAID CHECK!! Did you hear me?! CHECK!!! 🚨",
        "OOOH CHECK! Is this REAL?! 🦄✨",
        "WAHOOOO! CHECK!!",
      ],
      botInCheck: [
        "Oh no— WAIT I meant to do that! ...Mostly.",
        "AHHAHAHA PLOT TWIST, I'M IN CHECK!!",
        "CHAOS MODE ACTIVATED. I'll escape somehow!",
      ],
      botWins: [
        "I WIN!! But HOW?! INCREDIBLE!! 🦄🎊",
        "GREATEST DAY OF MY LIFE! Was this even my plan?? YES. YES IT WAS.",
      ],
      playerWins: [
        "You beat me! You BEAT ME! AMAZING! Can we go again IMMEDIATELY PLEASE?!",
        "You're really good!! I'm kind of obsessed. Let's be chess friends!",
      ],
    },
  },

  {
    characterId: 'crystal-queen',
    displayName: 'Crystal Queen',
    level: 5,
    depth: 2,
    randomness: 0.30,
    themeColor: '#0ea5e9',
    portraitSrc: '/images/characters/crystal-queen/basic-fullbody.png',
    tagline: 'Graceful, powerful, and absolutely ruthless.',
    aiCardIds: ['crystal-queen_1basic'],
    dialogue: {
      intro: [
        "Every path is mine to claim. Shall we begin?",
        "The board is my domain. I move where I please.",
        "You face the Crystal Queen. Choose your moves carefully.",
      ],
      botCaptures: [
        "Mine. As expected.",
        "Nothing stands in my way.",
        "The queen takes what the queen wants.",
      ],
      playerCaptures: [
        "...A calculated loss.",
        "Interesting. You have more precision than I expected.",
        "Noted. Do not think that will happen again.",
      ],
      check: [
        "Check. Your king has nowhere elegant to go.",
        "Feel the pressure of the queen's gaze.",
        "Check. The end is crystallising.",
      ],
      botInCheck: [
        "...You dare? Bold.",
        "A clever move. But a queen is never truly cornered.",
        "Unexpected. My respect — briefly.",
      ],
      botWins: [
        "Checkmate. The queen reigns, as always.",
        "A graceful victory. You played with heart — that counts for something.",
      ],
      playerWins: [
        "...You have bested the Crystal Queen. Extraordinary.",
        "Well played. That was genuinely beautiful chess.",
      ],
    },
  },

  {
    characterId: 'robin-rook',
    displayName: 'Robin Rook',
    level: 6,
    depth: 2,
    randomness: 0.10,
    themeColor: '#94a3b8',
    portraitSrc: '/images/characters/robin-rook/basic-fullbody.png',
    tagline: 'Few words. Maximum strength.',
    aiCardIds: ['robin-rook_1basic', 'happy-pawn_1basic'],
    dialogue: {
      intro: [
        "...",
        "Let's play.",
        "Ready.",
      ],
      botCaptures: [
        "Taken.",
        "...",
        "Mine.",
      ],
      playerCaptures: [
        "Noted.",
        "...",
        "Strong.",
      ],
      check: [
        "Check.",
        "...",
        "Careful.",
      ],
      botInCheck: [
        "...",
        "Interesting.",
        "Adjusting.",
      ],
      botWins: [
        "...",
        "Well played.",
        "Goodbye.",
      ],
      playerWins: [
        "You won.",
        "Good game.",
        "...next time.",
      ],
    },
  },

  {
    characterId: 'kings-guard',
    displayName: "King's Guard",
    level: 7,
    depth: 2,
    randomness: 0.05,
    themeColor: '#60a5fa',
    portraitSrc: '/images/characters/kings-guard/basic-fullbody.png',
    tagline: 'Scared but devoted — the king must be protected!',
    aiCardIds: ['kings-guard_1basic', 'black-king_1basic'],
    dialogue: {
      intro: [
        "I-I must protect my king! Please don't hurt him! ...Fight me first!",
        "I'm n-not scared! I'm mostly not scared. For the king!",
        "Please don't tell the Black King I was nervous. I wasn't. Okay maybe a little.",
      ],
      botCaptures: [
        "I-I got one?! For His Majesty! ...Sorry though.",
        "The Black King commands me to be fierce! And so I shall be!",
        "D-did I do good? I think I did good!",
      ],
      playerCaptures: [
        "OH NO! My piece... the king will be so disappointed...",
        "Please don't take any more! The king is counting on me!",
        "I was protecting that one so carefully... I'm sorry Your Majesty...",
      ],
      check: [
        "CHECK! Don't worry Your Majesty, everything is under control! ...mostly.",
        "I-I put you in check! For the honour of the king!",
        "One step closer to victory... right? RIGHT?!",
      ],
      botInCheck: [
        "NOT THE KING! NOT THE KING! THIS IS VERY BAD!",
        "Your Majesty! RETREAT! I'll hold them off!",
        "N-nooo! I was supposed to guard him better!",
      ],
      botWins: [
        "VICTORY! For the Black King! I did it! I actually did it! 😭",
        "His Majesty will be SO proud of me! Best day of my guard career!",
      ],
      playerWins: [
        "I have failed the king... you played very well though. Please be merciful.",
        "I tried my best! ...Tell the king I tried my best. Please.",
      ],
    },
  },

  {
    characterId: 'puzzle-pete',
    displayName: 'Puzzle Pete',
    level: 8,
    depth: 3,
    randomness: 0.15,
    themeColor: '#f97316',
    portraitSrc: '/images/characters/puzzle-pete/basic-fullbody.png',
    tagline: 'The evil pirate who strikes where you least expect!',
    aiCardIds: ['pirate-queen_6legend', 'unipop_1basic'],
    dialogue: {
      intro: [
        "YARRRR! Puzzle Pete strikes where ye least expect! 🏴‍☠️",
        "Ahoy! I've been waiting for a worthy victim— er, OPPONENT! HEHEHE!",
        "Walk the plank, ye chess pretender! MUHAHAHA!",
      ],
      botCaptures: [
        "YARRRR! That piece be MINE now! 🏴‍☠️",
        "Walked right into me trap, ye did! MUHAHAHA!",
        "The pirate always gets what he wants! HARR HARR!",
      ],
      playerCaptures: [
        "Why ye sneaky little— HARR! Well played, I'll admit.",
        "IMPOSSIBLE! Puzzle Pete loses no pieces! ...very often.",
        "Grrrr! A pirate-worthy move. But I shall recover! YARRRR!",
      ],
      check: [
        "YARRRR! The king cowers before Puzzle Pete! CHECK! 🏴‍☠️",
        "Feel the wrath of me bouncing bishop! HAHAHA! Check!",
        "The pirate smells VICTORY! ...and also the sea.",
      ],
      botInCheck: [
        "WHAT?! HOW?! This be IMPOSSIBLE! Puzzle Pete always has a plan!",
        "...Hmm. Impressive. Ye may be trickier than ye look.",
        "Grrrr! A pirate-worthy move! But I shall ESCAPE! YARRRR!",
      ],
      botWins: [
        "VICTORY BE MINE! Puzzle Pete WINS! YARRRR!! 🏴‍☠️⚔️",
        "HARR HARR HARR! The greatest pirate in chess TRIUMPHS!",
      ],
      playerWins: [
        "...Ye have defeated Puzzle Pete. Only the truly worthy can do that. Well done, ye scallywag.",
        "ARGH! The pirate has been defeated! Mark me words — YARRRR I'll be back!",
      ],
    },
  },

  {
    characterId: 'black-king',
    displayName: 'Black King',
    level: 9,
    depth: 3,
    randomness: 0.0,
    themeColor: '#dc2626',
    portraitSrc: '/images/characters/black-king/basic-fullbody.png',
    tagline: 'The ultimate boss. Unmatched. Undefeated.',
    aiCardIds: ['black-king_6legend', 'pirate-queen_6legend'],
    dialogue: {
      intro: [
        "You dare challenge the Black King? ...Amusing.",
        "Your courage is noted. Your defeat is inevitable.",
        "I have never lost. I do not intend to start today.",
      ],
      botCaptures: [
        "The darkness claims another.",
        "Your pieces fall before me.",
        "This is only the beginning.",
      ],
      playerCaptures: [
        "...",
        "You delay the inevitable.",
        "Unexpected. Irrelevant.",
      ],
      check: [
        "Check. Prepare yourself.",
        "The end draws near.",
        "Your king has nowhere left to run.",
      ],
      botInCheck: [
        "...Interesting.",
        "You have my full attention now.",
        "A clever move. But not enough.",
      ],
      botWins: [
        "The Black King reigns supreme. As always.",
        "It ends as it must. You fought with honour.",
        "Remember this defeat. Let it make you stronger.",
      ],
      playerWins: [
        "...",
        "You have defeated the Black King. There are no words for such an achievement.",
        "Well played. You are truly extraordinary.",
      ],
    },
  },
]

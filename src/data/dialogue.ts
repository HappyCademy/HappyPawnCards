export type CampaignChapter = 1 | 2 | 3

export interface DialoguePhases {
  pre: string[]
  postWin: string[]
  postLose: string[]
}

export interface CharDialogue {
  ch1: DialoguePhases
  ch2: DialoguePhases
  ch3: DialoguePhases
}

export interface FinaleScene {
  charId: string
  lines: string[]
}

export const FINALE_PRE_SCENES: FinaleScene[] = [
  {
    charId: 'black-king',
    lines: [
      "So. You've actually made it this far.",
      "Every step you took... was exactly where we needed you to be.",
      "Welcome to your final destination.",
    ],
  },
  {
    charId: 'puzzle-pete',
    lines: [
      "Allow me to calculate the odds. Three masterminds against one.",
      "I've run 47,000 simulations. You lose in all of them.",
      "Well — 46,999. The last one had a rounding error. I wouldn't count on it.",
    ],
  },
  {
    charId: 'kings-guard',
    lines: [
      "There is NO escape. Your allies are nowhere. No one is coming.",
      "Every exit is sealed. We planned for every possibility.",
      "KNEEL. Before. The King.",
    ],
  },
  {
    charId: 'black-king',
    lines: [
      "It's remarkable, really. How completely alone you are right now.",
      "All that effort. All those bonds you thought you were forging.",
      "...",
      "And at the very end — there's just you. And the three of us.",
    ],
  },
  {
    charId: 'happy-pawn',
    lines: [
      "OKAY STOPPING YOU RIGHT THERE——",
      "Hi!! Hi hi hi!! Sorry we're late, traffic was AWFUL — also we don't have roads, but ANYWAY—",
      "Did someone just say ALONE?! Because that is FACTUALLY INCORRECT right now!! 👋",
    ],
  },
  {
    charId: 'kings-guard',
    lines: [
      "Wh— WHERE DID YOU COME FROM—",
      "WE SEALED EVERY ROUTE!! YOUR MAJESTY, THIS WASN'T IN THE PLAN—",
    ],
  },
  {
    charId: 'chessbeard',
    lines: [
      "The greatest trap one can fall into... is believing your allies have forgotten you.",
      "I sensed this snare the moment it was laid.",
      "I taught you everything you know, old king. Did you really think I'd stay home?",
    ],
  },
  {
    charId: 'general-gambit',
    lines: [
      "LISTEN UP, SOLDIERS!!",
      "NO ONE — and I mean NO ONE — faces three opponents alone while I still breathe!!",
      "ON ME!! BATTLE FORMATION!! MOVE IT!!",
    ],
  },
  {
    charId: 'unipop',
    lines: [
      "Okay real talk — I predicted this three fights ago.",
      "Classic villain trap with theatrical monologue? That is textbook Act Three structure.",
      "I'm just glad someone here understands narrative convention. Also hi everyone. Let's absolutely demolish these guys.",
    ],
  },
  {
    charId: 'robin-rook',
    lines: [
      "...",
      "I'm here.",
      "That's all.",
    ],
  },
  {
    charId: 'crystal-queen',
    lines: [
      "You dared to corner our champion.",
      "Every throne has a limit to its patience.",
      "You have found mine. Face all of us... or step aside.",
    ],
  },
  {
    charId: 'puzzle-pete',
    lines: [
      "Updating... updating...",
      "FIVE additional combatants?! Survival odds have dropped to 2.1%. And falling.",
      "Your Majesty — with the greatest respect — I must formally OBJECT to these revised circumstances—",
    ],
  },
  {
    charId: 'black-king',
    lines: [
      "SILENCE, Puzzle Pete!! We are ROYALTY. We do NOT recalculate!!",
      "You brought your little friends? GOOD. More witnesses to your defeat.",
      "Come then. ALL OF YOU. FIGHT YOUR KING!!",
    ],
  },
  {
    charId: 'happy-pawn',
    lines: [
      "Okay TEAM, you heard the scary skeleton man!!",
      "We did NOT come all this way just to go home!!",
      "TOGETHER — let's show them what we're made of!! 🫸♟",
    ],
  },
]

export const FINALE_POST_WIN: FinaleScene[] = [
  {
    charId: 'black-king',
    lines: [
      "...",
      "Impossible.",
      "The king... does not fall.",
    ],
  },
  {
    charId: 'happy-pawn',
    lines: [
      "I mean... he kind of just did? We all watched it happen.",
      "WE DID IT!! WE ACTUALLY DID IT!!",
    ],
  },
  {
    charId: 'chessbeard',
    lines: [
      "Well fought. All of you.",
      "This is what it means to stand together.",
    ],
  },
  {
    charId: 'happy-pawn',
    lines: [
      "I'M SO PROUD OF THIS TEAM RIGHT NOW!!",
      "And of YOU most of all. You held on when it was just us against three.",
      "That's what made the difference. That's what brought everyone here. ♟",
    ],
  },
]

export const FINALE_POST_LOSE: FinaleScene[] = [
  {
    charId: 'black-king',
    lines: [
      "...Hm.",
      "Even with all your friends... you still fell short.",
      "Leave. Before I change my mind about your freedom.",
    ],
  },
  {
    charId: 'happy-pawn',
    lines: [
      "Hey. HEY. Look at me.",
      "We came THIS close. We'll come back stronger.",
      "I believe in you. We ALL do. Try again? 🫸",
    ],
  },
]

export const CAMPAIGN_DIALOGUE: Record<string, CharDialogue> = {
  'happy-pawn': {
    ch1: {
      pre: [
        'Hey hey HEY! Welcome to Happy Pawn World! I\'m Happy Pawn — obviously — and I am SO glad you\'re here!',
        'This whole kingdom is full of amazing characters. I\'m going to introduce you to every single one of them!',
        'Oh, and here\'s the twist: we don\'t play regular chess. Each of us has a special power that bends the rules. Mine\'s pretty fun, you\'ll see.',
        'So! Ready to kick things off? Let\'s rumble! ♟',
      ],
      postWin: [
        'Wow. Just... wow! You\'re incredible, you know that?',
        'Go get the others! I\'ll be rooting for you the whole way! ♟',
      ],
      postLose: [
        'Aww, so close! But you had me worried a few times there!',
        'Come back whenever you\'re ready. I\'ll be here!',
      ],
    },
    ch2: {
      pre: [
        'Oh wow, you\'re back! And this feels... legendary? Like, Legendary legendary?',
        'The stakes feel different this time. Is that just me? Either way — let\'s DO this!',
      ],
      postWin: [
        'Legendary me and you still won! You are on ANOTHER level.',
        'Now go show the rest what you\'ve got! I\'m so proud!',
      ],
      postLose: [
        'Legendary me is a little harder to beat, huh? You\'ll figure it out!',
        'I believe in you! I always have!',
      ],
    },
    ch3: {
      pre: [
        'SPACE! We\'re in SPACE! I have a whole space outfit. ...I look incredible, by the way.',
        'Third time we\'ve met — you, me, a chess board, a different universe. At this point we\'re basically best friends!',
      ],
      postWin: [
        'Three universes, three matches, three times you beat me. You\'re unstoppable!',
        'Now go save the rest of space — or whatever this is. You\'ve got this! 🚀',
      ],
      postLose: [
        'Ha! Space me is harder! That\'s honestly satisfying.',
        'Come back when you\'re ready. I\'ll be here doing zero-gravity chess drills.',
      ],
    },
  },

  'chessbeard': {
    ch1: {
      pre: [
        'Ah. A student approaches. Good.',
        'I will not go easy on you — that would be an insult. Show me what you know.',
      ],
      postWin: [
        '...You did listen. Well done.',
        'You have the makings of a true player. The road ahead is long — but you are ready for it.',
      ],
      postLose: [
        'Do not be discouraged. Defeat is the greatest teacher.',
        'Study what went wrong. Return when you have. I will be here.',
      ],
    },
    ch2: {
      pre: [
        'You\'ve grown since we last met. A new universe, but the same principles still apply.',
        'Legends are made through patience and understanding. Show me how much you\'ve learned.',
      ],
      postWin: [
        'Remarkable. You\'ve become something I did not expect.',
        'The student has surpassed the teacher. That is... the best possible outcome.',
      ],
      postLose: [
        'A legend does not fall easily. Keep going.',
        'There is no shame here — only the path forward.',
      ],
    },
    ch3: {
      pre: [
        'Space. Hm. The board still has 64 squares. The fundamentals remain unchanged.',
        'Come, then. Let us see how far your understanding carries you across the cosmos.',
      ],
      postWin: [
        'Extraordinary. Even the stars seem to agree.',
        'You have earned my deepest respect. Go — the Black King won\'t defeat himself.',
      ],
      postLose: [
        'The cosmos humbles even the very best.',
        'Reflect. Return. You know what to do.',
      ],
    },
  },

  'general-gambit': {
    ch1: {
      pre: [
        'Soldier! I\'ve heard about you. Let\'s see if the rumors hold up.',
        'I don\'t do half-measures — and neither should you. Eyes forward. Begin!',
      ],
      postWin: [
        'Ha! Outstanding! You passed — with flying colors!',
        'At ease. You\'ve earned your stripes. The campaign lies ahead — dismissed!',
      ],
      postLose: [
        'At ease. You weren\'t ready — but that changes with practice.',
        'Regroup. Study your failures. Report back when you\'re prepared.',
      ],
    },
    ch2: {
      pre: [
        'A legendary engagement. I expect more from you now — and I\'ll give more in return.',
        'This is no longer a test. This is war. Show me your finest strategy.',
      ],
      postWin: [
        'Brilliant. Simply brilliant. That\'s the caliber I needed to see.',
        'The alliance is stronger with you in it. Dismissed — and well done, soldier.',
      ],
      postLose: [
        'A calculated defeat is still a defeat. Reanalyze every move.',
        'The battlefield teaches what the classroom cannot. Back to training.',
      ],
    },
    ch3: {
      pre: [
        'Space warfare. The terrain changes — the tactics must adapt accordingly.',
        'I\'ve run the calculations for this universe. They favor neither of us. Exactly as I planned.',
      ],
      postWin: [
        'You adapted under pressure. That is the mark of a true commander.',
        'The stars are ours. Carry this victory into the final battle.',
      ],
      postLose: [
        'Even the best generals lose campaigns. Study the stars. Return.',
        'In space, there is no retreat — only regrouping.',
      ],
    },
  },

  'unipop': {
    ch1: {
      pre: [
        'OHMYGOSH a challenger!! WAIT — are we literally in a game right now?!',
        'Like I\'m fully aware I\'m a character in a game and... okay. OKAY. Focus. LET\'S GOOO!!',
      ],
      postWin: [
        'WHAT! NO! You BEAT me?! That is absolutely WILD!! But also... kind of amazing?! Congrats!!',
        'Okay okay I\'m taking notes. GREAT game. Go win the whole thing!!',
      ],
      postLose: [
        'YESSSSS!! Victory!! ...I should probably tone down the enthusiasm. Nah. See you around!!',
        'Better luck next time! I\'ll be cheering for you from behind the win screen!!',
      ],
    },
    ch2: {
      pre: [
        'Wait. WAIT. Have we... done this before?! I feel like we\'ve TOTALLY done this before!!',
        'Is this a SEQUEL?! It IS! It\'s literally a LEGENDARY sequel!! The multiverse!!',
      ],
      postWin: [
        'I LOST AGAIN! To the SAME PLAYER! In the SEQUEL! This is incredible!!',
        'Okay. Genuine respect. You are CARRYING this entire multiverse on your back.',
      ],
      postLose: [
        'LEGENDARY ME WINS! THE POWER UPGRADE WAS COMPLETELY REAL!!',
        'Enjoy your defeat! I\'ll be here, thriving, LEGENDARILY.',
      ],
    },
    ch3: {
      pre: [
        'SPACE! WE. ARE. IN. SPACE! This is our THIRD universe! Third! Are you counting?!',
        'At this point the writers are literally just giving us new outfits and calling it a sequel. I LOVE IT. Okay FIGHT TIME!!',
      ],
      postWin: [
        'THREE universes. THREE versions of me. ALL defeated by YOU. You are literally the main character!!',
        'I ship your victory arc SO hard!! Go finish this!! 🚀',
      ],
      postLose: [
        'SPACE ME IS THE STRONGEST VERSION!! THE UPGRADE IS ABSOLUTELY REAL!!',
        'Third time\'s the charm — for me, not you. Ha! ...Seriously though, great game.',
      ],
    },
  },

  'robin-rook': {
    ch1: {
      pre: [
        '...',
        'You found me. Fine. Let\'s see what you\'re made of.',
      ],
      postWin: [
        '...Hmph.',
        'Not bad. You\'ve got something. Don\'t waste it.',
      ],
      postLose: [
        '...',
        'Come back stronger.',
      ],
    },
    ch2: {
      pre: [
        'You again.',
        '...Good. I\'ve been waiting to see how you\'d handle a stronger version of me.',
      ],
      postWin: [
        '...You really are something.',
        'The path gets harder from here. But you know that already.',
      ],
      postLose: [
        '...',
        'Stronger. But not strong enough. Not yet.',
      ],
    },
    ch3: {
      pre: [
        'Space. Just another board with different stars.',
        'This time — I don\'t hold back.',
      ],
      postWin: [
        '...',
        'I\'ve been waiting a long time to find someone worth fighting. Thank you.',
      ],
      postLose: [
        '...',
        'The stars give no favors. Neither do I.',
      ],
    },
  },

  'crystal-queen': {
    ch1: {
      pre: [
        'Welcome, brave challenger. The realm has watched your journey with great interest.',
        'I do not fight out of pride or malice. But know this — I will not hold back.',
      ],
      postWin: [
        'You have proven yourself worthy of this realm\'s highest honor.',
        'Go forth. Darkness still waits beyond my court. The realm needs champions like you.',
      ],
      postLose: [
        'Rise. Every worthy ruler has fallen before they learned to stand.',
        'The realm will wait for you. Return when you are ready.',
      ],
    },
    ch2: {
      pre: [
        'Ah, you again. Or perhaps... another version of you? The multiverse is a curious place.',
        'A legendary court awaits. I wonder — has the journey changed you?',
      ],
      postWin: [
        'A legendary queen bested by a legendary challenger. It is... entirely fitting.',
        'The realm of legends stands behind you now. Go. Face what comes.',
      ],
      postLose: [
        'A legendary challenge demands legendary resolve. Find it within yourself.',
        'The realm endures. So shall you. Return.',
      ],
    },
    ch3: {
      pre: [
        'Three realms. Three versions of this moment. And still, the board remains the same.',
        'The stars themselves bear witness. Let us write the final chapter of this universe together.',
      ],
      postWin: [
        'Across three universes, you have proven yourself beyond all doubt.',
        'Go. The Black King is the last. End this — the realm is counting on you.',
      ],
      postLose: [
        'Even stars have gravity. You will find your way back.',
        'Three universes. Your story is not finished. Return.',
      ],
    },
  },

  'puzzle-pete': {
    ch1: {
      pre: [
        'Heheheheh. Another piece walks onto the board.',
        'Nothing personal, friend. I just get paid per capture. Strictly business.',
      ],
      postWin: [
        'Wha— my CALCULATIONS! WRONG?! That\'s... genuinely impressive.',
        'Hmph. The Black King won\'t be pleased. But you earned this one.',
      ],
      postLose: [
        'Heheh. Emotion is always the worst strategy. The math wins every time.',
        'Run along now — the Black King\'s patience has its limits.',
      ],
    },
    ch2: {
      pre: [
        'Oh wonderful, the legend returns for a rematch.',
        'My legendary calculations put your odds at approximately... 23%. Heheh.',
      ],
      postWin: [
        '23% was... apparently quite wrong. Fascinating. Truly fascinating.',
        'I\'ll need to recalibrate everything. Meanwhile — enjoy your win.',
      ],
      postLose: [
        'HAHAHA! Legendary Pete is not to be underestimated!!',
        'Better luck with your math next time.',
      ],
    },
    ch3: {
      pre: [
        'Space chess. Interesting variables. Calculating...',
        'My models say the outcome is... unclear. That never happens. This should be entertaining.',
      ],
      postWin: [
        'Unclear outcome resolved: I lost. Most unusual.',
        'You have completely disrupted my prediction model. That is... impressive.',
      ],
      postLose: [
        'Space favors cold calculation over raw chaos. As expected.',
        'Perhaps the Black King will give me a bonus for this one.',
      ],
    },
  },

  'kings-guard': {
    ch1: {
      pre: [
        'Halt. By royal decree of the Black King — none shall pass.',
        'I serve one master. I do not deviate. Prepare yourself.',
      ],
      postWin: [
        '...The Black King will hear of this.',
        'You are stronger than anticipated. Do not think this is over.',
      ],
      postLose: [
        'The Black King\'s rule is absolute.',
        'None have passed before. None will pass again.',
      ],
    },
    ch2: {
      pre: [
        'You dare return? The Black King anticipated your persistence.',
        'A legendary guard for a legendary intruder. This will not end the same way.',
      ],
      postWin: [
        'Twice. Twice you\'ve passed me. The King will be... most displeased.',
        'No matter. His reign is absolute — regardless.',
      ],
      postLose: [
        'A legendary guard does not fall.',
        'The king is protected. As always. As ever.',
      ],
    },
    ch3: {
      pre: [
        'Three universes and still you come for the throne. Relentless.',
        'The Black King commands — no exceptions, no mercy, no surrender.',
      ],
      postWin: [
        '...Then it falls to the King himself.',
        'You are more formidable than I was told. But the Black King does not fall so easily.',
      ],
      postLose: [
        'The king\'s guard never breaks.',
        'Turn back now. The throne is beyond your reach.',
      ],
    },
  },

  'black-king': {
    ch1: {
      pre: [
        'So. A challenger finally reaches my throne.',
        'I have watched every step of your journey. Impressive — for what it is worth. It ends here.',
      ],
      postWin: [
        '...',
        'You have bested the Black King.',
        'Savor it. We will meet again — and next time, I will be ready.',
      ],
      postLose: [
        'The throne stands eternal.',
        'You were entertaining. But not enough.',
      ],
    },
    ch2: {
      pre: [
        'A legendary confrontation. Fitting that we meet again at the very apex.',
        'I have accounted for your every known tactic. Let us see if you have anything new.',
      ],
      postWin: [
        '...',
        'Even in the realm of legends... you win.',
        'The multiverse is not in my favor today. But legends do not end at one defeat.',
      ],
      postLose: [
        'Legendary power. Legendary reign. Your defeat — legendary as well.',
        'The Black King does not yield.',
      ],
    },
    ch3: {
      pre: [
        'Three universes. And still you pursue me across the stars.',
        'Then let it end here — under the cosmos. One final game.',
      ],
      postWin: [
        '...',
        'The stars themselves have decided.',
        'You have won everything. Three universes, three thrones — the Crystal Queen\'s realm is safe.',
        '...Remember this. Because I will return.',
      ],
      postLose: [
        'The cosmos bends to the will of the Black King.',
        'Three universes. Three thrones. All mine.',
        'It is over. Go home.',
      ],
    },
  },
}

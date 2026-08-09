/**
 * isl-engine.js — Indriya ISL NLP Pipeline
 *
 * Pipeline (inspired by satyam9090 + AI4Bharat INCLUDE approach):
 *   Raw text → Normalise → Detect lang → Transliterate Hindi
 *           → Tokenise → POS tag → SOV reorder → ISL gloss sequence
 *
 * Entirely runs in the browser. Zero server round-trips.
 */

import { lookupWord, fingerspell, fingerspellHindi, HINDI_TO_ENGLISH } from './isl-dict.js';

// ── Contractions expander ─────────────────────────────────────────────────
// Real ISL interpreters work from full words, not contracted English
const CONTRACTIONS = {
  "i'm":      'i am',
  "i've":     'i have',
  "i'll":     'i will',
  "i'd":      'i would',
  "you're":   'you are',
  "you've":   'you have',
  "you'll":   'you will',
  "you'd":    'you would',
  "he's":     'he is',
  "she's":    'she is',
  "it's":     'it is',
  "we're":    'we are',
  "we've":    'we have',
  "we'll":    'we will',
  "they're":  'they are',
  "they've":  'they have',
  "they'll":  'they will',
  "don't":    'do not',
  "doesn't":  'does not',
  "didn't":   'did not',
  "won't":    'will not',
  "wouldn't": 'would not',
  "can't":    'cannot',
  "couldn't": 'could not',
  "shouldn't":'should not',
  "isn't":    'is not',
  "aren't":   'are not',
  "wasn't":   'was not',
  "weren't":  'were not',
  "haven't":  'have not',
  "hasn't":   'has not',
  "hadn't":   'had not',
  "there's":  'there is',
  "that's":   'that is',
  "what's":   'what is',
  "let's":    'let us',
  "who's":    'who is',
};

function expandContractions(text) {
  let t = text.toLowerCase();
  for (const [contraction, expanded] of Object.entries(CONTRACTIONS)) {
    // word-boundary safe replacement
    t = t.replace(new RegExp(`\\b${contraction.replace(/'/g, "'?")}\\b`, 'g'), expanded);
  }
  return t;
}

// ── Filler words (never meaningful in ISL) ───────────────────────────────
// Real interpreters drop these completely — they carry no semantic weight in ISL
const FILLERS = new Set([
  'um', 'uh', 'er', 'ah', 'oh', 'hmm', 'well', 'like', 'else',
  'anyway', 'basically', 'literally', 'actually', 'really', 'very',
  'quite', 'rather', 'somewhat', 'maybe', 'perhaps', 'probably',
  'kind', 'sort', 'mean', 'guess', 'suppose',
]);

// ── Stopwords (grammatical words with no ISL sign equivalent) ───────────
// NOTE: 'not', 'no', pronouns (i, you, he, me etc.) are KEPT — they have ISL equivalents
const STOPWORDS_EN = new Set([
  // Articles
  'the', 'a', 'an',
  // Copulas (to be) — ISL omits these
  'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being',
  // Aux verbs (do/have/will) — stripped; negation handled separately
  'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would',
  'can', 'could', 'may', 'might', 'shall', 'should',
  // Prepositions (mostly)
  'to', 'of', 'in', 'at', 'on', 'for', 'with', 'by', 'from', 'about',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'among', 'upon',
  // Conjunctions
  'and', 'or', 'but', 'so', 'yet', 'nor', 'although', 'though',
  'because', 'since', 'while', 'if', 'unless', 'until',
  // Determiners / demonstratives
  'this', 'that', 'these', 'those', 'its', 'their',
  // Adverbs with no ISL sign
  'then', 'than', 'too', 'also', 'just', 'only', 'even',
  'already', 'still', 'yet', 'again', 'never',
]);

// ── ISL Pronoun map ────────────────────────────────────────────────────────────────
// ISL pronouns are pointing gestures, but we display them as ME/YOU/HE/SHE/WE
const PRONOUN_MAP = {
  'i': 'ME', 'me': 'ME', 'my': 'MY', 'myself': 'ME',
  'you': 'YOU', 'your': 'YOUR', 'yourself': 'YOU',
  'he': 'HE', 'him': 'HIM', 'his': 'HIS',
  'she': 'SHE', 'her': 'HER',
  'we': 'WE', 'us': 'US', 'our': 'OUR',
  'they': 'THEY', 'them': 'THEM',
  'it': 'IT',
};

// ── Time markers (always go FIRST in ISL sentence) ─────────────────────────
const TIME_WORDS = new Set([
  'today', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening',
  'night', 'now', 'soon', 'later', 'always', 'sometimes', 'often',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
  'week', 'month', 'year', 'hour', 'minute', 'second', 'daily',
]);

// ── WH-question words (go to END in ISL) ─────────────────────────────────
const WH_WORDS = new Set(['what', 'who', 'where', 'when', 'why', 'how', 'which', 'whom']);

// ── Negation words ───────────────────────────────────────────────────────────────
const NEGATION_WORDS = new Set(['not', 'no', 'never', 'cannot', 'neither', 'nor']);

// ── Lightweight rule-based POS tagger ────────────────────────────────────────
const VERB_SUFFIXES = ['ing', 'ed', 'en', 'ify', 'ise', 'ize', 'ate'];
const VERB_ROOTS = new Set([
  'read', 'write', 'learn', 'study', 'understand', 'know', 'think',
  'answer', 'ask', 'tell', 'explain', 'listen', 'see', 'look', 'remember',
  'forget', 'repeat', 'complete', 'finish', 'speak', 'say', 'come', 'go',
  'sit', 'stand', 'walk', 'run', 'give', 'take', 'want', 'like', 'love',
  'eat', 'drink', 'work', 'play', 'help', 'stop', 'open', 'close', 'use',
  'show', 'make', 'solve', 'draw', 'check', 'mark', 'count', 'bring',
  'call', 'try', 'feel', 'get', 'put', 'set', 'let', 'keep', 'seem',
  'become', 'leave', 'turn', 'start', 'begin', 'end', 'happen', 'follow',
]);
const ADJ_SUFFIXES = ['ful', 'less', 'ous', 'ive', 'ic', 'al', 'ent', 'ant', 'able', 'ible'];
const ADJ_WORDS = new Set([
  'good', 'bad', 'big', 'small', 'new', 'old', 'fast', 'slow',
  'correct', 'wrong', 'easy', 'difficult', 'important', 'happy', 'sad',
  'angry', 'afraid', 'same', 'different', 'more', 'less', 'scared',
  'confused', 'tired', 'sick', 'healthy', 'hot', 'cold', 'warm', 'dry',
  'wet', 'loud', 'quiet', 'long', 'short', 'tall', 'young', 'beautiful',
  'ugly', 'famous', 'cheap', 'expensive', 'light', 'heavy', 'wide', 'narrow',
  'blind', 'deaf', 'fine', 'sorry', 'ready', 'late', 'early',
]);

/**
 * Guess part-of-speech for a single word.
 * @param {string} word — lowercase
 * @returns {'NOUN'|'VERB'|'ADJ'|'TIME'|'WH'|'NEG'|'PRONOUN'|'UNK'}
 */
function posTag(word) {
  if (TIME_WORDS.has(word))    return 'TIME';
  if (WH_WORDS.has(word))      return 'WH';
  if (NEGATION_WORDS.has(word)) return 'NEG';
  if (PRONOUN_MAP[word])       return 'PRONOUN';
  if (VERB_ROOTS.has(word))    return 'VERB';
  if (ADJ_WORDS.has(word))     return 'ADJ';
  for (const sfx of VERB_SUFFIXES) {
    if (word.length > sfx.length + 2 && word.endsWith(sfx)) return 'VERB';
  }
  for (const sfx of ADJ_SUFFIXES) {
    if (word.length > sfx.length + 2 && word.endsWith(sfx)) return 'ADJ';
  }
  return 'NOUN';
}

// ── SOV Reordering — ISL Grammar Engine ──────────────────────────────────────
/**
 * Convert English SVO text to ISL SOV gloss sequence.
 *
 * Real ISL grammar rules applied:
 *  1. Expand contractions (don't → do not, I'm → I am)
 *  2. Remove fillers (um, well, else, literally, actually...)
 *  3. Map pronouns to ISL forms (I→ME, you→YOU, he→HE)
 *  4. Strip pure stopwords (articles, copulas, aux verbs, prepositions)
 *  5. Reorder: TIME first → PRONOUN/NOUN/ADJ (topic) → VERB → NEG last
 *  6. WH-question words moved to END (ISL puts WHAT/WHO/WHERE at end)
 *  7. NOT/NEVER/NO always last (ISL negation rule)
 *
 * @param {string} text — normalised English text
 * @returns {string[]} — ISL gloss words, uppercase
 */
export function toISLGloss(text) {
  // Step 1: Expand contractions
  let normalised = expandContractions(text);

  // Step 2: Lowercase, remove non-word punctuation (preserve colons for HI: sentinel & Devanagari)
  normalised = normalised.toLowerCase().replace(/[^a-z:\u0900-\u097F\s]/g, ' ').trim();
  if (!normalised) return [];

  // Step 3: Tokenise
  const rawTokens = normalised.split(/\s+/).filter(w => w.length > 0);

  // Step 4: Strip fillers and stopwords, apply pronoun map
  const tokens = [];
  for (const w of rawTokens) {
    if (FILLERS.has(w)) continue;          // drop fillers (else, well, um...)
    if (STOPWORDS_EN.has(w)) continue;     // drop grammatical stopwords
    // Pronouns: map to ISL form
    if (PRONOUN_MAP[w]) {
      tokens.push({ word: PRONOUN_MAP[w].toLowerCase(), pos: 'PRONOUN', original: w });
      continue;
    }
    tokens.push({ word: w, pos: posTag(w), original: w });
  }

  if (!tokens.length) return [text.toUpperCase()];

  // Step 5: Split into ISL positional buckets
  const timeBucket     = tokens.filter(t => t.pos === 'TIME');    // TIME: sentence start
  const pronounBucket  = tokens.filter(t => t.pos === 'PRONOUN'); // Pronouns: after time
  const nounBucket     = tokens.filter(t => t.pos === 'NOUN');    // Nouns: topic
  const adjBucket      = tokens.filter(t => t.pos === 'ADJ');     // Adjectives: predicate
  const verbBucket     = tokens.filter(t => t.pos === 'VERB');    // Verbs: end of clause
  const negBucket      = tokens.filter(t => t.pos === 'NEG');     // Negation: VERY last
  const whBucket       = tokens.filter(t => t.pos === 'WH');      // WH words: very last
  const unkBucket      = tokens.filter(t => t.pos === 'UNK');

  // Step 6: ISL sentence order:
  //   TIME → PRONOUN → NOUN → ADJ → UNK → VERB → WH → NEG
  //   Example: "I don't know what to do tomorrow"
  //   Old: DONT IM KNOW WHAT DO TOMORROW
  //   New: TOMORROW ME KNOW WHAT NOT  (time first, negation last, WH before NEG)
  const ordered = [
    ...timeBucket,
    ...pronounBucket,
    ...nounBucket,
    ...adjBucket,
    ...unkBucket,
    ...verbBucket,
    ...whBucket,    // WH-question words come near end
    ...negBucket,   // NOT / NEVER / NO always absolutely last
  ];

  // Step 7: Deduplicate adjacent identical words (can happen from contraction expansion)
  const deduped = ordered.filter((t, i) => i === 0 || t.word !== ordered[i-1].word);

  return deduped.map(t => t.word.toUpperCase());
}

// ── Hindi detection ────────────────────────────────────────────────────────
/**
 * Check if the text contains Devanagari script (Hindi).
 */
export function isHindi(text) {
  return /[\u0900-\u097F]/.test(text);
}

// ── Hindi transliteration ──────────────────────────────────────────────────
/**
 * Translate Hindi words to English equivalents using built-in map.
 * Uses longest-match strategy for multi-word phrases.
 * @param {string} text — raw Hindi text
 * @returns {string} — English equivalent
 */
export function transliterateHindi(text) {
  let result = text;

  // Sort by length descending (longest phrase first) for greedy match
  const entries = Object.entries(HINDI_TO_ENGLISH).sort((a, b) => b[0].length - a[0].length);

  for (const [hindi, english] of entries) {
    // Use global replace (all occurrences)
    result = result.split(hindi).join(english);
  }

  // Remaining Devanagari tokens not in the dictionary:
  // Tag them with "HI:" prefix so processToISL routes them to fingerspellHindi()
  result = result.replace(/[\u0900-\u097F]+/g, w => `HI:${w}`);

  return result.trim();
}

// ── Multi-word GIF mapping (phrase → GIF key) ─────────────────────────────
// Allows full phrases spoken by teacher to match GIF files directly
const PHRASE_TO_GIF_KEY = {
  'sit down':               'SIT',
  'stand up':               'STAND',
  'good morning':           'MORNING',
  'good afternoon':         'AFTERNOON',
  'good question':          'QUESTION',
  'i am fine':              'FINE',
  'i am sorry':             'SORRY',
  'i am thinking':          'THINK',
  'i am tired':             'TIRED',
  'shall i help you':       'HELP',
  'nice to meet you':       'MEET',
  'dont worry':             'WORRY',
  'do not worry':           'WORRY',
  'what is your name':      'NAME',
  'what is the problem':    'PROBLEM',
  'open the door':          'OPEN',
  'you are wrong':          'WRONG',
  'sign language':          'SIGN',
  'did you finish homework':'HOMEWORK',
  'lets go for lunch':      'LUNCH',
  'be careful':             'CAREFUL',
  'take care':              'CARE',
  "what's up":              'WHATSUP',
  'whats up':               'WHATSUP',
  'i love to shop':         'LOVE',
  'i love':                 'LOVE',
  'are you angry':          'ANGRY',
  'are you hungry':         'HUNGRY',
  'do you have money':      'MONEY',
  'do you watch tv':        'TV',
  'flower is beautiful':    'FLOWER',
  'i am a clerk':           'CLERK',
  'i go to a theatre':      'THEATRE',
  'i like pink colour':     'PINK',
  'please call me later':   'CALL',
  'police station':         'POLICE',
  'post office':            'POST',
  'there was traffic jam':  'TRAFFIC',
  'where is the bathroom':  'BATHROOM',
  'where is the police station': 'POLICE',
  'what is todays date':    'DATE',
  "what is today's date":   'DATE',
  'what is your father do': 'FATHER',
};

// ── Full pipeline ──────────────────────────────────────────────────────────
/**
 * Master pipeline: raw speech text → ISL gesture sequence.
 *
 * @param {string} rawText — from mic / paste / clipboard
 * @param {'en'|'hi'} lang — language hint
 * @returns {{ gloss: string[], gestures: GestureEntry[] }}
 *   GestureEntry: { word: string, url: string, type: 'word'|'letter'|'gif'|'space', label: string }
 */
export function processToISL(rawText, lang = 'en') {
  let text = rawText.trim();
  if (!text) return { gloss: [], gestures: [] };

  // 1. Hindi transliteration if needed (auto-detects Devanagari)
  if (lang === 'hi' || /[\u0900-\u097F]/.test(rawText)) {
    text = transliterateHindi(text);
  }

  // 2. Check for whole-phrase GIF match first (only if pure English)
  if (!text.includes('HI:')) {
    const lc = text.toLowerCase().replace(/[^a-z\s']/g, '').trim();
    const phraseKey = PHRASE_TO_GIF_KEY[lc];
    if (phraseKey) {
      const entry = lookupWord(phraseKey);
      if (entry) {
        return {
          gloss: [phraseKey],
          gestures: [{ word: phraseKey, ...entry }]
        };
      }
    }
  }

  // 3. Get ISL gloss (SOV reorder)
  const gloss = toISLGloss(text);

  // 4. Build gesture sequence: word lookup → fingerspell fallback
  const gestures = [];
  for (const glossWord of gloss) {
    // Hindi words that didn't transliterate are tagged "HI:<devanagari>"
    if (glossWord.startsWith('HI:')) {
      const hindiWord = glossWord.slice(3); // strip sentinel
      const hindiFrames = fingerspellHindi(hindiWord);
      hindiFrames.forEach(l => gestures.push({ word: hindiWord, ...l }));
      continue;
    }
    const entry = lookupWord(glossWord);
    if (entry) {
      gestures.push({ word: glossWord, ...entry });
    } else {
      // Fingerspell each English letter with real A-Z hand photos
      const letters = fingerspell(glossWord);
      letters.forEach(l => gestures.push({ word: glossWord, ...l }));
    }
  }

  return { gloss, gestures };
}

// ── Inline SVG fallback (no network) ──────────────────────────────────────
/**
 * Generate a simple SVG data URL with a text label.
 * Used as onerror fallback so we never need external placeholder services.
 */
function makeFallbackSvg(label, bg = '#FFB800', fg = '#271900') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="200" viewBox="0 0 280 200">
    <rect width="280" height="200" fill="${bg}" rx="8"/>
    <text x="140" y="110" text-anchor="middle" dominant-baseline="middle"
          font-family="sans-serif" font-size="${label.length > 6 ? 28 : 38}"
          font-weight="800" fill="${fg}">${label}</text>
    <text x="140" y="170" text-anchor="middle"
          font-family="sans-serif" font-size="11" fill="${fg}" opacity="0.6">ISL Sign</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// ── Gesture Renderer ───────────────────────────────────────────────────────
/**
 * Animate a gesture sequence in the given container.
 *
 * @param {GestureEntry[]} gestures
 * @param {HTMLElement} imgEl — the <img> element for the gesture
 * @param {HTMLElement} labelEl — element for word label
 * @param {HTMLElement} pillContainer — container for gloss pills
 * @param {number} durationMs — time per sign (ms)
 * @param {Function} onDone — callback when sequence ends
 * @param {Function} onStart — callback when first sign renders
 * @returns {{ cancel: Function }} — call cancel() to stop
 */
export function animateGestures(gestures, imgEl, labelEl, pillContainer, durationMs, onDone, onStart) {
  let idx = 0;
  let timer = null;
  let cancelled = false;

  // Build pills
  pillContainer.innerHTML = '';
  gestures.forEach((g, i) => {
    // Group same-word letters into one pill
    const prevWord = gestures[i - 1]?.word;
    if (g.type === 'letter' && g.word === prevWord) return;
    const pill = document.createElement('span');
    pill.id = `gp-${i}`;
    pill.dataset.gestureWord = g.word;
    pill.className = 'isl-pill';
    pill.textContent = g.word;
    pillContainer.appendChild(pill);
  });

  function activatePill(currentWord) {
    pillContainer.querySelectorAll('.isl-pill').forEach(p => {
      if (p.dataset.gestureWord === currentWord) {
        p.classList.add('active');
        p.classList.remove('done');
      } else if (!p.classList.contains('done')) {
        p.classList.remove('active');
      }
    });
  }

  function completePill(currentWord) {
    pillContainer.querySelectorAll(`.isl-pill`).forEach(p => {
      if (p.dataset.gestureWord === currentWord) {
        p.classList.remove('active');
        p.classList.add('done');
      }
    });
  }

  function showNext() {
    if (cancelled || idx >= gestures.length) {
      if (!cancelled && onDone) onDone();
      return;
    }

    const g = gestures[idx];

    // Crossfade image
    imgEl.classList.remove('gesture-visible');
    imgEl.classList.add('gesture-fade-out');

    // Activate current pill
    activatePill(g.word);

    // Update label
    if (labelEl) {
      if (g.type === 'letter') {
        labelEl.textContent = `${g.word} — spelling: ${g.label}`;
      } else if (g.type === 'gif') {
        labelEl.textContent = g.word;
        labelEl.style.fontSize = '1.1rem';
      } else {
        // 'word' (SVG) or 'still' (vivit real image) — same display
        labelEl.textContent = g.word;
        labelEl.style.fontSize = '';
      }
    }

    // Load image
    if (g.url) {
      imgEl.src = '';
      imgEl.onerror = null;
      imgEl.onload = () => {
        imgEl.classList.remove('gesture-fade-out');
        imgEl.classList.add('gesture-visible');
      };
      imgEl.onerror = () => {
        // Image failed — show local text fallback SVG (no network needed)
        imgEl.src = makeFallbackSvg(g.label || '?', '#FFB800', '#271900');
        imgEl.classList.remove('gesture-fade-out');
        imgEl.classList.add('gesture-visible');
        imgEl.onerror = null;
      };
      imgEl.src = g.url;
    } else {
      // No URL (space/punctuation): show placeholder
      imgEl.src = makeFallbackSvg(g.label || '?', '#f1eee7', '#837560');
      imgEl.classList.remove('gesture-fade-out');
      imgEl.classList.add('gesture-visible');
    }

    if (onStart) onStart(g);

    // Check if this is last letter of a fingerspelled word — complete pill then
    const nextIsSameWord = gestures[idx + 1]?.word === g.word;
    if (!nextIsSameWord) {
      completePill(g.word);
    }

    idx++;

    // Speed per type:
    //  gif    → long hold (gif plays its own animation)
    //  letter → fast flash (real hand photo per letter)
    //  still  → standard (vivit landmark image — same as word SVG)
    //  word   → standard (SVG hand illustration)
    let delay;
    if (g.type === 'gif') {
      delay = Math.max(durationMs * 1.8, 2000);
    } else if (g.type === 'letter') {
      delay = Math.max(durationMs * 0.5, 600);
    } else {
      delay = durationMs; // 'word' or 'still'
    }
    timer = setTimeout(showNext, delay);
  }

  showNext();

  return {
    cancel() {
      cancelled = true;
      if (timer) clearTimeout(timer);
    }
  };
}

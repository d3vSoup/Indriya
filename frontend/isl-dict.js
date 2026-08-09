/**
 * isl-dict.js — Indriya ISL Gesture Dictionary
 *
 * Image sources (priority order):
 *  1. Animated GIFs  — satyam9090/Automatic-Indian-Sign-Language-Translator (86 real ISL GIFs)
 *     words/*.gif → real animated ISL gesture GIFs
 *  2. Vivit still frames — Kaggle kaushikyh/indian-sign-language-words-with-landmarks
 *     words_vivit/*.jpg → landmark-overlaid ISL word frames (224×224, from MOV)
 *  3. Fallback → null (triggers clean A-Z fingerspelling with 384×384 real hand photos)
 *  4. Hindi Devanagari fingerspelling — HindiSignImages48x48 dataset (40 characters)
 *     hindi_letters/<unicode-hex>.jpg → real ISL hand photos for each Hindi letter
 *
 * NOTE: All images are hosted on Supabase Storage CDN for public deployment.
 */

const CDN = 'https://cnwsrgqlpvxxnwsndhsm.supabase.co/storage/v1/object/public/isl-gestures';

const LETTERS_PATH       = `${CDN}/letters/`;
const WORDS_PATH         = `${CDN}/words/`;
const WORDS_VIVIT_PATH   = `${CDN}/words_vivit/`;
const HINDI_LETTERS_PATH = `${CDN}/hindi_letters/`;

// ── English Alphabet fingerspelling — 384×384 real high-contrast photos ─────
export const LETTER_PATHS = {};
'abcdefghijklmnopqrstuvwxyz'.split('').forEach(ch => {
  LETTER_PATHS[ch.toUpperCase()] = `${LETTERS_PATH}${ch}.jpg`;
});

// ── Hindi Devanagari fingerspelling — ASCII-safe CDN paths ───────────────────
// Files stored with ASCII romanized names (Supabase rejects Unicode keys)
// Key = Devanagari character, Value = full CDN URL
export const HINDI_LETTER_PATHS = {
  'अ': `${CDN}/hindi_signs/hi_a.jpg`,
  'आ': `${CDN}/hindi_signs/hi_aa.jpg`,
  'इ': `${CDN}/hindi_signs/hi_i.jpg`,
  'ई': `${CDN}/hindi_signs/hi_ii.jpg`,
  'उ': `${CDN}/hindi_signs/hi_u.jpg`,
  'ए': `${CDN}/hindi_signs/hi_e.jpg`,
  'ऐ': `${CDN}/hindi_signs/hi_ai.jpg`,
  'ओ': `${CDN}/hindi_signs/hi_o.jpg`,
  'क': `${CDN}/hindi_signs/hi_ka.jpg`,
  'ख': `${CDN}/hindi_signs/hi_kha.jpg`,
  'ग': `${CDN}/hindi_signs/hi_ga.jpg`,
  'घ': `${CDN}/hindi_signs/hi_gha.jpg`,
  'च': `${CDN}/hindi_signs/hi_cha.jpg`,
  'छ': `${CDN}/hindi_signs/hi_chha.jpg`,
  'ज': `${CDN}/hindi_signs/hi_ja.jpg`,
  'झ': `${CDN}/hindi_signs/hi_jha.jpg`,
  'ट': `${CDN}/hindi_signs/hi_ta2.jpg`,
  'ठ': `${CDN}/hindi_signs/hi_tha2.jpg`,
  'ड': `${CDN}/hindi_signs/hi_da2.jpg`,
  'ढ': `${CDN}/hindi_signs/hi_dha2.jpg`,
  'ण': `${CDN}/hindi_signs/hi_na2.jpg`,
  'त': `${CDN}/hindi_signs/hi_ta.jpg`,
  'थ': `${CDN}/hindi_signs/hi_tha.jpg`,
  'द': `${CDN}/hindi_signs/hi_da.jpg`,
  'ध': `${CDN}/hindi_signs/hi_dha.jpg`,
  'न': `${CDN}/hindi_signs/hi_na.jpg`,
  'प': `${CDN}/hindi_signs/hi_pa.jpg`,
  'फ': `${CDN}/hindi_signs/hi_pha.jpg`,
  'ब': `${CDN}/hindi_signs/hi_ba.jpg`,
  'भ': `${CDN}/hindi_signs/hi_bha.jpg`,
  'म': `${CDN}/hindi_signs/hi_ma.jpg`,
  'य': `${CDN}/hindi_signs/hi_ya.jpg`,
  'र': `${CDN}/hindi_signs/hi_ra.jpg`,
  'ल': `${CDN}/hindi_signs/hi_la.jpg`,
  'व': `${CDN}/hindi_signs/hi_va.jpg`,
  'श': `${CDN}/hindi_signs/hi_sha.jpg`,
  'स': `${CDN}/hindi_signs/hi_sa.jpg`,
  'ह': `${CDN}/hindi_signs/hi_ha.jpg`,
  'क्ष': `${CDN}/hindi_signs/hi_ksha.jpg`,
  'ज्ञ': `${CDN}/hindi_signs/hi_gya.jpg`,
};

// ── Word GIFs (86 animated ISL gesture GIFs from satyam9090) ──────────────
export const WORD_GIFS = {
  'ADDRESS':    'address.gif',
  'AHMEDABAD':  'ahemdabad.gif',
  'ALL':        'all.gif',
  'ANGRY':      'are you angry.gif',
  'HUNGRY':     'are you hungry.gif',
  'ASSAM':      'assam.gif',
  'AUGUST':     'august.gif',
  'BANANA':     'banana.gif',
  'BANARAS':    'banaras.gif',
  'BANGALORE':  'banglore.gif',
  'CAREFUL':    'be careful.gif',
  'BRIDGE':     'bridge.gif',
  'CAT':        'cat.gif',
  'CHRISTMAS':  'christmas.gif',
  'CHURCH':     'church.gif',
  'CLINIC':     'cilinic.gif',
  'DASARA':     'dasara.gif',
  'DECEMBER':   'december.gif',
  'HOMEWORK':   'did you finish homework.gif',
  'MONEY':      'do you have money.gif',
  'DRINK':      'do you want something to drink.gif',
  'TV':         'do you watch TV.gif',
  'WORRY':      'dont worry.gif',
  'FLOWER':     'flower is beautiful.gif',
  'AFTERNOON':  'good afternoon.gif',
  'MORNING':    'good morning.gif',
  'QUESTION':   'good question.gif',
  'GRAPES':     'grapes.gif',
  'HELLO':      'hello.gif',
  'HI':         'hello.gif',
  'HINDU':      'hindu.gif',
  'HYDERABAD':  'hyderabad.gif',
  'CLERK':      'i am a clerk.gif',
  'FINE':       'i am fine.gif',
  'SORRY':      'i am sorry.gif',
  'THINK':      'i am thinking.gif',
  'TIRED':      'i am tired.gif',
  'THEATRE':    'i go to a theatre.gif',
  'FORGOT':     'i had to say something but I forgot.gif',
  'PINK':       'i like pink colour.gif',
  'JOB':        'job.gif',
  'JULY':       'july.gif',
  'JUNE':       'june.gif',
  'KARNATAKA':  'karnataka.gif',
  'KERALA':     'kerala.gif',
  'KRISHNA':    'krishna.gif',
  'LUNCH':      'lets go for lunch.gif',
  'MANGO':      'mango.gif',
  'MAY':        'may.gif',
  'MILE':       'mile.gif',
  'MUMBAI':     'mumbai.gif',
  'NAGPUR':     'nagpur.gif',
  'MEET':       'nice to meet you.gif',
  'OPEN':       'open the door.gif',
  'PAKISTAN':   'pakistan.gif',
  'CALL':       'please call me later.gif',
  'POLICE':     'police station.gif',
  'POST':       'post office.gif',
  'PUNE':       'pune.gif',
  'PUNJAB':     'punjab.gif',
  'SATURDAY':   'saturday.gif',
  'HELP':       'shall I help you.gif',
  'TOGETHER':   'shall we go together tommorow.gif',
  'SHOP':       'shop.gif',
  'SIGN':       'sign language interpreter.gif',
  'SIT':        'sit down.gif',
  'STAND':      'stand up.gif',
  'CARE':       'take care.gif',
  'TEMPLE':     'temple.gif',
  'TRAFFIC':    'there was traffic jam.gif',
  'THURSDAY':   'thursday.gif',
  'TOILET':     'toilet.gif',
  'BATHROOM':   'where is the bathroom.gif',
  'TOMATO':     'tomato.gif',
  'TUESDAY':    'tuesday.gif',
  'USA':        'usa.gif',
  'VILLAGE':    'village.gif',
  'WEDNESDAY':  'wednesday.gif',
  'PROBLEM':    'what is the problem.gif',
  'DATE':       'what is today\'s date.gif',
  'FATHER':     'what is your father do.gif',
  'NAME':       'what is your name.gif',
  'WHATSUP':    'whats up.gif',
  'WRONG':      'you are wrong.gif',
};
// Resolve word GIF filenames to full CDN URLs
Object.keys(WORD_GIFS).forEach(k => {
  WORD_GIFS[k] = `${WORDS_PATH}${WORD_GIFS[k]}`;
});


// ── Vivit word still images (76 words, landmark-overlaid, 224×224) ─────────
// Extracted from ProcessedData_vivit .MOV files (Kaggle kaushikyh dataset)
export const WORD_STILLS = {
  'AFTERNOON':  'afternoon.jpg',
  'ANIMAL':     'animal.jpg',
  'BAD':        'bad.jpg',
  'BEAUTIFUL':  'beautiful.jpg',
  'BIG':        'big.jpg',
  'BIRD':       'bird.jpg',
  'BLIND':      'blind.jpg',
  'CAT':        'cat.jpg',
  'CHEAP':      'cheap.jpg',
  'CLOTHING':   'clothing.jpg',
  'COLD':       'cold.jpg',
  'COW':        'cow.jpg',
  'CURVED':     'curved.jpg',
  'DEAF':       'deaf.jpg',
  'DOG':        'dog.jpg',
  'DRESS':      'dress.jpg',
  'DRY':        'dry.jpg',
  'EVENING':    'evening.jpg',
  'EXPENSIVE':  'expensive.jpg',
  'FAMOUS':     'famous.jpg',
  'FAST':       'fast.jpg',
  'FEMALE':     'female.jpg',
  'FISH':       'fish.jpg',
  'FLAT':       'flat.jpg',
  'FRIDAY':     'friday.jpg',
  'GOOD':       'good.jpg',
  'HAPPY':      'happy.jpg',
  'HAT':        'hat.jpg',
  'HEALTHY':    'healthy.jpg',
  'HORSE':      'horse.jpg',
  'HOT':        'hot.jpg',
  'HOUR':       'hour.jpg',
  'LIGHT':      'light.jpg',
  'LONG':       'long.jpg',
  'LOOK':       'look.jpg',
  'LOVE':       'love.jpg',
  'LOOSE':      'loose.jpg',
  'LOUD':       'loud.jpg',
  'MINUTE':     'minute.jpg',
  'MONDAY':     'monday.jpg',
  'MONTH':      'month.jpg',
  'MORNING':    'morning.jpg',
  'MOUSE':      'mouse.jpg',
  'NARROW':     'narrow.jpg',
  'NEW':        'new.jpg',
  'NIGHT':      'night.jpg',
  'OLD':        'old.jpg',
  'PANT':       'pant.jpg',
  'POCKET':     'pocket.jpg',
  'QUIET':      'quiet.jpg',
  'SAD':        'sad.jpg',
  'SATURDAY':   'saturday.jpg',
  'SECOND':     'second.jpg',
  'SHIRT':      'shirt.jpg',
  'SHOES':      'shoes.jpg',
  'SHORT':      'short.jpg',
  'SICK':       'sick.jpg',
  'SKIRT':      'skirt.jpg',
  'SLOW':       'slow.jpg',
  'SMALL':      'small.jpg',
  'SUIT':       'suit.jpg',
  'SUNDAY':     'sunday.jpg',
  'T_SHIRT':    't_shirt.jpg',
  'TALL':       'tall.jpg',
  'THURSDAY':   'thursday.jpg',
  'TIME':       'time.jpg',
  'TODAY':      'today.jpg',
  'TOMORROW':   'tomorrow.jpg',
  'TUESDAY':    'tuesday.jpg',
  'UGLY':       'ugly.jpg',
  'WARM':       'warm.jpg',
  'WEDNESDAY':  'wednesday.jpg',
  'WEEK':       'week.jpg',
  'WET':        'wet.jpg',
  'WIDE':       'wide.jpg',
  'YEAR':       'year.jpg',
  'YESTERDAY':  'yesterday.jpg',
  'YOUNG':      'young.jpg',
  // ── Classroom words (critical for the demo) ───────────────────────────────
  'TEACHER':    'teacher.jpg',
  'STUDENT':    'student.jpg',
  'BOOK':       'book.jpg',
  'SCHOOL':     'school.jpg',
  'READ':       'read.jpg',
  'READS':      'read.jpg',
  'WRITE':      'write.jpg',
  'WRITES':     'write.jpg',
  'LEARN':      'learn.jpg',
  'UNDERSTAND': 'understand.jpg',
  'KNOW':       'know.jpg',
  'QUESTION':   'question.jpg',
  'ANSWER':     'answer.jpg',
  'NUMBER':     'number.jpg',
  'NAME':       'name.jpg',
  'WORD':       'word.jpg',
  'TABLE':      'table.jpg',
  'CHAIR':      'chair.jpg',
  'CLASS':      'class.jpg',
  'EXAM':       'exam.jpg',
  'WATER':      'water.jpg',
  'FOOD':       'food.jpg',
  'HOME':       'home.jpg',
  'SLEEP':      'sleep.jpg',
  'WALK':       'walk.jpg',
  'RUN':        'run.jpg',
  'TALK':       'talk.jpg',
  'LISTEN':     'listen.jpg',
  'SEE':        'see.jpg',
  'COME':       'come.jpg',
  'GO':         'go.jpg',
  'GIVE':       'give.jpg',
  'TAKE':       'take.jpg',
  'STOP':       'stop.jpg',
  'NOW':        'now.jpg',
  'YES':        'yes.jpg',
  'NO':         'no.jpg',
  'GOOD':       'good.jpg',   // alias already above, safe duplicate resolved by Object order
  'ME':         'me.jpg',
  'YOU':        'you.jpg',
  'HE':         'he.jpg',
  'SHE':        'she.jpg',
  'WE':         'we.jpg',
  'THEY':       'they.jpg',
  'MY':         'my.jpg',
  'YOUR':       'your.jpg',
  'HIM':        'him.jpg',
  'HER':        'her.jpg',
  'INDIA':      'india.jpg',
  'LANGUAGE':   'language.jpg',
  'SCIENCE':    'science.jpg',
  'MATHS':      'maths.jpg',
  'MATH':       'maths.jpg',
  'HISTORY':    'history.jpg',
  'GEOGRAPHY':  'geography.jpg',
  'ENGLISH':    'english.jpg',
  'HINDI':      'hindi.jpg',
};

// ── Hindi → English word map for classroom speech ─────────────────────────
export const HINDI_TO_ENGLISH = {
  // People
  'शिक्षक': 'teacher',  'अध्यापक': 'teacher',  'मास्टर': 'teacher',
  'छात्र': 'student',   'विद्यार्थी': 'student', 'बच्चा': 'student',
  'बच्चे': 'students',  'लड़का': 'boy',         'लड़की': 'girl',
  'आदमी': 'man',        'महिला': 'woman',       'माँ': 'mother',
  'पिता': 'father',     'दोस्त': 'friend',      'डॉक्टर': 'doctor',
  // Education
  'किताब': 'book',      'पुस्तक': 'book',       'किताबें': 'books',
  'पढ़ना': 'read',       'पढ़ता': 'reads',       'पढ़ती': 'reads',
  'पढ़ो': 'read',        'लिखना': 'write',       'लिखता': 'writes',
  'सीखना': 'learn',     'सीखो': 'learn',        'समझना': 'understand',
  'समझो': 'understand', 'जानना': 'know',        'जानो': 'know',
  'याद': 'remember',    'सोचना': 'think',       'सोचो': 'think',
  'सवाल': 'question',   'जवाब': 'answer',       'उत्तर': 'answer',
  'स्कूल': 'school',    'कक्षा': 'class',       'परीक्षा': 'exam',
  'होमवर्क': 'homework', 'बोर्ड': 'board',       'कॉलेज': 'college',
  'कलम': 'pen',         'पेंसिल': 'pencil',     'कागज': 'paper',
  'बस्ता': 'bag',       'कंप्यूटर': 'computer',  'फोन': 'phone',
  // Greetings & common
  'नमस्ते': 'hello',    'नमस्कार': 'hello',     'अलविदा': 'goodbye',
  'धन्यवाद': 'thankyou','शुक्रिया': 'thankyou', 'माफ करना': 'sorry',
  'माफ': 'sorry',       'हाँ': 'yes',           'नहीं': 'no',
  'ठीक है': 'okay',     'ठीक': 'okay',          'मदद': 'help',
  'रुको': 'stop',       'रुकिए': 'stop',        'अच्छा': 'good',
  'बुरा': 'wrong',      'सही': 'correct',       'गलत': 'wrong',
  // Pronouns
  'मैं': 'i',            'हम': 'we',            'तुम': 'you',
  'आप': 'you',          'वह': 'he',            'वे': 'they',
  'यह': 'this',         'ये': 'these',         'मेरा': 'my',
  'मेरी': 'my',          'मेरे': 'my',          'तुम्हारा': 'your',
  'आपका': 'your',        'हमारा': 'our',        'उनका': 'their',
  // Question words
  'क्या': 'what',       'कौन': 'who',          'कहाँ': 'where',
  'कब': 'when',         'क्यों': 'why',        'कैसे': 'how',
  // Actions & adjectives
  'जाओ': 'go',          'आओ': 'come',           'बैठो': 'sit',
  'खड़े': 'stand',      'चलो': 'walk',          'दो': 'give',
  'लो': 'take',         'चाहिए': 'want',        'खाना': 'food',
  'पानी': 'water',      'घर': 'home',           'नाम': 'name',
  'समय': 'time',        'आज': 'today',          'कल': 'tomorrow',
  'कल था': 'yesterday', 'अभी': 'now',           'फिर': 'again',
  'बड़ा': 'big',        'छोटा': 'small',        'नया': 'new',
  'पुराना': 'old',      'तेज़': 'fast',         'धीमा': 'slow',
  'खुश': 'happy',       'दुखी': 'sad',          'खोलो': 'open',
  'बंद करो': 'close',   'महत्वपूर्ण': 'important','मुश्किल': 'difficult',
  'आसान': 'easy',       'प्यार': 'love',        'पसंद': 'like',
  'भारत': 'india',      'भाषा': 'language',     'काम': 'work',
  'पढ़ेंगे': 'read',     'लिखेंगे': 'write',     'करेंगे': 'do',
  'देखेंगे': 'see',      'सुनेंगे': 'listen',    'बताएंगे': 'tell',

  // Hinglish (Romanised Hindi spoken transcription)
  'namaste': 'hello',    'namaskar': 'hello',   'shikshak': 'teacher',
  'adhyapak': 'teacher', 'chhatra': 'student',  'kitab': 'book',
  'pustak': 'book',      'padhna': 'read',      'padhte': 'reads',
  'padhenge': 'read',    'likhna': 'write',     'likhenge': 'write',
  'aaj': 'today',        'kal': 'tomorrow',     'haan': 'yes',
  'nahin': 'no',         'nahi': 'no',          'dhanyawad': 'thankyou',
  'shukriya': 'thankyou','madad': 'help',       'kaise': 'how',
  'kya': 'what',         'kahan': 'where',      'kab': 'when',
  'kyun': 'why',         'kaun': 'who',         'achha': 'good',
  'achhi': 'good',       'bohot': 'very',       'samajh': 'understand',
  'pyaar': 'love',       'bharat': 'india',     'shakti': 'power',
};

/**
 * Look up a word. Priority:
 *  1. Animated GIF (86 real ISL gesture GIFs)
 *  2. Vivit still image (76 landmark-overlaid real ISL frames)
 *  Returns null → caller will fingerspell letter by letter using real A-Z hand photos.
 *  (No cartoon SVG drawings used).
 */
export function lookupWord(word) {
  const key = word.toUpperCase();

  // 1. Animated GIF — WORD_GIFS values are now full CDN URLs
  const gifUrl = WORD_GIFS[key];
  if (gifUrl) {
    return { url: gifUrl, type: 'gif', label: key };
  }

  // 2. Vivit real landmark image (still local until CDN upload)
  const stillFile = WORD_STILLS[key];
  if (stillFile) {
    return { url: `${WORDS_VIVIT_PATH}${stillFile}`, type: 'still', label: key };
  }

  // 3. Fallback: null -> fingerspell with real hand photos
  return null;
}

/**
 * Fingerspelling (English) — uses 384×384 real ISL hand photos (A-Z).
 */
export function fingerspell(word) {
  return word.toUpperCase().split('').map(ch => {
    if (!/[A-Z]/.test(ch)) return null;
    const path = LETTER_PATHS[ch];
    return path ? { url: path, type: 'letter', label: ch } : null;
  }).filter(Boolean);
}

/**
 * Hindi Devanagari fingerspelling — uses HindiSignImages48x48 real hand photos.
 * Breaks a Hindi word into individual Devanagari characters (grapheme clusters)
 * and returns gesture frames for each one. Unknown characters are skipped.
 * Multi-char ligatures (क्ष, ज्ञ) are handled by matching longest first.
 */
export function fingerspellHindi(word) {
  const frames = [];
  // Try multi-char ligatures first, then single chars
  const multiChar = ['क्ष', 'ज्ञ'];
  let i = 0;
  const chars = [...word]; // spread into Unicode grapheme array
  while (i < chars.length) {
    // Try to match a 2-char ligature at position i
    const twoChar = chars[i] + (chars[i + 1] || '') + (chars[i + 2] || '');
    const ligature = multiChar.find(l => twoChar.startsWith(l));
    if (ligature) {
      const url = HINDI_LETTER_PATHS[ligature]; // now a full CDN URL
      if (url) frames.push({ url, type: 'hindi_letter', label: ligature });
      i += [...ligature].length;
      continue;
    }
    const ch = chars[i];
    // Skip virama (halant ्) and vowel diacritics — they attach to the previous consonant
    const skipMarks = /[\u094D\u093E-\u094C\u0902\u0903]/;
    if (!skipMarks.test(ch)) {
      const url = HINDI_LETTER_PATHS[ch]; // now a full CDN URL
      if (url) frames.push({ url, type: 'hindi_letter', label: ch });
    }
    i++;
  }
  return frames;
}

// Skill-building exercises: Wo? / Wohin? / Woher?, prepositions and declension.
//
// Exercise shape:
//   id          unique string
//   drill       which drill it belongs to (see DRILLS below)
//   type        'choice' (pick an option), 'fill' (type the missing word(s))
//               or 'order' (tap shuffled word chips into the right sentence)
//   tokens      order only: the word chips, in the correct order, no punctuation
//   prompt      sentence with ___ for the blank (fill) or the full sentence (choice)
//   hint        shown under the prompt, e.g. the noun's gender or the article type
//   options     choice only: the buttons to show
//   answers     accepted answers (first one is the "canonical" one shown as correct)
//   case        'nominativ' | 'akkusativ' | 'dativ' | 'genitiv' | null (for Woher etc.)
//   explanation short rule explanation shown after answering
//
// Fill-in answers are compared case-insensitively, with whitespace collapsed
// and ß/ss treated as equal, so "grossen" matches "großen".

export const DRILLS = [
  {
    id: 'wo-wohin',
    name: 'Wo? Wohin? Woher?',
    icon: '🧭',
    description:
      'Read a sentence and decide which question it answers. Trains the position-vs-movement instinct that everything else builds on.',
    roundSize: 10
  },
  {
    id: 'wechsel',
    name: 'Two-way prepositions',
    icon: '↔️',
    description:
      'an, auf, hinter, in, neben, über, unter, vor, zwischen: Dativ for Wo?, Akkusativ for Wohin?. Fill in the correct article.',
    roundSize: 10
  },
  {
    id: 'fixed',
    name: 'Fixed-case prepositions',
    icon: '📌',
    description:
      'Dativ: aus, bei, mit, nach, seit, von, zu, gegenüber. Akkusativ: durch, für, gegen, ohne, um. Fill in the correct article.',
    roundSize: 10
  },
  {
    id: 'adjective',
    name: 'Adjectives after prepositions',
    icon: '🎨',
    description:
      'Put the preposition, the article and the adjective ending together. Type article + adjective, e.g. "dem alten".',
    roundSize: 10
  },
  {
    id: 'nebensatz',
    name: 'Nebensätze',
    icon: '🔗',
    description:
      'weil, dass, wenn, ob, obwohl: the conjugated verb goes to the END of the clause. Build sentences, pick conjunctions and place verbs.',
    roundSize: 10
  },
  {
    id: 'zu-infinitiv',
    name: 'zu + Infinitiv',
    icon: '🎯',
    description:
      'Lust haben, vergessen, versuchen, um … zu: when "zu" is needed, where it goes in separable verbs, and when modals drop it.',
    roundSize: 10
  },
  {
    id: 'mixed',
    name: 'Mixed review',
    icon: '🎲',
    description: 'A random mix of everything. Good for a quick daily warm-up once the single drills feel easy.',
    roundSize: 15
  }
]

const WO = 'Wo?'
const WOHIN = 'Wohin?'
const WOHER = 'Woher?'
const QUESTION_OPTIONS = [WO, WOHIN, WOHER]

// ---------------------------------------------------------------------------
// Drill 1: Wo? / Wohin? / Woher?
// ---------------------------------------------------------------------------
const woWohin = [
  // Full sentences: which question does the sentence answer?
  ['ww-01', 'Das Buch liegt auf dem Tisch.', WO, 'dativ', '"liegen" describes a position, not a movement. Position → Wo? → Dativ (auf dem Tisch).'],
  ['ww-02', 'Ich lege das Buch auf den Tisch.', WOHIN, 'akkusativ', '"legen" moves the book somewhere. Movement to a place → Wohin? → Akkusativ (auf den Tisch).'],
  ['ww-03', 'Wir fahren nach Berlin.', WOHIN, null, '"fahren nach" is a direction. Wohin? For cities and most countries you use "nach".'],
  ['ww-04', 'Sie kommt aus der Schweiz.', WOHER, 'dativ', '"kommen aus" is origin → Woher?. "aus" always takes Dativ: aus der Schweiz.'],
  ['ww-05', 'Er wohnt in einer kleinen Stadt.', WO, 'dativ', '"wohnen" is a position → Wo? → Dativ (in einer kleinen Stadt).'],
  ['ww-06', 'Die Kinder gehen in die Schule.', WOHIN, 'akkusativ', '"gehen in" is movement into a place → Wohin? → Akkusativ (in die Schule).'],
  ['ww-07', 'Die Kinder sind in der Schule.', WO, 'dativ', '"sein" just states where they are → Wo? → Dativ (in der Schule).'],
  ['ww-08', 'Ich hänge das Bild an die Wand.', WOHIN, 'akkusativ', '"hängen" with a direct object = putting something somewhere → Wohin? → Akkusativ (an die Wand).'],
  ['ww-09', 'Das Bild hängt an der Wand.', WO, 'dativ', '"hängen" without an object = the picture is hanging (position) → Wo? → Dativ (an der Wand).'],
  ['ww-10', 'Wir sitzen im Garten.', WO, 'dativ', '"sitzen" is a position → Wo?. "im" = in + dem (Dativ).'],
  ['ww-11', 'Setz dich neben mich!', WOHIN, 'akkusativ', '"sich setzen" = to sit down (a movement) → Wohin? → Akkusativ (neben mich).'],
  ['ww-12', 'Er kommt gerade vom Arzt.', WOHER, 'dativ', '"vom" = von + dem: he is coming FROM the doctor → Woher?. "von" always takes Dativ.'],
  ['ww-13', 'Sie stellt die Vase auf den Tisch.', WOHIN, 'akkusativ', '"stellen" = to put (upright). Movement → Wohin? → Akkusativ (auf den Tisch).'],
  ['ww-14', 'Die Katze schläft unter dem Bett.', WO, 'dativ', '"schlafen" is a position → Wo? → Dativ (unter dem Bett).'],
  ['ww-15', 'Wir fliegen morgen in die USA.', WOHIN, 'akkusativ', 'Countries with an article (die USA, die Schweiz, die Türkei) use "in" + Akkusativ for direction → Wohin?.'],
  ['ww-16', 'Ich arbeite bei einer großen Firma.', WO, 'dativ', '"arbeiten bei" = position → Wo?. "bei" always takes Dativ.'],
  ['ww-17', 'Stell die Tasche hinter die Tür!', WOHIN, 'akkusativ', '"stellen" = to put somewhere → Wohin? → Akkusativ (hinter die Tür).'],
  ['ww-18', 'Die Lampe steht zwischen dem Sofa und dem Sessel.', WO, 'dativ', '"stehen" is a position → Wo? → Dativ (zwischen dem Sofa und dem Sessel).'],
  ['ww-19', 'Er läuft über die Straße.', WOHIN, 'akkusativ', 'Crossing the street is movement from one side to the other → Wohin? → Akkusativ (über die Straße).'],
  ['ww-20', 'Wir gehen ins Kino.', WOHIN, 'akkusativ', '"ins" = in + das (Akkusativ). Going INTO the cinema → Wohin?.'],
  ['ww-21', 'Ich komme aus dem Büro.', WOHER, 'dativ', '"kommen aus" = origin → Woher?. "aus" always takes Dativ (aus dem Büro).'],
  ['ww-22', 'Sie legt sich ins Bett.', WOHIN, 'akkusativ', '"sich legen" = to lie down (movement) → Wohin? → ins Bett (Akkusativ).'],
  ['ww-23', 'Er liegt im Bett.', WO, 'dativ', '"liegen" = to be lying (position) → Wo? → im Bett (Dativ).'],
  ['ww-24', 'Der Zug kommt aus München.', WOHER, null, 'Origin → Woher?. Cities use "aus" for origin and "nach" for destination.'],
  // Question form: which question word is missing?
  ['ww-25', '___ liegt das Buch? – Auf dem Tisch.', WO, 'dativ', 'The answer "auf dem Tisch" is Dativ, so the question is about position → Wo?.'],
  ['ww-26', '___ fährst du am Wochenende? – Nach München.', WOHIN, null, '"nach München" is a destination → Wohin?.'],
  ['ww-27', '___ kommst du? – Aus Polen.', WOHER, null, '"aus Polen" is an origin → Woher?.'],
  ['ww-28', '___ wohnen deine Eltern? – In Hamburg.', WO, null, '"wohnen" is a position → Wo?.'],
  ['ww-29', '___ hängst du das Bild? – Über das Sofa.', WOHIN, 'akkusativ', '"über das Sofa" is Akkusativ, so the question is about movement → Wohin?.'],
  ['ww-30', '___ hast du den Schlüssel gelegt? – In die Schublade.', WOHIN, 'akkusativ', '"legen" + "in die Schublade" (Akkusativ) = movement → Wohin?.'],
  ['ww-31', '___ ist der Schlüssel? – In der Schublade.', WO, 'dativ', '"sein" + "in der Schublade" (Dativ) = position → Wo?.'],
  ['ww-32', '___ gehst du heute Abend? – Zu Anna.', WOHIN, 'dativ', '"zu Anna" is a destination → Wohin?. Note: "zu" always takes Dativ even for direction.'],
  ['ww-33', '___ kommt dieser Käse? – Aus Frankreich.', WOHER, null, '"aus Frankreich" is an origin → Woher?.'],
  ['ww-34', '___ steht das Auto? – Vor dem Haus.', WO, 'dativ', '"stehen" is a position → Wo? → vor dem Haus (Dativ).']
].map(([id, prompt, answer, kase, explanation]) => ({
  id,
  drill: 'wo-wohin',
  type: 'choice',
  prompt,
  hint: 'Which question does this answer?',
  options: QUESTION_OPTIONS,
  answers: [answer],
  case: kase,
  explanation
}))

// ---------------------------------------------------------------------------
// Drill 2: Wechselpräpositionen (two-way prepositions)
// [id, prompt, hint, answers, case, explanation]
// ---------------------------------------------------------------------------
const wechsel = [
  ['wp-01', 'Das Buch liegt auf ___ Tisch.', 'der Tisch', ['dem'], 'dativ', 'liegen = position → Wo? → Dativ. der Tisch → dem Tisch.'],
  ['wp-02', 'Ich lege das Buch auf ___ Tisch.', 'der Tisch', ['den'], 'akkusativ', 'legen = movement → Wohin? → Akkusativ. der Tisch → den Tisch.'],
  ['wp-03', 'Die Lampe steht neben ___ Bett.', 'das Bett', ['dem'], 'dativ', 'stehen = position → Wo? → Dativ. das Bett → dem Bett.'],
  ['wp-04', 'Ich stelle die Lampe neben ___ Bett.', 'das Bett', ['das'], 'akkusativ', 'stellen = movement → Wohin? → Akkusativ. Neuter stays "das".'],
  ['wp-05', 'Das Bild hängt an ___ Wand.', 'die Wand', ['der'], 'dativ', 'hängen (no object) = position → Wo? → Dativ. die Wand → der Wand.'],
  ['wp-06', 'Er hängt das Bild an ___ Wand.', 'die Wand', ['die'], 'akkusativ', 'hängen + object = movement → Wohin? → Akkusativ. Feminine stays "die".'],
  ['wp-07', 'Die Kinder spielen in ___ Garten.', 'der Garten', ['dem', 'im'], 'dativ', 'spielen happens IN a place → Wo? → Dativ. in dem = im.'],
  ['wp-08', 'Die Kinder laufen in ___ Garten.', 'der Garten', ['den'], 'akkusativ', 'laufen in = running INTO → Wohin? → Akkusativ. der Garten → den Garten.'],
  ['wp-09', 'Wir sitzen vor ___ Fernseher.', 'der Fernseher', ['dem'], 'dativ', 'sitzen = position → Wo? → Dativ.'],
  ['wp-10', 'Setz dich vor ___ Fernseher!', 'der Fernseher', ['den'], 'akkusativ', 'sich setzen = sitting DOWN (movement) → Wohin? → Akkusativ.'],
  ['wp-11', 'Die Katze schläft unter ___ Stuhl.', 'der Stuhl', ['dem'], 'dativ', 'schlafen = position → Wo? → Dativ.'],
  ['wp-12', 'Die Katze läuft unter ___ Stuhl.', 'der Stuhl', ['den'], 'akkusativ', 'laufen unter = movement to under → Wohin? → Akkusativ.'],
  ['wp-13', 'Das Auto steht hinter ___ Haus.', 'das Haus', ['dem'], 'dativ', 'stehen = position → Wo? → Dativ. das Haus → dem Haus.'],
  ['wp-14', 'Er fährt das Auto hinter ___ Haus.', 'das Haus', ['das'], 'akkusativ', 'fahren (with destination) = movement → Wohin? → Akkusativ. Neuter stays "das".'],
  ['wp-15', 'Die Vase steht zwischen ___ Büchern.', 'die Bücher (Plural)', ['den'], 'dativ', 'stehen = position → Dativ. Dativ plural = den + noun gets -n: den Büchern.'],
  ['wp-16', 'Ich stelle die Vase zwischen ___ Bücher.', 'die Bücher (Plural)', ['die'], 'akkusativ', 'stellen = movement → Akkusativ. Plural Akkusativ stays "die".'],
  ['wp-17', 'Die Lampe hängt über ___ Tisch.', 'der Tisch', ['dem'], 'dativ', 'hängen (no object) = position → Wo? → Dativ.'],
  ['wp-18', 'Ich hänge die Lampe über ___ Tisch.', 'der Tisch', ['den'], 'akkusativ', 'hängen + object = movement → Wohin? → Akkusativ.'],
  ['wp-19', 'Wir gehen heute in ___ Kino.', 'das Kino', ['das', 'ins'], 'akkusativ', 'gehen in = movement INTO → Wohin? → Akkusativ. in das = ins.'],
  ['wp-20', 'Wir sind gerade in ___ Kino.', 'das Kino', ['dem', 'im'], 'dativ', 'sein = position → Wo? → Dativ. in dem = im.'],
  ['wp-21', 'Sie geht an ___ Fenster.', 'das Fenster', ['das', 'ans'], 'akkusativ', 'gehen an = walking TO → Wohin? → Akkusativ. an das = ans.'],
  ['wp-22', 'Sie steht an ___ Fenster.', 'das Fenster', ['dem', 'am'], 'dativ', 'stehen = position → Wo? → Dativ. an dem = am.'],
  ['wp-23', 'Ich wohne in ___ Stadt.', 'die Stadt', ['der'], 'dativ', 'wohnen = position → Wo? → Dativ. die Stadt → der Stadt.'],
  ['wp-24', 'Ich fahre in ___ Stadt.', 'die Stadt', ['die'], 'akkusativ', 'fahren in = movement INTO → Wohin? → Akkusativ. Feminine stays "die".'],
  ['wp-25', 'Der Hund liegt auf ___ Sofa.', 'das Sofa', ['dem'], 'dativ', 'liegen = position → Wo? → Dativ.'],
  ['wp-26', 'Der Hund springt auf ___ Sofa.', 'das Sofa', ['das', 'aufs'], 'akkusativ', 'springen auf = jumping ONTO → Wohin? → Akkusativ. auf das = aufs.'],
  ['wp-27', 'Die Schuhe stehen unter ___ Bank.', 'die Bank', ['der'], 'dativ', 'stehen = position → Wo? → Dativ. die Bank → der Bank.'],
  ['wp-28', 'Stell die Schuhe unter ___ Bank!', 'die Bank', ['die'], 'akkusativ', 'stellen = movement → Wohin? → Akkusativ.'],
  ['wp-29', 'Er sitzt neben ___ Kindern.', 'die Kinder (Plural)', ['den'], 'dativ', 'sitzen = position → Dativ plural: den Kindern (noun gets -n).'],
  ['wp-30', 'Er setzt sich neben ___ Kinder.', 'die Kinder (Plural)', ['die'], 'akkusativ', 'sich setzen = movement → Akkusativ plural stays "die".'],
  ['wp-31', 'Die Studenten sind in ___ Bibliothek.', 'die Bibliothek', ['der'], 'dativ', 'sein = position → Wo? → Dativ. die Bibliothek → der Bibliothek.'],
  ['wp-32', 'Die Studenten gehen in ___ Bibliothek.', 'die Bibliothek', ['die'], 'akkusativ', 'gehen in = movement INTO → Wohin? → Akkusativ.'],
  ['wp-33', 'Ich hänge den Mantel in ___ Schrank.', 'der Schrank', ['den'], 'akkusativ', 'hängen + object = movement → Wohin? → Akkusativ. der Schrank → den Schrank.'],
  ['wp-34', 'Der Mantel hängt in ___ Schrank.', 'der Schrank', ['dem', 'im'], 'dativ', 'hängen (no object) = position → Wo? → Dativ.'],
  ['wp-35', 'Wir fahren an ___ See.', 'der See', ['den'], 'akkusativ', 'fahren an = movement TO → Wohin? → Akkusativ. der See → den See.'],
  ['wp-36', 'Wir wohnen an ___ See.', 'der See', ['dem', 'am'], 'dativ', 'wohnen = position → Wo? → Dativ. an dem = am.'],
  ['wp-37', 'Sie legt das Handy in ___ Tasche.', 'die Tasche', ['die'], 'akkusativ', 'legen = movement → Wohin? → Akkusativ.'],
  ['wp-38', 'Das Handy ist in ___ Tasche.', 'die Tasche', ['der'], 'dativ', 'sein = position → Wo? → Dativ. die Tasche → der Tasche.'],
  ['wp-39', 'Der Ball rollt unter ___ Auto.', 'das Auto', ['das'], 'akkusativ', 'rollen unter = rolling TO under → Wohin? → Akkusativ. Neuter stays "das".'],
  ['wp-40', 'Der Ball liegt unter ___ Auto.', 'das Auto', ['dem'], 'dativ', 'liegen = position → Wo? → Dativ.'],
  // With ein-words
  ['wp-41', 'Ich stelle den Stuhl neben ___ Tisch.', 'ein + der Tisch', ['einen'], 'akkusativ', 'stellen = movement → Akkusativ. Masculine ein → einen.'],
  ['wp-42', 'Der Stuhl steht neben ___ Tisch.', 'ein + der Tisch', ['einem'], 'dativ', 'stehen = position → Dativ. Masculine ein → einem.'],
  ['wp-43', 'Sie wohnt in ___ Dorf.', 'ein + das Dorf', ['einem'], 'dativ', 'wohnen = position → Dativ. Neuter ein → einem.'],
  ['wp-44', 'Sie zieht in ___ Dorf.', 'ein + das Dorf', ['ein'], 'akkusativ', 'ziehen in = moving INTO → Akkusativ. Neuter ein stays "ein".'],
  ['wp-45', 'Er hängt die Jacke über ___ Stuhl.', 'ein + der Stuhl', ['einen'], 'akkusativ', 'hängen + object = movement → Akkusativ. Masculine ein → einen.'],
  ['wp-46', 'Die Jacke hängt über ___ Stuhl.', 'ein + der Stuhl', ['einem'], 'dativ', 'hängen (no object) = position → Dativ. Masculine ein → einem.'],
  ['wp-47', 'Ich sitze auf ___ Bank.', 'ein + die Bank', ['einer'], 'dativ', 'sitzen = position → Dativ. Feminine eine → einer.'],
  ['wp-48', 'Ich setze mich auf ___ Bank.', 'ein + die Bank', ['eine'], 'akkusativ', 'sich setzen = movement → Akkusativ. Feminine stays "eine".'],
  ['wp-49', 'Das Kind versteckt sich hinter ___ Baum.', 'ein + der Baum', ['einem'], 'dativ', 'sich verstecken = being hidden (position) → Wo? → Dativ. ein → einem.'],
  ['wp-50', 'Das Kind läuft hinter ___ Baum.', 'ein + der Baum', ['einen'], 'akkusativ', 'laufen hinter = running TO behind → Wohin? → Akkusativ. ein → einen.']
].map(([id, prompt, hint, answers, kase, explanation]) => ({
  id,
  drill: 'wechsel',
  type: 'fill',
  prompt,
  hint,
  answers,
  case: kase,
  explanation
}))

// ---------------------------------------------------------------------------
// Drill 3: Fixed-case prepositions
// ---------------------------------------------------------------------------
const fixed = [
  ['fp-01', 'Ich fahre mit ___ Bus.', 'der Bus', ['dem'], 'dativ', '"mit" always takes Dativ. der Bus → dem Bus.'],
  ['fp-02', 'Sie kommt aus ___ Schweiz.', 'die Schweiz', ['der'], 'dativ', '"aus" always takes Dativ. die Schweiz → der Schweiz.'],
  ['fp-03', 'Das Geschenk ist für ___ Mann.', 'der Mann', ['den'], 'akkusativ', '"für" always takes Akkusativ. der Mann → den Mann.'],
  ['fp-04', 'Wir gehen durch ___ Park.', 'der Park', ['den'], 'akkusativ', '"durch" always takes Akkusativ. der Park → den Park.'],
  ['fp-05', 'Er wohnt noch bei ___ Eltern.', 'sein + die Eltern (Plural)', ['seinen'], 'dativ', '"bei" always takes Dativ. Dativ plural: seinen Eltern.'],
  ['fp-06', 'Ich gehe zu ___ Arzt.', 'der Arzt', ['dem', 'zum'], 'dativ', '"zu" always takes Dativ, even though it is a direction. zu dem = zum.'],
  ['fp-07', 'Das ist ein Brief von ___ Lehrerin.', 'die Lehrerin', ['der'], 'dativ', '"von" always takes Dativ. die Lehrerin → der Lehrerin.'],
  ['fp-08', 'Ohne ___ Schlüssel komme ich nicht rein.', 'der Schlüssel', ['den'], 'akkusativ', '"ohne" always takes Akkusativ. der Schlüssel → den Schlüssel.'],
  ['fp-09', 'Wir laufen um ___ See.', 'der See', ['den'], 'akkusativ', '"um" always takes Akkusativ. der See → den See.'],
  ['fp-10', 'Seit ___ Jahr lerne ich Deutsch.', 'ein + das Jahr', ['einem'], 'dativ', '"seit" always takes Dativ. Neuter ein → einem.'],
  ['fp-11', 'Nach ___ Essen gehen wir spazieren.', 'das Essen', ['dem'], 'dativ', '"nach" always takes Dativ. das Essen → dem Essen.'],
  ['fp-12', 'Er ist gegen ___ Baum gefahren.', 'der Baum', ['den'], 'akkusativ', '"gegen" always takes Akkusativ. der Baum → den Baum.'],
  ['fp-13', 'Sie arbeitet seit ___ Woche hier.', 'ein + die Woche', ['einer'], 'dativ', '"seit" always takes Dativ. Feminine eine → einer.'],
  ['fp-14', 'Ich komme aus ___ Büro.', 'das Büro', ['dem'], 'dativ', '"aus" always takes Dativ. das Büro → dem Büro.'],
  ['fp-15', 'Das Hotel liegt gegenüber ___ Bahnhof.', 'der Bahnhof', ['dem', 'vom'], 'dativ', '"gegenüber" takes Dativ. der Bahnhof → dem Bahnhof (also "gegenüber vom Bahnhof").'],
  ['fp-16', 'Wir fahren zu ___ Schule.', 'die Schule', ['der', 'zur'], 'dativ', '"zu" always takes Dativ. zu der = zur.'],
  ['fp-17', 'Das Buch ist für ___ Kinder.', 'die Kinder (Plural)', ['die'], 'akkusativ', '"für" always takes Akkusativ. Plural Akkusativ stays "die".'],
  ['fp-18', 'Ich gehe mit ___ Freundin ins Kino.', 'mein + die Freundin', ['meiner'], 'dativ', '"mit" always takes Dativ. Feminine meine → meiner.'],
  ['fp-19', 'Er läuft durch ___ Stadt.', 'die Stadt', ['die'], 'akkusativ', '"durch" always takes Akkusativ. Feminine stays "die".'],
  ['fp-20', 'Am Wochenende fahren wir zu ___ Großeltern.', 'unser + die Großeltern (Plural)', ['unseren'], 'dativ', '"zu" always takes Dativ. Dativ plural: unseren Großeltern.'],
  ['fp-21', 'Sie hat das Auto von ___ Bruder.', 'ihr + der Bruder', ['ihrem'], 'dativ', '"von" always takes Dativ. Masculine ihr → ihrem.'],
  ['fp-22', 'Die Blumen sind für ___ Mutter.', 'mein + die Mutter', ['meine'], 'akkusativ', '"für" always takes Akkusativ. Feminine stays "meine".'],
  ['fp-23', 'Nach ___ Kurs gehen wir essen.', 'der Kurs', ['dem'], 'dativ', '"nach" always takes Dativ. der Kurs → dem Kurs.'],
  ['fp-24', 'Ich bin gegen ___ Idee.', 'die Idee', ['die'], 'akkusativ', '"gegen" always takes Akkusativ. Feminine stays "die".'],
  ['fp-25', 'Ohne ___ Auto ist es schwierig.', 'ein + das Auto', ['ein'], 'akkusativ', '"ohne" always takes Akkusativ. Neuter ein stays "ein".'],
  ['fp-26', 'Bei ___ Wetter bleibe ich zu Hause.', 'das Wetter', ['dem', 'beim'], 'dativ', '"bei" always takes Dativ. bei dem = beim.'],
  ['fp-27', 'Wir fahren mit ___ Zug nach Wien.', 'der Zug', ['dem'], 'dativ', '"mit" always takes Dativ. der Zug → dem Zug.'],
  ['fp-28', 'Das ist ein Geschenk für ___ Freund.', 'mein + der Freund', ['meinen'], 'akkusativ', '"für" always takes Akkusativ. Masculine mein → meinen.'],
  ['fp-29', 'Sie spricht mit ___ Kindern.', 'die Kinder (Plural)', ['den'], 'dativ', '"mit" always takes Dativ. Dativ plural: den Kindern.'],
  ['fp-30', 'Wir sind um ___ Ecke gelaufen.', 'die Ecke', ['die'], 'akkusativ', '"um" always takes Akkusativ. Feminine stays "die".'],
  ['fp-31', 'Ich wohne bei ___ Freund.', 'ein + der Freund', ['einem'], 'dativ', '"bei" always takes Dativ. Masculine ein → einem.'],
  ['fp-32', 'Sie geht ohne ___ Jacke raus.', 'ihr + die Jacke', ['ihre'], 'akkusativ', '"ohne" always takes Akkusativ. Feminine stays "ihre".'],
  ['fp-33', 'Der Bus fährt durch ___ Tunnel.', 'der Tunnel', ['den'], 'akkusativ', '"durch" always takes Akkusativ. der Tunnel → den Tunnel.'],
  ['fp-34', 'Er kommt von ___ Arbeit.', 'die Arbeit', ['der'], 'dativ', '"von" always takes Dativ. die Arbeit → der Arbeit.'],
  ['fp-35', 'Nach ___ Ferien beginnt die Schule.', 'die Ferien (Plural)', ['den'], 'dativ', '"nach" always takes Dativ. Dativ plural: den Ferien.'],
  ['fp-36', 'Die Post ist gegenüber ___ Bank.', 'die Bank', ['der'], 'dativ', '"gegenüber" takes Dativ. die Bank → der Bank.']
].map(([id, prompt, hint, answers, kase, explanation]) => ({
  id,
  drill: 'fixed',
  type: 'fill',
  prompt,
  hint,
  answers,
  case: kase,
  explanation
}))

// ---------------------------------------------------------------------------
// Drill 4: Adjective endings after prepositions (type article + adjective)
// ---------------------------------------------------------------------------
const adjective = [
  ['ad-01', 'Ich gehe in ___ Park.', 'der Park · neu', ['den neuen'], 'akkusativ', 'gehen in = movement → Akkusativ: den. After a definite article the adjective takes -en: den neuen Park.'],
  ['ad-02', 'Wir sitzen in ___ Park.', 'der Park · schön', ['dem schönen'], 'dativ', 'sitzen = position → Dativ: dem. Dativ adjectives after an article always end in -en: dem schönen Park.'],
  ['ad-03', 'Das Buch liegt auf ___ Tisch.', 'der Tisch · klein', ['dem kleinen'], 'dativ', 'liegen = position → Dativ: dem kleinen Tisch.'],
  ['ad-04', 'Ich lege es auf ___ Tisch.', 'der Tisch · groß', ['den großen', 'den grossen'], 'akkusativ', 'legen = movement → Akkusativ masculine: den + -en: den großen Tisch.'],
  ['ad-05', 'Sie wohnt in ___ Wohnung.', 'ein + die Wohnung · klein', ['einer kleinen'], 'dativ', 'wohnen = position → Dativ feminine: einer + -en: einer kleinen Wohnung.'],
  ['ad-06', 'Sie zieht in ___ Wohnung.', 'ein + die Wohnung · neu', ['eine neue'], 'akkusativ', 'ziehen in = movement → Akkusativ feminine: eine + -e: eine neue Wohnung.'],
  ['ad-07', 'Er fährt mit ___ Auto.', 'das Auto · alt', ['dem alten'], 'dativ', '"mit" → Dativ neuter: dem + -en: dem alten Auto.'],
  ['ad-08', 'Das Geschenk ist für ___ Freund.', 'mein + der Freund · best', ['meinen besten'], 'akkusativ', '"für" → Akkusativ masculine: meinen + -en: meinen besten Freund.'],
  ['ad-09', 'Wir gehen in ___ Restaurant.', 'ein + das Restaurant · italienisch', ['ein italienisches'], 'akkusativ', 'gehen in = movement → Akkusativ neuter. "ein" shows no gender, so the adjective does: ein italienisches Restaurant.'],
  ['ad-10', 'Wir essen in ___ Restaurant.', 'ein + das Restaurant · italienisch', ['einem italienischen'], 'dativ', 'essen = position → Dativ neuter: einem + -en: einem italienischen Restaurant.'],
  ['ad-11', 'Das Bild hängt an ___ Wand.', 'die Wand · weiß', ['der weißen', 'der weissen'], 'dativ', 'hängen (no object) = position → Dativ feminine: der + -en: der weißen Wand.'],
  ['ad-12', 'Er hängt das Bild an ___ Wand.', 'die Wand · weiß', ['die weiße', 'die weisse'], 'akkusativ', 'hängen + object = movement → Akkusativ feminine: die + -e: die weiße Wand.'],
  ['ad-13', 'Ich komme aus ___ Stadt.', 'ein + die Stadt · klein', ['einer kleinen'], 'dativ', '"aus" → Dativ feminine: einer + -en: einer kleinen Stadt.'],
  ['ad-14', 'Die Kinder laufen durch ___ Garten.', 'der Garten · groß', ['den großen', 'den grossen'], 'akkusativ', '"durch" → Akkusativ masculine: den + -en: den großen Garten.'],
  ['ad-15', 'Sie sitzt neben ___ Mann.', 'ein + der Mann · alt', ['einem alten'], 'dativ', 'sitzen = position → Dativ masculine: einem + -en: einem alten Mann.'],
  ['ad-16', 'Sie setzt sich neben ___ Mann.', 'ein + der Mann · jung', ['einen jungen'], 'akkusativ', 'sich setzen = movement → Akkusativ masculine: einen + -en: einen jungen Mann.'],
  ['ad-17', 'Er kommt von ___ Reise.', 'ein + die Reise · lang', ['einer langen'], 'dativ', '"von" → Dativ feminine: einer + -en: einer langen Reise.'],
  ['ad-18', 'Ohne ___ Jacke ist es kalt.', 'ein + die Jacke · warm', ['eine warme'], 'akkusativ', '"ohne" → Akkusativ feminine: eine + -e: eine warme Jacke.'],
  ['ad-19', 'Wir fahren zu ___ Freunden.', 'unser + die Freunde (Plural) · gut', ['unseren guten'], 'dativ', '"zu" → Dativ plural: unseren + -en: unseren guten Freunden.'],
  ['ad-20', 'Die Katze schläft unter ___ Bett.', 'das Bett · alt', ['dem alten'], 'dativ', 'schlafen = position → Dativ neuter: dem + -en: dem alten Bett.'],
  ['ad-21', 'Ich stelle die Blumen in ___ Vase.', 'die Vase · blau', ['die blaue'], 'akkusativ', 'stellen = movement → Akkusativ feminine: die + -e: die blaue Vase.'],
  ['ad-22', 'Die Blumen stehen in ___ Vase.', 'die Vase · blau', ['der blauen'], 'dativ', 'stehen = position → Dativ feminine: der + -en: der blauen Vase.'],
  ['ad-23', 'Sie geht mit ___ Kindern spazieren.', 'die Kinder (Plural) · klein', ['den kleinen'], 'dativ', '"mit" → Dativ plural: den + -en: den kleinen Kindern.'],
  ['ad-24', 'Nach ___ Tag bin ich müde.', 'ein + der Tag · lang', ['einem langen'], 'dativ', '"nach" → Dativ masculine: einem + -en: einem langen Tag.'],
  ['ad-25', 'Ich fahre mit ___ Freunden.', 'kein Artikel (Plural) · gut', ['guten'], 'dativ', 'No article → the adjective takes the strong (article-like) ending. Dativ plural: guten Freunden.'],
  ['ad-26', 'Sie kauft Blumen für ___ Kinder.', 'kein Artikel (Plural) · klein', ['kleine'], 'akkusativ', 'No article → strong ending. Akkusativ plural (like "die"): kleine Kinder.'],
  ['ad-27', 'Er stellt das Glas auf ___ Regal.', 'das Regal · hoch', ['das hohe'], 'akkusativ', 'stellen = movement → Akkusativ neuter: das + -e. Note the spelling change hoch → hohe.'],
  ['ad-28', 'Das Glas steht auf ___ Regal.', 'das Regal · hoch', ['dem hohen'], 'dativ', 'stehen = position → Dativ neuter: dem + -en: dem hohen Regal.'],
  ['ad-29', 'Wir wohnen seit ___ Jahr hier.', 'ein + das Jahr · ganz', ['einem ganzen'], 'dativ', '"seit" → Dativ neuter: einem + -en: einem ganzen Jahr.'],
  ['ad-30', 'Ich warte vor ___ Tür.', 'die Tür · geschlossen', ['der geschlossenen'], 'dativ', 'warten = position → Dativ feminine: der + -en: der geschlossenen Tür.']
].map(([id, prompt, hint, answers, kase, explanation]) => ({
  id,
  drill: 'adjective',
  type: 'fill',
  prompt,
  hint,
  answers,
  case: kase,
  explanation
}))

// ---------------------------------------------------------------------------
// Drill 5: Nebensätze (subordinate clauses)
// ---------------------------------------------------------------------------
const nebensatzChoice = [
  ['ns-01', 'Ich bleibe zu Hause, ___ es regnet.', ['weil', 'dass', 'ob', 'obwohl'], 'weil', '"weil" = because. The clause gives a reason. Verb at the end: … weil es regnet.'],
  ['ns-02', 'Ich weiß nicht, ___ er heute kommt.', ['ob', 'weil', 'dass', 'wenn'], 'ob', '"ob" = whether. After "ich weiß nicht" an open yes/no question needs "ob".'],
  ['ns-03', 'Sie sagt, ___ sie müde ist.', ['dass', 'ob', 'weil', 'obwohl'], 'dass', '"dass" = that. It reports what she says. Verb at the end: … dass sie müde ist.'],
  ['ns-04', 'Er geht joggen, ___ er erkältet ist.', ['obwohl', 'weil', 'dass', 'ob'], 'obwohl', '"obwohl" = although. Jogging while sick is a contrast, not a reason.'],
  ['ns-05', '___ ich Zeit habe, lese ich ein Buch.', ['Wenn', 'Dass', 'Ob', 'Weil'], 'Wenn', '"wenn" = when / whenever. Nebensatz first → the main clause starts with its verb: … , lese ich …'],
  ['ns-06', 'Ich frage mich, ___ der Zug pünktlich ankommt.', ['ob', 'dass', 'wenn', 'weil'], 'ob', '"ob" introduces an indirect yes/no question (Kommt der Zug pünktlich an?).'],
  ['ns-07', 'Wir fahren nicht ans Meer, ___ das Wetter schlecht ist.', ['weil', 'obwohl', 'dass', 'ob'], 'weil', 'Bad weather is the REASON for not going → "weil".'],
  ['ns-08', 'Ich hoffe, ___ du bald gesund wirst.', ['dass', 'ob', 'weil', 'wenn'], 'dass', '"hoffen, dass …" — a statement of content, not a question → "dass".'],
  ['ns-09', 'Sie hat die Prüfung bestanden, ___ sie wenig gelernt hat.', ['obwohl', 'weil', 'ob', 'dass'], 'obwohl', 'Passing despite little studying is a contrast → "obwohl".'],
  ['ns-10', '___ du fertig bist, können wir gehen.', ['Wenn', 'Ob', 'Dass', 'Obwohl'], 'Wenn', '"wenn" = when (condition/time). Main clause after the comma starts with the verb: … , können wir gehen.']
].map(([id, prompt, options, answer, explanation]) => ({
  id, drill: 'nebensatz', type: 'choice', prompt, hint: 'Which conjunction fits?', options, answers: [answer], case: null, explanation
}))

const nebensatzFill = [
  ['ns-11', 'Ich weiß, dass er morgen ___.', 'kommen', ['kommt'], 'In a Nebensatz the conjugated verb goes to the END: … dass er morgen kommt.'],
  ['ns-12', 'Sie sagt, dass sie heute nicht ___.', 'arbeiten können (2 words)', ['arbeiten kann'], 'With a modal verb the infinitive comes first, the conjugated modal LAST: … nicht arbeiten kann.'],
  ['ns-13', 'Er fragt, ob der Zug pünktlich ___.', 'ankommen', ['ankommt'], 'A separable verb is written as ONE word at the end of a Nebensatz: … pünktlich ankommt.'],
  ['ns-14', 'Ich glaube, dass sie schon ___.', 'essen, Perfekt (2 words)', ['gegessen hat'], 'In the Perfekt the participle comes first and the auxiliary (hat/ist) goes last: … schon gegessen hat.'],
  ['ns-15', 'Wir bleiben zu Hause, weil es ___.', 'regnen', ['regnet'], '"weil" sends the verb to the end: … weil es regnet.'],
  ['ns-16', 'Ich rufe dich an, wenn ich ___.', 'Zeit haben (2 words)', ['zeit habe'], 'Verb last: … wenn ich Zeit habe. (Note "ich" → "habe".)'],
  ['ns-17', 'Sie ist glücklich, weil sie eine neue Wohnung ___.', 'finden, Perfekt (2 words)', ['gefunden hat'], 'Perfekt in a Nebensatz: participle + auxiliary at the very end: … gefunden hat.'],
  ['ns-18', 'Weißt du, ob wir morgen früh ___?', 'aufstehen müssen (2 words)', ['aufstehen müssen'], 'Modal in a Nebensatz: infinitive (aufstehen) then modal (müssen) at the end.'],
  ['ns-19', 'Er sagt, dass er das Buch ___.', 'lesen, Perfekt (2 words)', ['gelesen hat'], 'Perfekt in a Nebensatz: … gelesen hat.'],
  ['ns-20', 'Ich bin müde, obwohl ich lange ___.', 'schlafen, Perfekt (2 words)', ['geschlafen habe'], 'Perfekt with "ich": … geschlafen habe (participle first, "habe" last).'],
  ['ns-21', 'Ich komme später, weil ich noch ___.', 'einkaufen müssen (2 words)', ['einkaufen muss'], 'Separable infinitive + conjugated modal at the end: … einkaufen muss.'],
  ['ns-22', 'Sie fragt, wann der Film ___.', 'anfangen', ['anfängt'], 'W-questions (wann, wo, warum) also form Nebensätze: separable verb rejoined at the end: anfängt.'],
  ['ns-23', 'Wenn du Hunger ___, mach dir ein Brot.', 'haben (du)', ['hast'], 'Verb at the end of the wenn-clause: Wenn du Hunger hast, …'],
  ['ns-24', 'Er weiß nicht, warum sie nicht ___.', 'kommen wollen (sie, Sg., 2 words)', ['kommen will'], 'Infinitive then modal at the end: … warum sie nicht kommen will.']
].map(([id, prompt, hint, answers, explanation]) => ({
  id, drill: 'nebensatz', type: 'fill', prompt, hint, answers, case: null, explanation
}))

// Order exercises: tokens have no punctuation; answers include the punctuated sentence.
const nebensatzOrder = [
  ['ns-25', ['Ich', 'bleibe', 'zu Hause', 'weil', 'es', 'regnet'], ['Ich bleibe zu Hause, weil es regnet.', 'Weil es regnet, bleibe ich zu Hause.'], 'Main clause: verb in position 2. Nebensatz after "weil": verb at the end.'],
  ['ns-26', ['Wenn', 'es', 'regnet', 'bleibe', 'ich', 'zu Hause'], ['Wenn es regnet, bleibe ich zu Hause.'], 'Nebensatz first, so the main clause starts with its verb: …, bleibe ich zu Hause.'],
  ['ns-27', ['Ich', 'weiß', 'dass', 'er', 'morgen', 'kommt'], ['Ich weiß, dass er morgen kommt.'], '"dass" sends "kommt" to the end of the clause.'],
  ['ns-28', ['Sie', 'geht', 'spazieren', 'obwohl', 'sie', 'müde', 'ist'], ['Sie geht spazieren, obwohl sie müde ist.', 'Obwohl sie müde ist, geht sie spazieren.'], '"obwohl" = although. Verb "ist" at the end of the Nebensatz.'],
  ['ns-29', ['Er', 'fragt', 'ob', 'du', 'Zeit', 'hast'], ['Er fragt, ob du Zeit hast.'], 'Indirect yes/no question with "ob"; verb "hast" at the end.'],
  ['ns-30', ['Ich', 'glaube', 'dass', 'sie', 'schon', 'gegessen', 'hat'], ['Ich glaube, dass sie schon gegessen hat.'], 'Perfekt in a Nebensatz: participle, then "hat" last.'],
  ['ns-31', ['Wir', 'kommen', 'später', 'weil', 'wir', 'noch', 'arbeiten', 'müssen'], ['Wir kommen später, weil wir noch arbeiten müssen.', 'Weil wir noch arbeiten müssen, kommen wir später.'], 'Modal in a Nebensatz: infinitive "arbeiten" then "müssen" at the very end.'],
  ['ns-32', ['Weißt', 'du', 'ob', 'der', 'Zug', 'pünktlich', 'ankommt'], ['Weißt du, ob der Zug pünktlich ankommt?'], 'Separable verb rejoined as one word at the end: ankommt.'],
  ['ns-33', ['Ich', 'lerne', 'Deutsch', 'weil', 'ich', 'in', 'Berlin', 'arbeite'], ['Ich lerne Deutsch, weil ich in Berlin arbeite.', 'Weil ich in Berlin arbeite, lerne ich Deutsch.'], '"weil" clause: subject first, verb "arbeite" last.'],
  ['ns-34', ['Wenn', 'ich', 'Zeit', 'habe', 'lese', 'ich', 'ein', 'Buch'], ['Wenn ich Zeit habe, lese ich ein Buch.'], 'Nebensatz first: "habe" ends it, then the main clause verb "lese" comes immediately after the comma.']
].map(([id, tokens, answers, explanation]) => ({
  id, drill: 'nebensatz', type: 'order', prompt: 'Build the sentence:', hint: 'Tap the words in the right order', tokens, answers, case: null, explanation
}))

// ---------------------------------------------------------------------------
// Drill 6: zu + Infinitiv
// ---------------------------------------------------------------------------
const zuFill = [
  ['zu-01', 'Ich habe keine Lust, heute ___.', 'kochen', ['zu kochen'], '"Lust haben" + zu + Infinitiv: … keine Lust, heute zu kochen.'],
  ['zu-02', 'Er hat vergessen, mich ___.', 'anrufen', ['anzurufen'], 'Separable verb: "zu" goes BETWEEN prefix and verb, written as one word: anzurufen.'],
  ['zu-03', 'Es ist wichtig, jeden Tag Deutsch ___.', 'sprechen', ['zu sprechen'], '"Es ist + adjective" + zu + Infinitiv: … Deutsch zu sprechen.'],
  ['zu-04', 'Ich versuche, früh ___.', 'aufstehen', ['aufzustehen'], 'Separable verb: auf + zu + stehen = aufzustehen.'],
  ['zu-05', 'Ich muss heute lange ___.', 'arbeiten', ['arbeiten'], 'Modal verbs (müssen, können, wollen, …) take a bare infinitive: NO "zu".'],
  ['zu-06', 'Wir haben vor, nach Italien ___.', 'fahren', ['zu fahren'], '"vorhaben" (to plan) + zu + Infinitiv: … nach Italien zu fahren.'],
  ['zu-07', 'Sie hofft, die Prüfung ___.', 'bestehen', ['zu bestehen'], '"hoffen" + zu + Infinitiv: … die Prüfung zu bestehen.'],
  ['zu-08', 'Es macht Spaß, mit Freunden ___.', 'ausgehen', ['auszugehen'], 'Separable verb: aus + zu + gehen = auszugehen.'],
  ['zu-09', 'Hast du Zeit, mir ___?', 'helfen', ['zu helfen'], '"Zeit haben" + zu + Infinitiv: … mir zu helfen.'],
  ['zu-10', 'Ich gehe jetzt ___.', 'schlafen', ['schlafen'], 'gehen / fahren / kommen + activity take a bare infinitive: ich gehe schlafen (no "zu").'],
  ['zu-11', 'Er lernt, Gitarre ___.', 'spielen', ['zu spielen'], '"lernen" + zu + Infinitiv (with an object or extension): … Gitarre zu spielen.'],
  ['zu-12', 'Ich habe angefangen, Deutsch ___.', 'lernen', ['zu lernen'], '"anfangen" + zu + Infinitiv: … Deutsch zu lernen.'],
  ['zu-13', 'Es ist verboten, hier ___.', 'rauchen', ['zu rauchen'], '"Es ist verboten/erlaubt" + zu + Infinitiv: … hier zu rauchen.'],
  ['zu-14', 'Ich lerne Deutsch, um in Berlin ___.', 'arbeiten', ['zu arbeiten'], '"um … zu" = in order to. The infinitive with "zu" closes the clause: um in Berlin zu arbeiten.'],
  ['zu-15', 'Wir fahren ans Meer, um uns ___.', 'erholen', ['zu erholen'], '"um … zu" + reflexive verb: um uns zu erholen.'],
  ['zu-16', 'Sie möchte heute Abend ___.', 'ausgehen', ['ausgehen'], '"möchten" is a modal → bare infinitive, no "zu": Sie möchte ausgehen.'],
  ['zu-17', 'Ich habe keine Zeit, das Buch ___.', 'lesen', ['zu lesen'], '"keine Zeit haben" + zu + Infinitiv: … das Buch zu lesen.'],
  ['zu-18', 'Er hat versprochen, pünktlich ___.', 'kommen', ['zu kommen'], '"versprechen" + zu + Infinitiv: … pünktlich zu kommen.'],
  ['zu-19', 'Vergiss nicht, die Tür ___!', 'abschließen', ['abzuschließen', 'abzuschliessen'], 'Separable verb: ab + zu + schließen = abzuschließen.'],
  ['zu-20', 'Ich kann dir ___.', 'helfen', ['helfen'], 'Modal "können" → bare infinitive: Ich kann dir helfen.'],
  ['zu-21', 'Es ist schwer, eine Wohnung in München ___.', 'finden', ['zu finden'], '"Es ist schwer/leicht" + zu + Infinitiv: … zu finden.'],
  ['zu-22', 'Sie hat Angst, allein ___.', 'fliegen', ['zu fliegen'], '"Angst haben" + zu + Infinitiv: … allein zu fliegen.'],
  ['zu-23', 'Wir wollen morgen früh ___.', 'losfahren', ['losfahren'], '"wollen" is a modal → bare infinitive, no "zu", even for separable verbs: losfahren.'],
  ['zu-24', 'Er nimmt den Bus, um schneller ___.', 'ankommen', ['anzukommen'], '"um … zu" with a separable verb: an + zu + kommen = anzukommen.'],
  ['zu-25', 'Ich fange an, das Zimmer ___.', 'aufräumen', ['aufzuräumen'], 'Separable verb: auf + zu + räumen = aufzuräumen.'],
  ['zu-26', 'Hör auf, so laut ___!', 'sprechen', ['zu sprechen'], '"aufhören" + zu + Infinitiv: Hör auf, so laut zu sprechen!']
].map(([id, prompt, hint, answers, explanation]) => ({
  id, drill: 'zu-infinitiv', type: 'fill', prompt, hint, answers, case: null, explanation
}))

const zuChoice = [
  ['zu-27', 'Ich möchte heute ___.', ['schwimmen', 'zu schwimmen'], 'schwimmen', '"möchten" is a modal → no "zu".'],
  ['zu-28', 'Ich habe Lust, heute ___.', ['zu schwimmen', 'schwimmen'], 'zu schwimmen', '"Lust haben" + zu + Infinitiv.'],
  ['zu-29', 'Er versucht, das Fenster ___.', ['aufzumachen', 'zu aufmachen', 'aufmachen'], 'aufzumachen', 'Separable verb: "zu" goes inside: auf-zu-machen.'],
  ['zu-30', 'Wir gehen heute ___.', ['einkaufen', 'zu einkaufen', 'einzukaufen'], 'einkaufen', '"gehen" + activity → bare infinitive: Wir gehen einkaufen.'],
  ['zu-31', 'Sie hat vor, ihre Oma ___.', ['zu besuchen', 'besuchen'], 'zu besuchen', '"vorhaben" + zu + Infinitiv.'],
  ['zu-32', 'Du sollst mehr Wasser ___.', ['trinken', 'zu trinken'], 'trinken', '"sollen" is a modal → bare infinitive.'],
  ['zu-33', 'Ich spare Geld, ___ ein Auto zu kaufen.', ['um', 'damit', 'weil'], 'um', 'Same subject in both parts → "um … zu". ("damit" would need its own subject and a conjugated verb.)'],
  ['zu-34', 'Es ist nicht erlaubt, hier ___.', ['zu parken', 'parken'], 'zu parken', '"Es ist (nicht) erlaubt" + zu + Infinitiv.']
].map(([id, prompt, options, answer, explanation]) => ({
  id, drill: 'zu-infinitiv', type: 'choice', prompt, hint: 'zu or no zu?', options, answers: [answer], case: null, explanation
}))

const zuOrder = [
  ['zu-35', ['Ich', 'habe', 'keine', 'Lust', 'heute', 'zu', 'kochen'], ['Ich habe keine Lust, heute zu kochen.'], 'The zu-Infinitiv sits at the end of its clause: …, heute zu kochen.'],
  ['zu-36', ['Es', 'ist', 'wichtig', 'jeden', 'Tag', 'Deutsch', 'zu', 'sprechen'], ['Es ist wichtig, jeden Tag Deutsch zu sprechen.'], '"zu sprechen" closes the infinitive clause.'],
  ['zu-37', ['Er', 'hat', 'vergessen', 'mich', 'anzurufen'], ['Er hat vergessen, mich anzurufen.'], 'Separable verb with "zu" inside: anzurufen, at the very end.'],
  ['zu-38', ['Ich', 'lerne', 'Deutsch', 'um', 'in', 'Berlin', 'zu', 'arbeiten'], ['Ich lerne Deutsch, um in Berlin zu arbeiten.', 'Um in Berlin zu arbeiten, lerne ich Deutsch.'], '"um" opens the purpose clause, "zu arbeiten" closes it.'],
  ['zu-39', ['Wir', 'haben', 'vor', 'nach', 'Italien', 'zu', 'fahren'], ['Wir haben vor, nach Italien zu fahren.'], '"vorhaben" splits in a main clause (haben … vor), then the zu-clause follows.'],
  ['zu-40', ['Hast', 'du', 'Zeit', 'mir', 'zu', 'helfen'], ['Hast du Zeit, mir zu helfen?'], 'Question first, then the zu-clause: …, mir zu helfen?']
].map(([id, tokens, answers, explanation]) => ({
  id, drill: 'zu-infinitiv', type: 'order', prompt: 'Build the sentence:', hint: 'Tap the words in the right order', tokens, answers, case: null, explanation
}))

// A few sentence-builder items for the preposition drills, to mix up the format.
const prepositionOrder = [
  ['wo-01', ['Ich', 'lege', 'das', 'Buch', 'auf', 'den', 'Tisch'], ['Ich lege das Buch auf den Tisch.'], 'legen = movement → Wohin? → auf den Tisch (Akkusativ).', 'wechsel', 'akkusativ'],
  ['wo-02', ['Das', 'Buch', 'liegt', 'auf', 'dem', 'Tisch'], ['Das Buch liegt auf dem Tisch.'], 'liegen = position → Wo? → auf dem Tisch (Dativ).', 'wechsel', 'dativ'],
  ['wo-03', ['Die', 'Kinder', 'gehen', 'in', 'die', 'Schule'], ['Die Kinder gehen in die Schule.'], 'gehen in = movement → in die Schule (Akkusativ).', 'wechsel', 'akkusativ'],
  ['wo-04', ['Er', 'hängt', 'das', 'Bild', 'an', 'die', 'Wand'], ['Er hängt das Bild an die Wand.'], 'hängen + object = movement → an die Wand (Akkusativ).', 'wechsel', 'akkusativ'],
  ['wo-05', ['Ich', 'fahre', 'mit', 'dem', 'Bus', 'zur', 'Arbeit'], ['Ich fahre mit dem Bus zur Arbeit.'], '"mit" + Dativ (dem Bus), "zu" + Dativ (zur = zu der Arbeit).', 'fixed', 'dativ'],
  ['wo-06', ['Das', 'Geschenk', 'ist', 'für', 'meinen', 'besten', 'Freund'], ['Das Geschenk ist für meinen besten Freund.'], '"für" + Akkusativ: meinen besten Freund.', 'adjective', 'akkusativ']
].map(([id, tokens, answers, explanation, drill, kase]) => ({
  id, drill, type: 'order', prompt: 'Build the sentence:', hint: 'Tap the words in the right order', tokens, answers, case: kase, explanation
}))

export const exercises = [
  ...woWohin, ...wechsel, ...fixed, ...adjective,
  ...nebensatzChoice, ...nebensatzFill, ...nebensatzOrder,
  ...zuFill, ...zuChoice, ...zuOrder,
  ...prepositionOrder
]

// Rules shown in the cheat sheet panel.
export const cheatSheet = {
  questions: [
    { word: 'Wo?', meaning: 'Where? (position)', kase: 'dativ', example: 'Das Buch liegt auf dem Tisch.' },
    { word: 'Wohin?', meaning: 'Where to? (movement)', kase: 'akkusativ', example: 'Ich lege das Buch auf den Tisch.' },
    { word: 'Woher?', meaning: 'Where from? (origin)', kase: 'dativ', example: 'Ich komme aus dem Büro. (aus/von + Dativ)' }
  ],
  twoWay: ['an', 'auf', 'hinter', 'in', 'neben', 'über', 'unter', 'vor', 'zwischen'],
  dativOnly: ['aus', 'bei', 'mit', 'nach', 'seit', 'von', 'zu', 'gegenüber'],
  akkusativOnly: ['durch', 'für', 'gegen', 'ohne', 'um'],
  verbPairs: [
    { position: 'liegen (to lie)', movement: 'legen (to lay)' },
    { position: 'stehen (to stand)', movement: 'stellen (to put upright)' },
    { position: 'sitzen (to sit)', movement: 'sich setzen (to sit down)' },
    { position: 'hängen (to hang, no object)', movement: 'hängen (to hang something)' },
    { position: 'sein / bleiben / wohnen', movement: 'gehen / fahren / kommen' }
  ],
  nebensatz: {
    conjunctions: [
      { word: 'weil', meaning: 'because' },
      { word: 'dass', meaning: 'that' },
      { word: 'wenn', meaning: 'when / if' },
      { word: 'ob', meaning: 'whether' },
      { word: 'obwohl', meaning: 'although' }
    ],
    rules: [
      'Conjugated verb goes to the END of the Nebensatz.',
      'Modal: infinitive first, modal last (… arbeiten kann).',
      'Perfekt: participle first, haben/sein last (… gegessen hat).',
      'Separable verbs are rejoined (… pünktlich ankommt).',
      'Nebensatz first → main clause starts with the verb (Wenn es regnet, bleibe ich …).'
    ]
  },
  zuInfinitiv: {
    withZu: ['Lust / Zeit / Angst haben', 'anfangen, aufhören', 'versuchen, vergessen, versprechen', 'vorhaben, hoffen, lernen', 'Es ist wichtig / schwer / verboten …', 'um … zu (in order to)'],
    withoutZu: ['Modals: müssen, können, wollen, sollen, dürfen, möchten', 'gehen / fahren / kommen + activity (gehen schlafen)', 'sehen / hören + verb (Ich höre ihn singen)'],
    separable: 'zu goes inside separable verbs: anrufen → anzurufen, aufstehen → aufzustehen.'
  },
  contractions: [
    { short: 'im', long: 'in dem', kase: 'dativ' },
    { short: 'am', long: 'an dem', kase: 'dativ' },
    { short: 'zum', long: 'zu dem', kase: 'dativ' },
    { short: 'zur', long: 'zu der', kase: 'dativ' },
    { short: 'beim', long: 'bei dem', kase: 'dativ' },
    { short: 'vom', long: 'von dem', kase: 'dativ' },
    { short: 'ins', long: 'in das', kase: 'akkusativ' },
    { short: 'ans', long: 'an das', kase: 'akkusativ' },
    { short: 'aufs', long: 'auf das', kase: 'akkusativ' }
  ]
}

/** Normalise an answer for comparison. */
export function normalizeAnswer(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[.!?,]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** True when the typed/selected answer matches one of the accepted answers. */
export function isCorrect(exercise, given) {
  const wanted = normalizeAnswer(given)
  return exercise.answers.some(a => normalizeAnswer(a) === wanted)
}

/** Order-type check: `given` is an array of chips or a space-joined string. */
export function isOrderCorrect(exercise, given) {
  const text = Array.isArray(given) ? given.join(' ') : given
  return isCorrect(exercise, text)
}

/**
 * Blitz mode pool: every exercise that has a clear Dativ/Akkusativ answer,
 * rendered as a quick "which case?" question.
 */
export function buildBlitzPool() {
  return exercises
    .filter(e => (e.case === 'dativ' || e.case === 'akkusativ') && e.type === 'fill')
    .map(e => ({
      id: e.id,
      prompt: e.prompt.replace('___', e.answers[0]),
      hint: e.hint,
      answer: e.case,
      explanation: e.explanation
    }))
}

/** Fisher-Yates shuffle, returns a new array. */
export function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Build a round: `size` random exercises from the given drill (or all drills for 'mixed'). */
export function buildRound(drillId, size) {
  const pool = drillId === 'mixed' ? exercises : exercises.filter(e => e.drill === drillId)
  return shuffle(pool).slice(0, size)
}

export default exercises

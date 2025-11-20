// Example sentences for each declension form
// Key format: "{form}-{case}-{gender}"
// Each entry contains 2-3 example sentences with English translations

export const examples = {
  // ===== DEFINITE ARTICLES =====

  // Nominativ
  'der-Nom-M': [
    'Der Mann ist groß. (The man is tall)',
    'Der Hund läuft schnell. (The dog runs fast)',
    'Der große Mann geht. (The big man walks)'
  ],
  'die-Nom-F': [
    'Die Frau ist nett. (The woman is nice)',
    'Die Katze schläft. (The cat sleeps)',
    'Die junge Frau kommt. (The young woman comes)'
  ],
  'das-Nom-N': [
    'Das Kind spielt. (The child plays)',
    'Das Auto ist neu. (The car is new)',
    'Das kleine Kind lacht. (The small child laughs)'
  ],
  'die-Nom-Pl': [
    'Die Kinder spielen. (The children play)',
    'Die Bücher sind alt. (The books are old)',
    'Die kleinen Kinder singen. (The small children sing)'
  ],

  // Akkusativ
  'den-Akk-M': [
    'Ich sehe den Mann. (I see the man)',
    'Sie liebt den Hund. (She loves the dog)',
    'Ich sehe den großen Mann. (I see the big man)'
  ],
  'die-Akk-F': [
    'Er kennt die Frau. (He knows the woman)',
    'Wir haben die Katze. (We have the cat)',
    'Er kennt die nette Frau. (He knows the nice woman)'
  ],
  'das-Akk-N': [
    'Ich kaufe das Buch. (I buy the book)',
    'Sie hat das Auto. (She has the car)',
    'Ich kaufe das neue Buch. (I buy the new book)'
  ],
  'die-Akk-Pl': [
    'Er liest die Bücher. (He reads the books)',
    'Wir sehen die Kinder. (We see the children)',
    'Er liest die alten Bücher. (He reads the old books)'
  ],

  // Dativ
  'dem-Dat-M': [
    'Ich gebe dem Mann das Buch. (I give the man the book)',
    'Sie hilft dem Kind. (She helps the child)',
    'Ich helfe dem alten Mann. (I help the old man)'
  ],
  'der-Dat-F': [
    'Er gibt der Frau Blumen. (He gives the woman flowers)',
    'Wir danken der Lehrerin. (We thank the teacher)',
    'Er gibt der netten Frau Blumen. (He gives the nice woman flowers)'
  ],
  'dem-Dat-N': [
    'Sie folgt dem Kind. (She follows the child)',
    'Er hilft dem Baby. (He helps the baby)',
    'Sie folgt dem kleinen Kind. (She follows the small child)'
  ],
  'den-Dat-Pl': [
    'Ich helfe den Kindern. (I help the children)',
    'Sie dankt den Freunden. (She thanks the friends)',
    'Ich helfe den kleinen Kindern. (I help the small children)'
  ],

  // Genitiv
  'des-Gen-M': [
    'Das Auto des Mannes ist rot. (The man\'s car is red)',
    'Die Farbe des Hundes ist braun. (The dog\'s color is brown)',
    'Das Haus des reichen Mannes. (The rich man\'s house)'
  ],
  'der-Gen-F': [
    'Das Buch der Frau ist neu. (The woman\'s book is new)',
    'Die Tochter der Lehrerin. (The teacher\'s daughter)',
    'Das Buch der netten Frau. (The nice woman\'s book)'
  ],
  'des-Gen-N': [
    'Die Farbe des Autos ist blau. (The car\'s color is blue)',
    'Das Zimmer des Kindes. (The child\'s room)',
    'Das Zimmer des kleinen Kindes. (The small child\'s room)'
  ],
  'der-Gen-Pl': [
    'Die Bücher der Kinder sind schön. (The children\'s books are beautiful)',
    'Die Namen der Studenten. (The students\' names)',
    'Die Bücher der kleinen Kinder. (The small children\'s books)'
  ],

  // ===== INDEFINITE ARTICLES =====

  // Nominativ
  'ein-Nom-M': [
    'Ein Mann kommt. (A man comes)',
    'Ein Hund bellt. (A dog barks)',
    'Ein großer Mann steht dort. (A big man stands there)'
  ],
  'eine-Nom-F': [
    'Eine Frau singt. (A woman sings)',
    'Eine Katze läuft. (A cat runs)',
    'Eine junge Frau tanzt. (A young woman dances)'
  ],
  'ein-Nom-N': [
    'Ein Kind lacht. (A child laughs)',
    'Ein Auto fährt. (A car drives)',
    'Ein kleines Kind spielt. (A small child plays)'
  ],
  '—-Nom-Pl': [
    'Kinder spielen. (Children play)',
    'Bücher liegen dort. (Books are lying there)',
    'Kleine Kinder singen. (Small children sing)'
  ],

  // Akkusativ
  'einen-Akk-M': [
    'Ich sehe einen Mann. (I see a man)',
    'Sie kauft einen Hund. (She buys a dog)',
    'Ich sehe einen großen Mann. (I see a big man)'
  ],
  'eine-Akk-F': [
    'Er hat eine Katze. (He has a cat)',
    'Wir kaufen eine Blume. (We buy a flower)',
    'Er hat eine schöne Katze. (He has a beautiful cat)'
  ],
  'ein-Akk-N': [
    'Ich lese ein Buch. (I read a book)',
    'Sie möchte ein Auto. (She wants a car)',
    'Ich lese ein interessantes Buch. (I read an interesting book)'
  ],
  '—-Akk-Pl': [
    'Er sieht Kinder. (He sees children)',
    'Wir haben Bücher. (We have books)',
    'Er sieht kleine Kinder. (He sees small children)'
  ],

  // Dativ
  'einem-Dat-M': [
    'Ich gebe einem Mann Geld. (I give a man money)',
    'Sie hilft einem Kind. (She helps a child)',
    'Ich helfe einem alten Mann. (I help an old man)'
  ],
  'einer-Dat-F': [
    'Er gibt einer Frau Blumen. (He gives a woman flowers)',
    'Wir folgen einer Katze. (We follow a cat)',
    'Er gibt einer netten Frau Blumen. (He gives a nice woman flowers)'
  ],
  'einem-Dat-N': [
    'Sie hilft einem Kind. (She helps a child)',
    'Er dankt einem Baby. (He thanks a baby)',
    'Sie hilft einem kleinen Kind. (She helps a small child)'
  ],
  '—-Dat-Pl': [
    'Ich helfe Kindern. (I help children)',
    'Sie dankt Freunden. (She thanks friends)',
    'Ich helfe kleinen Kindern. (I help small children)'
  ],

  // Genitiv
  'eines-Gen-M': [
    'Das Auto eines Mannes. (A man\'s car)',
    'Die Farbe eines Hundes. (A dog\'s color)',
    'Das Haus eines reichen Mannes. (A rich man\'s house)'
  ],
  'einer-Gen-F': [
    'Das Buch einer Frau. (A woman\'s book)',
    'Die Tochter einer Lehrerin. (A teacher\'s daughter)',
    'Das Buch einer netten Frau. (A nice woman\'s book)'
  ],
  'eines-Gen-N': [
    'Die Farbe eines Autos. (A car\'s color)',
    'Das Zimmer eines Kindes. (A child\'s room)',
    'Das Zimmer eines kleinen Kindes. (A small child\'s room)'
  ],
  '—-Gen-Pl': [
    'Die Bücher von Kindern. (Children\'s books)',
    'Die Namen von Studenten. (Students\' names)',
    'Die Bücher von kleinen Kindern. (Small children\'s books)'
  ],

  // ===== WEAK ADJECTIVE DECLENSION =====

  // Nominativ
  '-e-Nom-M': [
    'Der große Mann ist hier. (The big man is here)',
    'Der alte Hund schläft. (The old dog sleeps)',
    'Der junge Mann arbeitet. (The young man works)'
  ],
  '-e-Nom-F': [
    'Die schöne Frau singt. (The beautiful woman sings)',
    'Die alte Katze schläft. (The old cat sleeps)',
    'Die junge Frau tanzt. (The young woman dances)'
  ],
  '-e-Nom-N': [
    'Das kleine Kind spielt. (The small child plays)',
    'Das neue Auto fährt. (The new car drives)',
    'Das große Haus steht dort. (The big house stands there)'
  ],
  '-en-Nom-Pl': [
    'Die großen Männer arbeiten. (The big men work)',
    'Die kleinen Kinder spielen. (The small children play)',
    'Die neuen Autos fahren. (The new cars drive)'
  ],

  // Akkusativ
  '-en-Akk-M': [
    'Ich sehe den großen Mann. (I see the big man)',
    'Sie liebt den alten Hund. (She loves the old dog)',
    'Wir kennen den jungen Mann. (We know the young man)'
  ],
  '-e-Akk-F': [
    'Er kennt die schöne Frau. (He knows the beautiful woman)',
    'Wir haben die alte Katze. (We have the old cat)',
    'Sie sieht die junge Frau. (She sees the young woman)'
  ],
  '-e-Akk-N': [
    'Ich kaufe das neue Buch. (I buy the new book)',
    'Sie hat das kleine Auto. (She has the small car)',
    'Er möchte das große Haus. (He wants the big house)'
  ],
  '-en-Akk-Pl': [
    'Er sieht die großen Männer. (He sees the big men)',
    'Wir lesen die alten Bücher. (We read the old books)',
    'Sie kennt die kleinen Kinder. (She knows the small children)'
  ],

  // Dativ
  '-en-Dat-M': [
    'Ich gebe dem großen Mann das Buch. (I give the big man the book)',
    'Sie hilft dem alten Mann. (She helps the old man)',
    'Wir folgen dem jungen Mann. (We follow the young man)'
  ],
  '-en-Dat-F': [
    'Er gibt der schönen Frau Blumen. (He gives the beautiful woman flowers)',
    'Wir danken der alten Lehrerin. (We thank the old teacher)',
    'Sie hilft der jungen Frau. (She helps the young woman)'
  ],
  '-en-Dat-N': [
    'Sie folgt dem kleinen Kind. (She follows the small child)',
    'Er hilft dem neuen Baby. (He helps the new baby)',
    'Wir danken dem großen Unternehmen. (We thank the big company)'
  ],
  '-en-Dat-Pl': [
    'Ich helfe den kleinen Kindern. (I help the small children)',
    'Sie dankt den alten Freunden. (She thanks the old friends)',
    'Wir folgen den jungen Leuten. (We follow the young people)'
  ],

  // Genitiv
  '-en-Gen-M': [
    'Das Auto des reichen Mannes. (The rich man\'s car)',
    'Die Farbe des alten Hundes. (The old dog\'s color)',
    'Das Haus des jungen Mannes. (The young man\'s house)'
  ],
  '-en-Gen-F': [
    'Das Buch der netten Frau. (The nice woman\'s book)',
    'Die Tochter der alten Lehrerin. (The old teacher\'s daughter)',
    'Das Auto der jungen Frau. (The young woman\'s car)'
  ],
  '-en-Gen-N': [
    'Die Farbe des neuen Autos. (The new car\'s color)',
    'Das Zimmer des kleinen Kindes. (The small child\'s room)',
    'Die Tür des großen Hauses. (The big house\'s door)'
  ],
  '-en-Gen-Pl': [
    'Die Bücher der kleinen Kinder. (The small children\'s books)',
    'Die Namen der neuen Studenten. (The new students\' names)',
    'Die Autos der reichen Leute. (The rich people\'s cars)'
  ],

  // ===== STRONG ADJECTIVE DECLENSION =====

  // Nominativ
  '-er-Nom-M': [
    'Großer Mann kommt. (Big man comes)',
    'Alter Hund schläft. (Old dog sleeps)',
    'Junger Mann arbeitet. (Young man works)'
  ],
  '-e-Nom-F': [
    'Schöne Frau singt. (Beautiful woman sings)',
    'Alte Katze schläft. (Old cat sleeps)',
    'Junge Frau tanzt. (Young woman dances)'
  ],
  '-es-Nom-N': [
    'Kleines Kind spielt. (Small child plays)',
    'Neues Auto fährt. (New car drives)',
    'Großes Haus steht dort. (Big house stands there)'
  ],
  '-e-Nom-Pl': [
    'Große Männer arbeiten. (Big men work)',
    'Kleine Kinder spielen. (Small children play)',
    'Neue Autos fahren. (New cars drive)'
  ],

  // Akkusativ
  '-en-Akk-M': [
    'Ich trinke guten Wein. (I drink good wine)',
    'Sie isst frischen Salat. (She eats fresh salad)',
    'Wir kaufen roten Apfel. (We buy red apple)'
  ],
  '-e-Akk-F': [
    'Er trinkt kalte Milch. (He drinks cold milk)',
    'Wir essen frische Suppe. (We eat fresh soup)',
    'Sie kauft schöne Blume. (She buys beautiful flower)'
  ],
  '-es-Akk-N': [
    'Ich esse gutes Brot. (I eat good bread)',
    'Sie trinkt kaltes Wasser. (She drinks cold water)',
    'Er kauft neues Buch. (He buys new book)'
  ],
  '-e-Akk-Pl': [
    'Wir haben gute Freunde. (We have good friends)',
    'Sie essen frische Äpfel. (They eat fresh apples)',
    'Ich kaufe neue Bücher. (I buy new books)'
  ],

  // Dativ
  '-em-Dat-M': [
    'Mit gutem Wein schmeckt es besser. (With good wine it tastes better)',
    'Von altem Freund höre ich. (From old friend I hear)',
    'Mit jungem Mann spreche ich. (With young man I speak)'
  ],
  '-er-Dat-F': [
    'Mit guter Laune arbeitet er. (With good mood he works)',
    'Von alter Freundin höre ich. (From old friend I hear)',
    'Mit junger Frau spreche ich. (With young woman I speak)'
  ],
  '-em-Dat-N': [
    'Mit gutem Buch lerne ich. (With good book I learn)',
    'Von kleinem Kind höre ich. (From small child I hear)',
    'Mit neuem Auto fahre ich. (With new car I drive)'
  ],
  '-en-Dat-Pl': [
    'Mit guten Freunden feiere ich. (With good friends I celebrate)',
    'Von alten Leuten lerne ich. (From old people I learn)',
    'Mit kleinen Kindern spiele ich. (With small children I play)'
  ],

  // Genitiv
  '-en-Gen-M': [
    'Der Preis guten Weins. (The price of good wine)',
    'Der Geruch frischen Brots. (The smell of fresh bread)',
    'Die Farbe roten Weins. (The color of red wine)'
  ],
  '-er-Gen-F': [
    'Der Geschmack guter Milch. (The taste of good milk)',
    'Der Duft frischer Blume. (The scent of fresh flower)',
    'Die Qualität alter Musik. (The quality of old music)'
  ],
  '-en-Gen-N': [
    'Der Geschmack guten Brots. (The taste of good bread)',
    'Der Preis neuen Autos. (The price of new car)',
    'Die Farbe kalten Wassers. (The color of cold water)'
  ],
  '-er-Gen-Pl': [
    'Die Meinung guter Freunde. (The opinion of good friends)',
    'Die Namen alter Leute. (The names of old people)',
    'Die Preise neuer Bücher. (The prices of new books)'
  ],

  // ===== MIXED ADJECTIVE DECLENSION =====

  // Nominativ
  '-er-Nom-M': [
    'Ein großer Mann kommt. (A big man comes)',
    'Ein alter Hund schläft. (An old dog sleeps)',
    'Mein junger Bruder arbeitet. (My young brother works)'
  ],
  '-e-Nom-F': [
    'Eine schöne Frau singt. (A beautiful woman sings)',
    'Eine alte Katze schläft. (An old cat sleeps)',
    'Meine junge Schwester tanzt. (My young sister dances)'
  ],
  '-es-Nom-N': [
    'Ein kleines Kind spielt. (A small child plays)',
    'Ein neues Auto fährt. (A new car drives)',
    'Mein großes Haus steht dort. (My big house stands there)'
  ],
  '-en-Nom-Pl': [
    'Meine großen Brüder arbeiten. (My big brothers work)',
    'Keine kleinen Kinder spielen. (No small children play)',
    'Unsere neuen Autos fahren. (Our new cars drive)'
  ],

  // Akkusativ
  '-en-Akk-M': [
    'Ich sehe einen großen Mann. (I see a big man)',
    'Sie liebt einen alten Hund. (She loves an old dog)',
    'Wir kennen meinen jungen Bruder. (We know my young brother)'
  ],
  '-e-Akk-F': [
    'Er kennt eine schöne Frau. (He knows a beautiful woman)',
    'Wir haben eine alte Katze. (We have an old cat)',
    'Sie sieht meine junge Schwester. (She sees my young sister)'
  ],
  '-es-Akk-N': [
    'Ich kaufe ein neues Buch. (I buy a new book)',
    'Sie hat ein kleines Auto. (She has a small car)',
    'Er möchte mein großes Haus. (He wants my big house)'
  ],
  '-en-Akk-Pl': [
    'Er sieht meine großen Brüder. (He sees my big brothers)',
    'Wir lesen keine alten Bücher. (We read no old books)',
    'Sie kennt unsere kleinen Kinder. (She knows our small children)'
  ],

  // Dativ
  '-en-Dat-M': [
    'Ich gebe einem großen Mann das Buch. (I give a big man the book)',
    'Sie hilft einem alten Mann. (She helps an old man)',
    'Wir folgen meinem jungen Bruder. (We follow my young brother)'
  ],
  '-en-Dat-F': [
    'Er gibt einer schönen Frau Blumen. (He gives a beautiful woman flowers)',
    'Wir danken einer alten Lehrerin. (We thank an old teacher)',
    'Sie hilft meiner jungen Schwester. (She helps my young sister)'
  ],
  '-en-Dat-N': [
    'Sie folgt einem kleinen Kind. (She follows a small child)',
    'Er hilft einem neuen Baby. (He helps a new baby)',
    'Wir danken unserem großen Unternehmen. (We thank our big company)'
  ],
  '-en-Dat-Pl': [
    'Ich helfe meinen kleinen Kindern. (I help my small children)',
    'Sie dankt keinen alten Freunden. (She thanks no old friends)',
    'Wir folgen unseren jungen Leuten. (We follow our young people)'
  ],

  // Genitiv
  '-en-Gen-M': [
    'Das Auto eines reichen Mannes. (A rich man\'s car)',
    'Die Farbe meines alten Hundes. (My old dog\'s color)',
    'Das Haus eines jungen Mannes. (A young man\'s house)'
  ],
  '-en-Gen-F': [
    'Das Buch einer netten Frau. (A nice woman\'s book)',
    'Die Tochter meiner alten Lehrerin. (My old teacher\'s daughter)',
    'Das Auto einer jungen Frau. (A young woman\'s car)'
  ],
  '-en-Gen-N': [
    'Die Farbe eines neuen Autos. (A new car\'s color)',
    'Das Zimmer meines kleinen Kindes. (My small child\'s room)',
    'Die Tür eines großen Hauses. (A big house\'s door)'
  ],
  '-en-Gen-Pl': [
    'Die Bücher meiner kleinen Kinder. (My small children\'s books)',
    'Die Namen keiner neuen Studenten. (No new students\' names)',
    'Die Autos unserer reichen Leute. (Our rich people\'s cars)'
  ]
};

export default examples;

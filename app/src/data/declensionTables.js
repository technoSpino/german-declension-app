// German Declension Tables Data
// Each table contains a grid with: [case, masculine, feminine, neuter, plural]

export const tables = {
  definiteArticle: {
    id: 'definiteArticle',
    name: 'Definite Article (der/die/das)',
    description: 'Use with specific, known nouns',
    grid: [
      // [case, masculine, feminine, neuter, plural]
      ['Nom', 'der', 'die', 'das', 'die'],
      ['Akk', 'den', 'die', 'das', 'die'],
      ['Dat', 'dem', 'der', 'dem', 'den'],
      ['Gen', 'des', 'der', 'des', 'der']
    ]
  },

  indefiniteArticle: {
    id: 'indefiniteArticle',
    name: 'Indefinite Article (ein/eine)',
    description: 'Use with non-specific nouns',
    grid: [
      ['Nom', 'ein', 'eine', 'ein', '—'],
      ['Akk', 'einen', 'eine', 'ein', '—'],
      ['Dat', 'einem', 'einer', 'einem', '—'],
      ['Gen', 'eines', 'einer', 'eines', '—']
    ]
  },

  adjectiveWeak: {
    id: 'adjectiveWeak',
    name: 'Adjective - Weak Declension',
    description: 'After definite articles (der/die/das)',
    grid: [
      ['Nom', '-e', '-e', '-e', '-en'],
      ['Akk', '-en', '-e', '-e', '-en'],
      ['Dat', '-en', '-en', '-en', '-en'],
      ['Gen', '-en', '-en', '-en', '-en']
    ]
  },

  adjectiveStrong: {
    id: 'adjectiveStrong',
    name: 'Adjective - Strong Declension',
    description: 'Without any article',
    grid: [
      ['Nom', '-er', '-e', '-es', '-e'],
      ['Akk', '-en', '-e', '-es', '-e'],
      ['Dat', '-em', '-er', '-em', '-en'],
      ['Gen', '-en', '-er', '-en', '-er']
    ]
  },

  adjectiveMixed: {
    id: 'adjectiveMixed',
    name: 'Adjective - Mixed Declension',
    description: 'After indefinite articles (ein/eine/kein/mein)',
    grid: [
      ['Nom', '-er', '-e', '-es', '-en'],
      ['Akk', '-en', '-e', '-es', '-en'],
      ['Dat', '-en', '-en', '-en', '-en'],
      ['Gen', '-en', '-en', '-en', '-en']
    ]
  }
};

// Helper function to get case class name
export const getCaseClass = (caseType) => {
  const caseMap = {
    'Nom': 'nom',
    'Akk': 'akk',
    'Dat': 'dat',
    'Gen': 'gen'
  };
  return caseMap[caseType] || '';
};

// Helper function to get gender label
export const getGenderLabel = (index) => {
  const genderLabels = ['M', 'F', 'N', 'Pl'];
  return genderLabels[index] || '';
};

export default tables;

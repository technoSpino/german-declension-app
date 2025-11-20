// German Declension Tables Data
// Each table contains a grid with: [case, masculine, feminine, neuter, plural]

export const tables = {
  adjectiveExamples: {
    id: 'adjectiveExamples',
    name: 'German Declension with Adjectives',
    description: 'Articles + adjectives highlighted to show patterns',
    grid: [
      ['Nom', '<b>der</b> nett<span class="ending-e">e</span> Mann\n<b>ein</b> nett<span class="ending-er">er</span> Mann', '<b>das</b> nett<span class="ending-e">e</span> Kind\n<b>ein</b> nett<span class="ending-es">es</span> Kind', '<b>die</b> nett<span class="ending-e">e</span> Frau\n<b>eine</b> nett<span class="ending-e">e</span> Frau', '<b>die</b> nett<span class="ending-en">en</span> Leute\nnett<span class="ending-e">e</span> Leute'],
      ['Akk', '<b>den</b> nett<span class="ending-en">en</span> Mann\n<b>einen</b> nett<span class="ending-en">en</span> Mann', '<b>das</b> nett<span class="ending-e">e</span> Kind\n<b>ein</b> nett<span class="ending-es">es</span> Kind', '<b>die</b> toll<span class="ending-e">e</span> Frau\n<b>eine</b> toll<span class="ending-e">e</span> Frau', '<b>die</b> nett<span class="ending-en">en</span> Leute\nnett<span class="ending-e">e</span> Leute'],
      ['Dat', '<b>dem</b> nett<span class="ending-en">en</span> Mann\n<b>einem</b> nett<span class="ending-en">en</span> Mann', '<b>dem</b> nett<span class="ending-en">en</span> Kind\n<b>einem</b> nett<span class="ending-en">en</span> Kind', '<b>der</b> nett<span class="ending-en">en</span> Frau\n<b>einer</b> nett<span class="ending-en">en</span> Frau', '<b>den</b> nett<span class="ending-en">en</span> Leuten\nnett<span class="ending-en">en</span> Leuten'],
      ['Gen', '<b>des</b> nett<span class="ending-en">en</span> Mannes\n<b>eines</b> nett<span class="ending-en">en</span> Mannes', '<b>des</b> nett<span class="ending-en">en</span> Kindes\n<b>eines</b> nett<span class="ending-en">en</span> Kindes', '<b>der</b> nett<span class="ending-en">en</span> Frau\n<b>einer</b> nett<span class="ending-en">en</span> Frau', '<b>der</b> nett<span class="ending-en">en</span> Leute\nnett<span class="ending-er">er</span> Leute']
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

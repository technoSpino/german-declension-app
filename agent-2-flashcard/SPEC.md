# AGENT 2: FLASHCARD MODULE

## Mission
Build a flashcard system for German declension practice with Leitner box scheduling.

## Deliverable
A single HTML page with flashcard study interface and localStorage persistence.

---

## Card Data Structure

```javascript
const flashcards = [
  {
    id: 1,
    front: "Ich sehe ___ großen Hund",
    back: "den",
    explanation: "Akkusativ, masculine (Hund), weak declension after 'der'",
    hint: "(accusative, masculine)",
    tags: ["akkusativ", "masculine", "weak"],
    box: 1, // Leitner box (1-5)
    nextReview: null, // timestamp or null for new cards
    correctCount: 0,
    incorrectCount: 0
  },
  // ... 49 more cards
];
```

---

## Leitner System (Simplified)

### Box Intervals
```javascript
const intervals = {
  1: 0,           // review immediately (new or failed)
  2: 1,           // 1 day
  3: 3,           // 3 days
  4: 7,           // 1 week
  5: 14           // 2 weeks (mastered)
};
```

### Rules
- **New card**: starts in box 1
- **Correct answer**: move to next box (max box 5)
- **Incorrect answer**: move back to box 1
- **Next review**: current timestamp + interval in days

### Calculation
```javascript
function scheduleNextReview(box) {
  const days = intervals[box];
  const now = new Date();
  const nextReview = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  return nextReview.getTime();
}

function isCardDue(card) {
  if (!card.nextReview) return true; // new card
  return Date.now() >= card.nextReview;
}
```

---

## Features

### 1. Study Mode
- Show only cards due for review
- Display front of card with clear text
- "Show Answer" button reveals back
- After reveal: "Again" and "Good" buttons
- Progress indicator: "Card 5 / 12" or "12 cards due today"
- Smooth flip animation (CSS)

### 2. Card Display
- **Front view**:
  - Large, centered German sentence with blank
  - Hint shown below (case, gender)
  - Case color indicator (small badge/border)
  
- **Back view**:
  - Correct answer (large text)
  - Detailed explanation
  - Example with full sentence
  - Answer buttons at bottom

### 3. Browse Mode
- List all cards (not just due)
- Show: front text, box number, next review date
- Filter by tag (dropdown or buttons)
  - All cards
  - By case (Nominativ, Akkusativ, Dativ, Genitiv)
  - By gender (M, F, N, Pl)
  - By box (1-5)
- Click card → study immediately
- Pagination if >50 cards

### 4. Stats Dashboard
- **Today's Stats**:
  - Cards studied today: X
  - New cards: Y
  - Review cards: Z
  - Accuracy: X%
  
- **Overall Stats**:
  - Total cards: 50
  - Cards due today: X
  - Cards in each box: [10, 15, 12, 8, 5]
  - Study streak: X days

- **Visual**: Simple bar chart or progress circles

---

## UI Layout

### Study Mode (Front)
```
┌───────────────────────────────────────┐
│  Flashcards                      [≡]  │
│  [Study] [Browse] [Stats]            │
├───────────────────────────────────────┤
│                                       │
│         Card 5 / 12                   │
│                                       │
│    Ich sehe ___ großen Hund          │
│                                       │
│    (accusative, masculine)            │
│                                       │
│       [Show Answer]                   │
│                                       │
└───────────────────────────────────────┘
```

### Study Mode (Back)
```
┌───────────────────────────────────────┐
│  Flashcards                      [≡]  │
│  [Study] [Browse] [Stats]            │
├───────────────────────────────────────┤
│                                       │
│         den                           │
│                                       │
│  Akkusativ, masculine, weak           │
│  "Hund" is masculine                  │
│  Ich sehe den großen Hund             │
│                                       │
│  [Again]              [Good]          │
│                                       │
└───────────────────────────────────────┘
```

### Browse Mode
```
┌───────────────────────────────────────┐
│  Flashcards                      [≡]  │
│  [Study] [Browse] [Stats]            │
├───────────────────────────────────────┤
│  Filter: [All] [Nom] [Akk] [Dat]     │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ Ich sehe ___ Mann      Box: 3   │ │
│  │ Next: in 2 days                 │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ Das Buch ___ Frau      Box: 1   │ │
│  │ Next: now                       │ │
│  └─────────────────────────────────┘ │
│                                       │
│  Showing 1-10 of 50                   │
└───────────────────────────────────────┘
```

### Stats Mode
```
┌───────────────────────────────────────┐
│  Flashcards                      [≡]  │
│  [Study] [Browse] [Stats]            │
├───────────────────────────────────────┤
│  Today's Progress                     │
│  ━━━━━━━━━━━━━━━━━━ 12/12            │
│                                       │
│  Cards studied:     12                │
│  Accuracy:          83%               │
│                                       │
│  ─────────────────────────────────    │
│                                       │
│  Overall                              │
│  Total cards:       50                │
│  Due today:         0                 │
│  Study streak:      7 days            │
│                                       │
│  Cards by box:                        │
│  Box 1: ██████ 6                      │
│  Box 2: ████████████ 12               │
│  Box 3: ██████████ 10                 │
│  Box 4: ████████ 8                    │
│  Box 5: ██████████████ 14             │
└───────────────────────────────────────┘
```

---

## Card Generation Requirements

Generate **50 flashcards** covering:

### Distribution
- **Cases**: 12-13 cards per case (Nom, Akk, Dat, Gen)
- **Genders**: Balanced across M, F, N, Pl
- **Types**: Mix of articles and adjectives
- **Difficulty**: 
  - 15 easy (obvious patterns)
  - 25 medium (common cases)
  - 10 hard (tricky endings, confusing pairs)

### Card Types

#### Type 1: Article Fill-in-the-Blank
```javascript
{
  front: "Ich sehe ___ Mann",
  back: "den",
  explanation: "Akkusativ, masculine. 'sehen' takes accusative (direct object)",
  hint: "(accusative, masculine)",
  tags: ["akkusativ", "masculine", "article"]
}
```

#### Type 2: Adjective Fill-in-the-Blank
```javascript
{
  front: "Der ___ Hund (big dog, nominative)",
  back: "große",
  explanation: "Nominativ, masculine, weak declension (-e after der)",
  hint: "(nominative, masculine, weak)",
  tags: ["nominativ", "masculine", "weak"]
}
```

#### Type 3: Combined
```javascript
{
  front: "Ich gebe ___ kleinen Kind ein Buch",
  back: "dem",
  explanation: "Dativ, neuter. 'geben' takes dative (indirect object)",
  hint: "(dative, neuter)",
  tags: ["dativ", "neuter", "article"]
}
```

### Example Topics
Use common, useful vocabulary:
- Family: Mann, Frau, Kind, Mutter, Vater
- Animals: Hund, Katze, Vogel
- Objects: Buch, Auto, Haus, Tisch
- People: Freund, Lehrer, Student
- Abstract: Tag, Woche, Zeit, Leben

### Common Verbs (Case Triggers)
- **Akkusativ**: sehen, haben, brauchen, kaufen, lesen
- **Dativ**: geben, helfen, gehören, gefallen, danken
- **Genitiv**: prepositional phrases (wegen, während, trotz)

---

## Data Persistence

### LocalStorage Schema
```javascript
// Main storage key
const STORAGE_KEY = 'germanFlashcards';

// Save after every answer
function saveProgress() {
  const data = {
    cards: flashcards,
    stats: {
      totalStudied: 0,
      accuracy: 0,
      lastStudyDate: Date.now(),
      streak: 0,
      sessionsCompleted: 0
    },
    version: '1.0'
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Load on page init
function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    return data.cards;
  }
  return null; // use default cards
}

// Update individual card
function updateCard(cardId, isCorrect) {
  const card = flashcards.find(c => c.id === cardId);
  
  if (isCorrect) {
    card.correctCount++;
    card.box = Math.min(card.box + 1, 5); // move up, max 5
  } else {
    card.incorrectCount++;
    card.box = 1; // back to beginning
  }
  
  card.nextReview = scheduleNextReview(card.box);
  saveProgress();
}
```

### Stats Calculation
```javascript
function calculateStats() {
  const today = new Date().toDateString();
  const todayCards = flashcards.filter(c => 
    new Date(c.lastReviewed).toDateString() === today
  );
  
  const dueCards = flashcards.filter(c => isCardDue(c));
  
  const totalCorrect = flashcards.reduce((sum, c) => sum + c.correctCount, 0);
  const totalIncorrect = flashcards.reduce((sum, c) => sum + c.incorrectCount, 0);
  const accuracy = totalCorrect / (totalCorrect + totalIncorrect) * 100;
  
  return {
    studiedToday: todayCards.length,
    dueToday: dueCards.length,
    accuracy: Math.round(accuracy),
    cardsByBox: {
      1: flashcards.filter(c => c.box === 1).length,
      2: flashcards.filter(c => c.box === 2).length,
      3: flashcards.filter(c => c.box === 3).length,
      4: flashcards.filter(c => c.box === 4).length,
      5: flashcards.filter(c => c.box === 5).length
    }
  };
}
```

---

## Technical Constraints

- **Single HTML file** (inline CSS/JS acceptable)
- **No external dependencies**
- **LocalStorage** for all persistence
- **Works offline** after initial load
- **Mobile-friendly** (tap-friendly buttons)
- **File size**: <80KB

---

## Implementation Checklist

### Phase 1: Card Generation
- [ ] Generate 50 flashcards with proper data
- [ ] Cover all cases and genders
- [ ] Write quality explanations
- [ ] Test card data structure

### Phase 2: Study Interface
- [ ] Render card front
- [ ] "Show Answer" button
- [ ] Reveal back with animation
- [ ] "Again" and "Good" buttons
- [ ] Update card on answer

### Phase 3: Leitner System
- [ ] Implement scheduling algorithm
- [ ] Calculate next review dates
- [ ] Filter for due cards
- [ ] Move cards between boxes

### Phase 4: Browse Mode
- [ ] List all cards
- [ ] Implement filters
- [ ] Show card metadata (box, next review)
- [ ] Click to study

### Phase 5: Stats
- [ ] Calculate daily stats
- [ ] Calculate overall stats
- [ ] Display stats visually
- [ ] Track study streak

### Phase 6: Persistence
- [ ] Save to localStorage on answer
- [ ] Load from localStorage on init
- [ ] Handle first-time users (seed data)
- [ ] Migrate old data if schema changes

---

## Testing Checklist

### Functionality
- [ ] Cards display correctly
- [ ] Show/hide answer works
- [ ] Correct answer moves card to next box
- [ ] Incorrect answer moves card to box 1
- [ ] Due cards calculated correctly
- [ ] LocalStorage saves and loads
- [ ] Filters work in browse mode
- [ ] Stats calculate accurately

### User Experience
- [ ] Flip animation is smooth
- [ ] Buttons are easy to tap (mobile)
- [ ] Text is readable
- [ ] Progress indicator is clear
- [ ] Navigation between modes works

### Edge Cases
- [ ] No cards due (show message)
- [ ] All cards mastered (congratulations)
- [ ] First-time user (seed data)
- [ ] LocalStorage full (graceful degradation)
- [ ] Invalid dates handled

### Data Integrity
- [ ] Card counts match
- [ ] No duplicate IDs
- [ ] Dates are valid timestamps
- [ ] Box values are 1-5
- [ ] Stats add up correctly

---

## Code Quality

### JavaScript Best Practices
- Use modules/sections with comments
- Separate concerns (data, UI, logic)
- Pure functions where possible
- Handle errors gracefully
- No global pollution

### Performance
- Don't re-render entire UI on every action
- Use event delegation
- Debounce save operations (optional)
- Cache DOM queries

### Maintainability
- Clear variable names
- Comment complex logic
- Consistent code style
- DRY (Don't Repeat Yourself)

---

## Example Card Data

Here are 10 example cards to get started:

```javascript
const exampleCards = [
  {
    id: 1,
    front: "Ich sehe ___ Mann",
    back: "den",
    explanation: "Akkusativ, masculine. 'sehen' takes accusative (direct object)",
    hint: "(accusative, masculine)",
    tags: ["akkusativ", "masculine", "article"],
    box: 1,
    nextReview: null,
    correctCount: 0,
    incorrectCount: 0
  },
  {
    id: 2,
    front: "___ Frau ist schön",
    back: "Die",
    explanation: "Nominativ, feminine. Subject of sentence.",
    hint: "(nominative, feminine)",
    tags: ["nominativ", "feminine", "article"],
    box: 1,
    nextReview: null,
    correctCount: 0,
    incorrectCount: 0
  },
  {
    id: 3,
    front: "Ich gebe ___ Kind ein Buch",
    back: "dem",
    explanation: "Dativ, neuter. 'geben' takes dative (indirect object).",
    hint: "(dative, neuter)",
    tags: ["dativ", "neuter", "article"],
    box: 1,
    nextReview: null,
    correctCount: 0,
    incorrectCount: 0
  },
  {
    id: 4,
    front: "Das Haus ___ Mannes ist groß",
    back: "des",
    explanation: "Genitiv, masculine. Possessive (of the man).",
    hint: "(genitive, masculine)",
    tags: ["genitiv", "masculine", "article"],
    box: 1,
    nextReview: null,
    correctCount: 0,
    incorrectCount: 0
  },
  {
    id: 5,
    front: "Der ___ Hund (big, nominative)",
    back: "große",
    explanation: "Nominativ, masculine, weak declension. After 'der', use -e.",
    hint: "(nominative, masculine, weak)",
    tags: ["nominativ", "masculine", "weak"],
    box: 1,
    nextReview: null,
    correctCount: 0,
    incorrectCount: 0
  },
  {
    id: 6,
    front: "Ich sehe die ___ Katze (small, accusative)",
    back: "kleine",
    explanation: "Akkusativ, feminine, weak declension. After 'die', use -e.",
    hint: "(accusative, feminine, weak)",
    tags: ["akkusativ", "feminine", "weak"],
    box: 1,
    nextReview: null,
    correctCount: 0,
    incorrectCount: 0
  },
  {
    id: 7,
    front: "Mit ___ alten Freund",
    back: "dem",
    explanation: "Dativ, masculine. Preposition 'mit' takes dative.",
    hint: "(dative, masculine)",
    tags: ["dativ", "masculine", "article"],
    box: 1,
    nextReview: null,
    correctCount: 0,
    incorrectCount: 0
  },
  {
    id: 8,
    front: "___ schnelles Auto (a fast car, nominative)",
    back: "Ein",
    explanation: "Nominativ, neuter, indefinite article.",
    hint: "(nominative, neuter)",
    tags: ["nominativ", "neuter", "article"],
    box: 1,
    nextReview: null,
    correctCount: 0,
    incorrectCount: 0
  },
  {
    id: 9,
    front: "Ich helfe ___ Kindern (the children)",
    back: "den",
    explanation: "Dativ, plural. 'helfen' takes dative.",
    hint: "(dative, plural)",
    tags: ["dativ", "plural", "article"],
    box: 1,
    nextReview: null,
    correctCount: 0,
    incorrectCount: 0
  },
  {
    id: 10,
    front: "___ schöne Blume (beautiful flower, strong, nominative)",
    back: "Schöne",
    explanation: "Nominativ, feminine, strong declension. No article, so use -e.",
    hint: "(nominative, feminine, strong)",
    tags: ["nominativ", "feminine", "strong"],
    box: 1,
    nextReview: null,
    correctCount: 0,
    incorrectCount: 0
  }
];
```

---

## Success Criteria

When complete, you should be able to:
1. ✅ Study cards due for review
2. ✅ Answer correct → card moves to next box
3. ✅ Answer incorrect → card returns to box 1
4. ✅ Browse all cards with filters
5. ✅ See accurate stats
6. ✅ Progress persists across sessions
7. ✅ Use comfortably on mobile

---

## Tips for Claude Code

1. Start with 10 cards to test the system
2. Get Leitner scheduling working first
3. Test localStorage early and often
4. Generate remaining 40 cards once system works
5. Use realistic example sentences
6. Make buttons large (mobile-friendly)
7. Test edge cases (no due cards, all mastered)

---

## Next Steps

After completing this module:
1. Test on mobile device
2. Study 10 cards yourself to verify UX
3. Check localStorage in DevTools
4. Verify stats are accurate
5. Proceed to Agent 3 (Integration)

**Ready to build!** 🎴

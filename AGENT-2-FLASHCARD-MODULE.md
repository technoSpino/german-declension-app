# AGENT 2: FLASHCARD MODULE

## Mission
Build a basic flashcard system for German declension practice with simple scheduling and localStorage persistence.

## Deliverable
A single HTML page with flashcard study interface that saves progress locally.

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
    nextReview: null, // timestamp or null
    correctCount: 0,
    incorrectCount: 0,
    created: Date.now()
  },
  // Generate ~50 cards covering all cases/genders
];
```

---

## Simple Leitner System

```javascript
// Box intervals (simpler than SM-2)
const intervals = {
  1: 0,           // review immediately
  2: 1,           // 1 day
  3: 3,           // 3 days
  4: 7,           // 1 week
  5: 14           // 2 weeks
};

// On answer:
function handleAnswer(card, correct) {
  if (correct) {
    card.correctCount++;
    card.box = Math.min(card.box + 1, 5); // Move up, max box 5
  } else {
    card.incorrectCount++;
    card.box = 1; // Reset to box 1
  }
  
  // Calculate next review date
  const daysToAdd = intervals[card.box];
  card.nextReview = Date.now() + (daysToAdd * 24 * 60 * 60 * 1000);
  
  saveProgress();
}

// Get cards due for review
function getDueCards() {
  const now = Date.now();
  return flashcards.filter(card => 
    card.nextReview === null || card.nextReview <= now
  );
}
```

---

## Features

### 1. Study Mode
- Show cards due for review
- Display front of card with large, centered text
- "Show Answer" button reveals back
- "Again" / "Good" buttons after reveal
- Progress indicator (X/Y cards studied today)
- Auto-advance to next card

### 2. Card Display
- Large, centered text (24px+)
- Subtle case color indicator (border or badge)
- Explanation shown after answering
- Smooth flip animation (CSS)
- Clear hierarchy (question → answer → explanation)

### 3. Browse Mode
- List all cards in a grid or list
- Filter by tag (case, gender, declension type)
- Show next review date for each card
- Click to study immediately
- Sort by: due date, box number, accuracy

### 4. Stats (Simple)
- Cards studied today: X
- Total cards: Y
- Due today: Z
- Overall accuracy: X%
- Per-case accuracy breakdown

---

## UI Layout

### Study Mode - Front
```
┌─────────────────────────────────────┐
│  German Flashcards                  │
│  [Study] [Browse] [Stats]           │
├─────────────────────────────────────┤
│                                     │
│         Card 5 / 12                 │
│                                     │
│     Ich sehe ___ großen Hund        │
│                                     │
│     💡 (accusative, masculine)      │
│                                     │
│     [Show Answer]                   │
│                                     │
└─────────────────────────────────────┘
```

### Study Mode - Back
```
┌─────────────────────────────────────┐
│                                     │
│         Card 5 / 12                 │
│                                     │
│            den                      │
│                                     │
│  📝 Akkusativ, masculine, weak      │
│     (Hund is masculine)             │
│                                     │
│  [Again]              [Good]        │
│                                     │
└─────────────────────────────────────┘
```

### Browse Mode
```
┌─────────────────────────────────────┐
│  Browse Cards                       │
│  Filter: [All] [Nom] [Akk] [Dat]   │
├─────────────────────────────────────┤
│  📇 Ich sehe ___ Mann               │
│     Due: Today | Box: 2             │
├─────────────────────────────────────┤
│  📇 Das Buch ___ Frau               │
│     Due: Nov 22 | Box: 3            │
├─────────────────────────────────────┤
│  ... (more cards)                   │
└─────────────────────────────────────┘
```

### Stats Mode
```
┌─────────────────────────────────────┐
│  Your Progress                      │
├─────────────────────────────────────┤
│  📊 Total Cards: 50                 │
│  ✅ Studied Today: 12               │
│  🎯 Due Today: 5                    │
│  📈 Overall Accuracy: 78%           │
│                                     │
│  By Case:                           │
│  • Nominativ:   85%                 │
│  • Akkusativ:   72%                 │
│  • Dativ:       68%                 │
│  • Genitiv:     80%                 │
└─────────────────────────────────────┘
```

---

## Card Generation Rules

Generate 50 cards that cover:
- All 4 cases × 4 genders = 16 core combinations
- Mix of article and adjective declensions
- Real, useful example sentences
- Difficulty range (some obvious, some tricky)
- Common German words (Mann, Frau, Kind, Buch, Auto, Haus, etc.)

### Example Card Templates

**Articles:**
```javascript
// Nominative
{ front: "Das ist ___ Mann", back: "der", hint: "(nominative, masculine)" }
{ front: "___ Frau ist nett", back: "die", hint: "(nominative, feminine)" }
{ front: "___ Kind spielt", back: "das", hint: "(nominative, neuter)" }

// Accusative  
{ front: "Ich sehe ___ Mann", back: "den", hint: "(accusative, masculine)" }
{ front: "Ich kenne ___ Frau", back: "die", hint: "(accusative, feminine)" }
{ front: "Ich höre ___ Kind", back: "das", hint: "(accusative, neuter)" }

// Dative
{ front: "Ich gebe ___ Mann das Buch", back: "dem", hint: "(dative, masculine)" }
{ front: "Ich helfe ___ Frau", back: "der", hint: "(dative, feminine)" }
{ front: "Ich gebe ___ Kind Spielzeug", back: "dem", hint: "(dative, neuter)" }

// Genitive
{ front: "Das Auto ___ Mannes", back: "des", hint: "(genitive, masculine)" }
{ front: "Das Haus ___ Frau", back: "der", hint: "(genitive, feminine)" }
{ front: "Die Mutter ___ Kindes", back: "des", hint: "(genitive, neuter)" }
```

**Adjectives:**
```javascript
// Weak declension (after der/die/das)
{ front: "Der ___ Hund (groß)", back: "große", hint: "(nominative, masculine, weak)" }
{ front: "Ich sehe den ___ Hund (groß)", back: "großen", hint: "(accusative, masculine, weak)" }

// Strong declension (no article)
{ front: "___ Wetter (gut)", back: "Gutes", hint: "(nominative, neuter, strong)" }
{ front: "Mit ___ Wetter (gut)", back: "gutem", hint: "(dative, neuter, strong)" }

// Mixed declension (after ein/eine)
{ front: "Ein ___ Mann (alt)", back: "alter", hint: "(nominative, masculine, mixed)" }
{ front: "Eine ___ Frau (jung)", back: "junge", hint: "(nominative, feminine, mixed)" }
```

---

## Data Persistence

```javascript
// Save to localStorage on every answer
function saveProgress() {
  const data = {
    flashcards: flashcards,
    stats: {
      lastStudyDate: new Date().toISOString(),
      totalStudySessions: stats.totalStudySessions
    }
  };
  localStorage.setItem('germanFlashcards', JSON.stringify(data));
}

// Load on page load
function loadProgress() {
  const saved = localStorage.getItem('germanFlashcards');
  if (saved) {
    const data = JSON.parse(saved);
    return data.flashcards;
  }
  return generateDefaultCards();
}

// Reset progress (with confirmation)
function resetProgress() {
  if (confirm('Are you sure? This will delete all progress.')) {
    localStorage.removeItem('germanFlashcards');
    location.reload();
  }
}
```

---

## Technical Constraints

- Single HTML file (inline CSS/JS or separate files)
- No external dependencies (vanilla JavaScript)
- localStorage for persistence
- Works offline after first load
- Mobile-friendly (swipe gestures optional but nice)
- Keyboard shortcuts (Space = reveal, 1 = Again, 2 = Good)
- Total file size <100KB

---

## Output Files

```
flashcard-module/
  index.html          (complete flashcard app)
  README.md           (usage instructions)
```

---

## Testing Checklist

- [ ] Cards display correctly in study mode
- [ ] "Show Answer" button works
- [ ] "Again" button moves card to box 1
- [ ] "Good" button advances box correctly
- [ ] Progress saves to localStorage
- [ ] Progress loads on page reload
- [ ] Due date calculation is correct
- [ ] Stats update accurately after each card
- [ ] Filter works in browse mode
- [ ] Cards can be studied from browse mode
- [ ] Keyboard shortcuts work (Space, 1, 2)
- [ ] Mobile responsive (works on 320px width)
- [ ] No console errors
- [ ] Reset button works with confirmation

---

## Advanced Features (Optional for MVP)

### Keyboard Shortcuts
- `Space` or `Enter`: Show answer / Next card
- `1` or `a`: Mark as "Again"
- `2` or `g`: Mark as "Good"
- `r`: Restart session
- `?`: Show help

### Session Stats
- Track cards answered in current session
- Show accuracy for current session
- Timer for session duration
- "End Session" button to see summary

### Animations
- Card flip animation (CSS 3D transform)
- Smooth transitions between cards
- Progress bar animation
- Celebration animation on session complete

---

## Development Tips

1. **Start with data**: Create the 50 card objects first
2. **Build study UI**: Show one card at a time
3. **Add Leitner logic**: Box progression and scheduling
4. **Implement persistence**: localStorage save/load
5. **Add browse mode**: List view with filters
6. **Polish**: Animations, stats, keyboard shortcuts

---

## Acceptance Criteria

✅ User can study cards due for review
✅ Leitner system correctly schedules cards
✅ Progress saves and loads from localStorage
✅ Browse mode shows all cards with filters
✅ Stats accurately reflect user performance
✅ Works on mobile devices
✅ Keyboard shortcuts functional
✅ Code is clean and well-commented
✅ No bugs or console errors

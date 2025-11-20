# AGENT 2: FLASHCARD MODULE

## Mission
Build a flashcard study system for German declension practice with simple Leitner box scheduling and localStorage persistence.

---

## Deliverable
A single, self-contained HTML file (`flashcards.html`) with embedded CSS and JavaScript that implements a complete flashcard study system.

---

## Data Structure

### Flashcard Schema

```javascript
const flashcardSchema = {
  id: 1,                           // Unique identifier
  front: "Ich sehe ___ Mann",      // Question with blank
  back: "den",                     // Correct answer
  explanation: "Akkusativ, masculine (Mann is masculine, sehen takes accusative)",
  hint: "(accusative, masculine)", // Optional hint shown on front
  tags: ["akkusativ", "masculine", "article"],
  box: 1,                          // Leitner box (1-5)
  nextReview: null,                // Timestamp for next review (null = review now)
  correctCount: 0,                 // Times answered correctly
  incorrectCount: 0,               // Times answered incorrectly
  lastReviewed: null,              // Last review timestamp
  created: 1234567890              // Creation timestamp
};
```

### Leitner Box System

```javascript
// Box intervals (days until next review)
const boxIntervals = {
  1: 0,    // Review immediately (failed cards)
  2: 1,    // Review in 1 day
  3: 3,    // Review in 3 days
  4: 7,    // Review in 1 week
  5: 14    // Review in 2 weeks (mastered)
};

// Promotion/demotion rules:
// Correct answer: Move to next box (max box 5)
// Incorrect answer: Move to box 1
```

---

## Card Generation

### Required Cards (Minimum 50)

Generate cards covering:
- **Articles:** 16 cells (4 cases × 4 genders) for definite and indefinite
- **Adjectives:** 16 cells for weak, strong, and mixed declensions
- **Mix of easy, medium, and hard cards**

### Card Templates

**Article Cards:**
```javascript
// Definite Article Examples
{
  front: "Ich sehe ___ Mann",
  back: "den",
  explanation: "Akkusativ, masculine. 'sehen' (to see) takes accusative case.",
  hint: "(accusative, masculine)",
  tags: ["akkusativ", "masculine", "definite-article"]
},
{
  front: "Das Buch ___ Frau ist interessant",
  back: "der",
  explanation: "Genitiv, feminine. Shows possession (the woman's book).",
  hint: "(genitive, feminine)",
  tags: ["genitiv", "feminine", "definite-article"]
}

// Indefinite Article Examples
{
  front: "___ Mann kommt",
  back: "Ein",
  explanation: "Nominativ, masculine. Subject of the sentence.",
  hint: "(nominative, masculine)",
  tags: ["nominativ", "masculine", "indefinite-article"]
}
```

**Adjective Cards:**
```javascript
// Weak Declension (after definite article)
{
  front: "Der ___ Mann (groß)",
  back: "große",
  explanation: "Weak declension: Nominativ masculine after 'der' uses -e",
  hint: "(nominative, masculine, weak)",
  tags: ["nominativ", "masculine", "adjective-weak"]
},
{
  front: "Ich sehe den ___ Hund (klein)",
  back: "kleinen",
  explanation: "Weak declension: Akkusativ masculine after 'den' uses -en",
  hint: "(accusative, masculine, weak)",
  tags: ["akkusativ", "masculine", "adjective-weak"]
}

// Strong Declension (no article)
{
  front: "___ Wasser ist kalt (frisch)",
  back: "Frisches",
  explanation: "Strong declension: Nominativ neuter without article uses -es",
  hint: "(nominative, neuter, strong)",
  tags: ["nominativ", "neuter", "adjective-strong"]
}

// Mixed Declension (after indefinite article)
{
  front: "Ein ___ Auto steht dort (rot)",
  back: "rotes",
  explanation: "Mixed declension: Nominativ neuter after 'ein' uses -es",
  hint: "(nominative, neuter, mixed)",
  tags: ["nominativ", "neuter", "adjective-mixed"]
}
```

### Difficulty Distribution

- **Easy (20 cards):** Common cases (Nom, Akk), masculine/feminine
- **Medium (20 cards):** Dative, adjectives after definite articles
- **Hard (10 cards):** Genitive, strong/mixed adjectives, neuter forms

---

## UI Design

### Study Mode Layout

```
┌─────────────────────────────────────────┐
│  German Declension Flashcards           │
│  [Study] [Browse] [Stats]               │ ← Navigation tabs
├─────────────────────────────────────────┤
│                                         │
│  Studying: All Cards                    │
│  Progress: 5/12 cards today            │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │  Ich sehe ___ großen Hund         │ │
│  │                                   │ │
│  │  (accusative, masculine, weak)    │ │ ← Hint
│  │                                   │ │
│  │                                   │ │
│  │  [Show Answer]                    │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Card 5 of 12                          │
└─────────────────────────────────────────┘

(After revealing answer)

┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │  den großen                       │ │ ← Answer
│  │                                   │ │
│  │  Akkusativ, masculine             │ │
│  │  Weak declension after 'den'      │ │ ← Explanation
│  │  uses -en ending                  │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  How did you do?                       │
│  [Again]          [Good]               │
│                                         │
│  Card 5 of 12                          │
└─────────────────────────────────────────┘
```

### Browse Mode Layout

```
┌─────────────────────────────────────────┐
│  Browse All Cards                       │
│                                         │
│  Filter: [All] [Nom] [Akk] [Dat] [Gen] │
│         [M] [F] [N] [Pl]               │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ Ich sehe ___ Mann → den            │ │
│  │ Next review: Tomorrow               │ │
│  │ Correct: 3  Incorrect: 1  Box: 2   │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ Der ___ Mann → große               │ │
│  │ Next review: In 3 days              │ │
│  │ Correct: 5  Incorrect: 0  Box: 3   │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ... (list continues)                   │
└─────────────────────────────────────────┘
```

### Stats Dashboard Layout

```
┌─────────────────────────────────────────┐
│  Statistics                             │
│                                         │
│  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Cards Studied   │  │ Due Today       │ │
│  │      23         │  │      8          │ │
│  └─────────────────┘  └─────────────────┘ │
│                                         │
│  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Total Cards     │  │ Accuracy        │ │
│  │      50         │  │     78%         │ │
│  └─────────────────┘  └─────────────────┘ │
│                                         │
│  Progress by Case:                      │
│  Nominativ:   ████████░░ 80%            │
│  Akkusativ:   ██████░░░░ 60%            │
│  Dativ:       ████░░░░░░ 40%            │
│  Genitiv:     ██░░░░░░░░ 20%            │
│                                         │
│  [Reset All Progress]                  │
└─────────────────────────────────────────┘
```

---

## Features

### 1. Study Mode

**Core Flow:**
1. Show cards due for review (nextReview ≤ now)
2. If no cards due, show "All caught up!" message
3. Display front of card
4. User clicks "Show Answer"
5. Flip card (CSS animation)
6. Show answer + explanation
7. User clicks "Again" or "Good"
8. Update card data (box, nextReview, counts)
9. Save to localStorage
10. Show next card

**Button Logic:**
- **Again:** Move card to box 1, nextReview = now
- **Good:** Move card to next box (max 5), nextReview = now + interval

### 2. Browse Mode

**Features:**
- List all cards with summary info
- Filter by tag (case, gender, declension type)
- Show next review date
- Show success stats (correct/incorrect counts)
- Click card to study it immediately

**Filter Implementation:**
```javascript
function filterCards(tag) {
  // Show only cards with matching tag
  // "All" shows everything
}
```

### 3. Stats Dashboard

**Metrics to Display:**
- Cards studied today
- Cards due today
- Total cards
- Overall accuracy (correctCount / (correctCount + incorrectCount))
- Accuracy by case (grouped stats)
- Progress bars for visual representation

**Optional:**
- Study streak (consecutive days)
- Total study time
- Cards mastered (box 5)

---

## localStorage Implementation

### Data Schema

```javascript
// Save structure
{
  flashcards: [/* array of flashcard objects */],
  stats: {
    studiedToday: 5,
    lastStudyDate: "2024-11-20",
    totalReviews: 127,
    studyStreak: 7
  }
}
```

### Save/Load Functions

```javascript
function saveToStorage() {
  try {
    localStorage.setItem('german-flashcards', JSON.stringify(flashcards));
    localStorage.setItem('german-stats', JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save:', e);
    // Show user-friendly error message
  }
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('german-flashcards');
    if (saved) {
      flashcards = JSON.parse(saved);
    } else {
      flashcards = generateDefaultCards(); // Initial 50 cards
    }
    
    const savedStats = localStorage.getItem('german-stats');
    stats = savedStats ? JSON.parse(savedStats) : defaultStats;
  } catch (e) {
    console.error('Failed to load:', e);
    flashcards = generateDefaultCards();
    stats = defaultStats;
  }
}

// Save after every answer
function answerCard(cardId, correct) {
  const card = flashcards.find(c => c.id === cardId);
  
  if (correct) {
    card.correctCount++;
    card.box = Math.min(card.box + 1, 5); // Promote, max box 5
  } else {
    card.incorrectCount++;
    card.box = 1; // Demote to box 1
  }
  
  card.lastReviewed = Date.now();
  card.nextReview = Date.now() + (boxIntervals[card.box] * 86400000); // Convert days to ms
  
  stats.totalReviews++;
  saveToStorage();
}
```

---

## Responsive Design

### Desktop (>768px)
- Card width: 600px, centered
- Two-column stats layout
- Browse mode: List with padding

### Tablet (768px - 480px)
- Card width: 90% of screen
- Stats stack to single column
- Filters scroll horizontally if needed

### Mobile (<480px)
- Card: Full width, padding reduced
- Buttons stack vertically
- Navigation tabs full-width
- Touch-friendly tap targets (44px min)

---

## CSS Animations

### Card Flip

```css
.card {
  transition: transform 0.3s ease;
}

.card.flipped {
  transform: rotateY(180deg);
}

/* Alternative: Fade transition */
.card-front, .card-back {
  transition: opacity 0.3s ease;
}

.card.showing-answer .card-front {
  opacity: 0;
}

.card.showing-answer .card-back {
  opacity: 1;
}
```

### Button Feedback

```css
.answer-button {
  transition: all 0.2s ease;
}

.answer-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.answer-button:active {
  transform: scale(0.95);
}
```

---

## Technical Requirements

### HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>German Declension Flashcards</title>
  <style>
    /* All CSS inline here */
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>German Declension Flashcards</h1>
      <nav class="tab-nav">
        <button class="tab active" data-tab="study">Study</button>
        <button class="tab" data-tab="browse">Browse</button>
        <button class="tab" data-tab="stats">Stats</button>
      </nav>
    </header>
    
    <div id="study-view" class="view active">
      <!-- Study mode UI -->
    </div>
    
    <div id="browse-view" class="view hidden">
      <!-- Browse mode UI -->
    </div>
    
    <div id="stats-view" class="view hidden">
      <!-- Stats dashboard UI -->
    </div>
  </div>
  
  <script>
    /* All JavaScript inline here */
  </script>
</body>
</html>
```

### JavaScript Architecture

```javascript
// State management
let flashcards = [];
let stats = {};
let currentCardIndex = 0;
let dueCards = [];

// Initialization
function init() {
  loadFromStorage();
  updateDueCards();
  renderStudyView();
  attachEventListeners();
}

// Core functions
function updateDueCards() {
  // Filter cards where nextReview <= now
}

function showNextCard() {
  // Display next card in dueCards
}

function revealAnswer() {
  // Flip card, show answer + explanation
}

function answerCard(correct) {
  // Update card data
  // Save to storage
  // Show next card
}

function renderBrowseView() {
  // Generate card list HTML
}

function renderStatsView() {
  // Calculate and display stats
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
```

---

## Default Card Set

Generate exactly 50 cards covering:

**Definite Articles (12 cards):**
- Nominativ: M, F, N, Pl (4 cards)
- Akkusativ: M, F, N, Pl (4 cards)
- Dativ: M, F, N (3 cards)
- Genitiv: M (1 card)

**Indefinite Articles (8 cards):**
- Nominativ: M, F, N (3 cards)
- Akkusativ: M, F, N (3 cards)
- Dativ: M, N (2 cards)

**Adjective - Weak (12 cards):**
- All cases, focus on masculine and feminine

**Adjective - Strong (10 cards):**
- Nominativ and Akkusativ focus

**Adjective - Mixed (8 cards):**
- Nominativ focus, various genders

---

## Testing Checklist

Before considering Agent 2 complete, verify:

- [ ] All 50 cards load correctly
- [ ] Study mode shows due cards
- [ ] "Show Answer" reveals answer
- [ ] "Again" button demotes card to box 1
- [ ] "Good" button promotes card
- [ ] Progress saves to localStorage
- [ ] Progress persists after page reload
- [ ] Browse mode lists all cards
- [ ] Filters work correctly
- [ ] Stats calculate accurately
- [ ] Mobile responsive (320px width)
- [ ] No JavaScript console errors
- [ ] Keyboard navigation works (Tab, Enter, Space)

---

## Optional Enhancements

If time permits (not required for MVP):

1. **Swipe Gestures (Mobile):**
   - Swipe left = "Again"
   - Swipe right = "Good"

2. **Keyboard Shortcuts:**
   - Space = Show Answer
   - 1 = Again
   - 2 = Good

3. **Sound Effects:**
   - Correct answer: Pleasant tone
   - Incorrect answer: Subtle tone

4. **Card Customization:**
   - User can add custom cards
   - Edit existing cards

---

## Output

### File to Create
- `flashcards.html` - Complete, working flashcard module

### File Location
- Save to: `../app/flashcards.html`

### Testing URL
- Open `app/flashcards.html` in browser
- Or serve and visit `http://localhost:8000/flashcards.html`

---

## Success Criteria

✅ **Agent 2 is complete when:**
1. All 50 cards display correctly
2. Study session flows smoothly (show card → reveal → answer → next)
3. Leitner box system schedules correctly
4. localStorage persists all data
5. Browse mode allows filtering
6. Stats display accurate metrics
7. Mobile responsive
8. No console errors
9. Loads quickly (<1 second)

---

## Notes for Claude Code

- Focus on the core study loop first
- Test localStorage early (it's critical)
- Generate meaningful, correct example sentences
- Use clear, beginner-friendly explanations
- Keep the UI simple and uncluttered
- Comment complex scheduling logic
- Test card generation thoroughly

---

**Ready to build? Create a complete, working `flashcards.html` file according to this specification!**

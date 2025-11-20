# AGENT 1: TABLE MODULE

## Mission
Build an interactive German declension table component for A2 learners.

## Deliverable
A single HTML page with embedded CSS/JS that displays color-coded declension tables.

---

## Data Structure

```javascript
const tables = {
  definiteArticle: {
    name: "Definite Article (der/die/das)",
    grid: [
      // [case, masculine, feminine, neuter, plural]
      ['Nom', 'der', 'die', 'das', 'die'],
      ['Akk', 'den', 'die', 'das', 'die'],
      ['Dat', 'dem', 'der', 'dem', 'den'],
      ['Gen', 'des', 'der', 'des', 'der']
    ]
  },
  indefiniteArticle: {
    name: "Indefinite Article (ein/eine)",
    grid: [
      ['Nom', 'ein', 'eine', 'ein', '—'],
      ['Akk', 'einen', 'eine', 'ein', '—'],
      ['Dat', 'einem', 'einer', 'einem', '—'],
      ['Gen', 'eines', 'einer', 'eines', '—']
    ]
  },
  adjectiveWeak: {
    name: "Adjective - Weak Declension (after der/die/das)",
    grid: [
      ['Nom', '-e', '-e', '-e', '-en'],
      ['Akk', '-en', '-e', '-e', '-en'],
      ['Dat', '-en', '-en', '-en', '-en'],
      ['Gen', '-en', '-en', '-en', '-en']
    ]
  },
  adjectiveStrong: {
    name: "Adjective - Strong Declension (no article)",
    grid: [
      ['Nom', '-er', '-e', '-es', '-e'],
      ['Akk', '-en', '-e', '-es', '-e'],
      ['Dat', '-em', '-er', '-em', '-en'],
      ['Gen', '-en', '-er', '-en', '-er']
    ]
  },
  adjectiveMixed: {
    name: "Adjective - Mixed Declension (after ein/eine)",
    grid: [
      ['Nom', '-er', '-e', '-es', '-en'],
      ['Akk', '-en', '-e', '-es', '-en'],
      ['Dat', '-en', '-en', '-en', '-en'],
      ['Gen', '-en', '-en', '-en', '-en']
    ]
  }
};

const examples = {
  'der-Nom-M': ['der Mann (the man)', 'der große Mann (the big man)'],
  'den-Akk-M': ['Ich sehe den Mann (I see the man)', 'Ich sehe den großen Mann (I see the big man)'],
  'dem-Dat-M': ['Ich gebe dem Mann das Buch (I give the man the book)', 'Ich helfe dem alten Mann (I help the old man)'],
  'des-Gen-M': ['das Auto des Mannes (the man\'s car)', 'die Tasche des großen Mannes (the big man\'s bag)'],
  
  'die-Nom-F': ['die Frau (the woman)', 'die schöne Frau (the beautiful woman)'],
  'die-Akk-F': ['Ich sehe die Frau (I see the woman)', 'Ich kenne die nette Frau (I know the nice woman)'],
  'der-Dat-F': ['Ich gebe der Frau Blumen (I give the woman flowers)', 'Ich helfe der alten Frau (I help the old woman)'],
  'der-Gen-F': ['das Haus der Frau (the woman\'s house)', 'die Tasche der jungen Frau (the young woman\'s bag)'],
  
  'das-Nom-N': ['das Kind (the child)', 'das kleine Kind (the small child)'],
  'das-Akk-N': ['Ich sehe das Kind (I see the child)', 'Ich höre das weinende Kind (I hear the crying child)'],
  'dem-Dat-N': ['Ich gebe dem Kind Spielzeug (I give the child toys)', 'Ich helfe dem kranken Kind (I help the sick child)'],
  'des-Gen-N': ['die Mutter des Kindes (the child\'s mother)', 'das Zimmer des kleinen Kindes (the small child\'s room)'],
  
  'die-Nom-Pl': ['die Leute (the people)', 'die netten Leute (the nice people)'],
  'die-Akk-Pl': ['Ich sehe die Leute (I see the people)', 'Ich mag die freundlichen Leute (I like the friendly people)'],
  'den-Dat-Pl': ['Ich gebe den Leuten Hilfe (I give the people help)', 'Ich danke den hilfsbereiten Leuten (I thank the helpful people)'],
  'der-Gen-Pl': ['die Autos der Leute (the people\'s cars)', 'die Häuser der reichen Leute (the rich people\'s houses)']
  // Add 2-3 examples per cell
};
```

---

## Color Scheme

```css
/* Case colors */
.nom { 
  background-color: #E3F2FD; 
  border-left: 4px solid #2196F3; 
} /* blue */

.akk { 
  background-color: #FFEBEE; 
  border-left: 4px solid #F44336; 
} /* red */

.dat { 
  background-color: #E8F5E9; 
  border-left: 4px solid #4CAF50; 
} /* green */

.gen { 
  background-color: #FFF3E0; 
  border-left: 4px solid #FF9800; 
} /* orange */

/* Hover state */
.cell:hover { 
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}
```

---

## Features

### 1. Table Display
- Radio buttons or tabs to switch between tables
- 4×4 grid with headers (Case | M | F | N | Pl)
- Each cell color-coded by case
- Clean, readable typography (16-18px)

### 2. Interaction
- Click cell → show modal with examples
- Modal shows: full form + 2-3 example sentences
- ESC or click outside to close modal
- Smooth modal animations

### 3. Pattern Highlighting (OPTIONAL for MVP)
- Click case label → highlight all cells of that case
- Click again to unhighlight
- Visual feedback (border glow or opacity change)

---

## UI Layout

```
┌─────────────────────────────────────────────┐
│  German Declension Tables                   │
├─────────────────────────────────────────────┤
│  ○ Definite  ○ Indefinite  ○ Adj-Weak      │
│  ○ Adj-Strong  ○ Adj-Mixed                  │
├─────────────────────────────────────────────┤
│   Case │   M    │   F    │   N    │   Pl   │
│  ──────┼────────┼────────┼────────┼─────── │
│   Nom  │  der   │  die   │  das   │  die   │ ← blue
│   Akk  │  den   │  die   │  das   │  die   │ ← red
│   Dat  │  dem   │  der   │  dem   │  den   │ ← green
│   Gen  │  des   │  der   │  des   │  der   │ ← orange
└─────────────────────────────────────────────┘
```

### Modal Example
```
┌─────────────────────────────────────┐
│  den (Akkusativ, Masculine)    [×]  │
├─────────────────────────────────────┤
│                                     │
│  Examples:                          │
│  • Ich sehe den Mann                │
│    (I see the man)                  │
│                                     │
│  • Ich sehe den großen Mann         │
│    (I see the big man)              │
│                                     │
│  [Close]                            │
└─────────────────────────────────────┘
```

---

## Technical Constraints

- Single HTML file (inline CSS/JS acceptable)
- No external dependencies except optional Tailwind CDN
- Mobile responsive (stack on small screens <640px)
- Works offline after initial load
- Total file size <50KB
- Accessible (keyboard navigation, ARIA labels)

---

## Output Files

```
table-module/
  index.html          (complete working page)
  README.md           (usage instructions)
```

---

## Testing Checklist

- [ ] All 5 tables display correctly
- [ ] Clicking cells shows examples
- [ ] Modal closes on ESC and outside click
- [ ] Colors are distinct and accessible (WCAG AA)
- [ ] Works on mobile (320px width minimum)
- [ ] No console errors
- [ ] Table switching works smoothly
- [ ] Examples load correctly for each cell
- [ ] Keyboard navigation works (Tab, Enter, ESC)
- [ ] Text is readable at all screen sizes

---

## Development Tips

1. **Start with structure**: Build static table first
2. **Add interactivity**: Modal, click handlers
3. **Populate data**: Add all examples
4. **Polish**: Animations, responsive design
5. **Test**: On multiple browsers and devices

---

## Acceptance Criteria

✅ User can switch between 5 different declension tables
✅ Each cell displays the correct form with appropriate color
✅ Clicking any cell shows relevant examples
✅ Page is responsive and works on mobile
✅ Code is clean, commented, and maintainable
✅ File size is under 50KB
✅ No accessibility errors

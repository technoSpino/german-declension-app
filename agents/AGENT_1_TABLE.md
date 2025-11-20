# AGENT 1: TABLE MODULE

## Mission
Build an interactive German declension table component for A2 learners with color-coded cells and example popups.

---

## Deliverable
A single, self-contained HTML file (`table.html`) with embedded CSS and JavaScript that displays color-coded declension tables.

---

## Data Structure

### Tables Data

```javascript
const tables = {
  definiteArticle: {
    name: "Definite Article (der/die/das)",
    description: "Use with specific, known nouns",
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
    description: "Use with non-specific nouns",
    grid: [
      ['Nom', 'ein', 'eine', 'ein', '—'],
      ['Akk', 'einen', 'eine', 'ein', '—'],
      ['Dat', 'einem', 'einer', 'einem', '—'],
      ['Gen', 'eines', 'einer', 'eines', '—']
    ]
  },
  
  adjectiveWeak: {
    name: "Adjective - Weak Declension",
    description: "After definite articles (der/die/das)",
    grid: [
      ['Nom', '-e', '-e', '-e', '-en'],
      ['Akk', '-en', '-e', '-e', '-en'],
      ['Dat', '-en', '-en', '-en', '-en'],
      ['Gen', '-en', '-en', '-en', '-en']
    ]
  },
  
  adjectiveStrong: {
    name: "Adjective - Strong Declension",
    description: "Without any article",
    grid: [
      ['Nom', '-er', '-e', '-es', '-e'],
      ['Akk', '-en', '-e', '-es', '-e'],
      ['Dat', '-em', '-er', '-em', '-en'],
      ['Gen', '-en', '-er', '-en', '-er']
    ]
  },
  
  adjectiveMixed: {
    name: "Adjective - Mixed Declension",
    description: "After indefinite articles (ein/eine/kein/mein)",
    grid: [
      ['Nom', '-er', '-e', '-es', '-en'],
      ['Akk', '-en', '-e', '-es', '-en'],
      ['Dat', '-en', '-en', '-en', '-en'],
      ['Gen', '-en', '-en', '-en', '-en']
    ]
  }
};
```

### Examples Data

Include 2-3 example sentences for each declension form:

```javascript
const examples = {
  // Definite Articles
  'der-Nom-M': [
    'Der Mann ist groß. (The man is tall)',
    'Der große Mann geht. (The big man walks)'
  ],
  'den-Akk-M': [
    'Ich sehe den Mann. (I see the man)',
    'Ich sehe den großen Mann. (I see the big man)'
  ],
  'dem-Dat-M': [
    'Ich gebe dem Mann das Buch. (I give the man the book)',
    'Ich helfe dem alten Mann. (I help the old man)'
  ],
  'des-Gen-M': [
    'Das Auto des Mannes ist rot. (The man\'s car is red)',
    'Das Haus des reichen Mannes. (The rich man\'s house)'
  ],
  
  // Add examples for all forms
  // Feminine examples (die/die/der/der)
  'die-Nom-F': [
    'Die Frau ist nett. (The woman is nice)',
    'Die junge Frau kommt. (The young woman comes)'
  ],
  // ... continue for all cases/genders
  
  // Neuter examples (das/das/dem/des)
  'das-Nom-N': [
    'Das Kind spielt. (The child plays)',
    'Das kleine Kind lacht. (The small child laughs)'
  ],
  // ... continue
  
  // Plural examples (die/die/den/der)
  'die-Nom-Pl': [
    'Die Kinder spielen. (The children play)',
    'Die kleinen Kinder singen. (The small children sing)'
  ],
  // ... continue
  
  // Generate similar examples for indefinite articles and adjectives
};
```

---

## Color Scheme

### Case Colors (Primary)

```css
/* Nominativ - Light Blue */
.nom-cell {
  background-color: #E3F2FD;
  border-left: 4px solid #2196F3;
}

/* Akkusativ - Light Red */
.akk-cell {
  background-color: #FFEBEE;
  border-left: 4px solid #F44336;
}

/* Dativ - Light Green */
.dat-cell {
  background-color: #E8F5E9;
  border-left: 4px solid #4CAF50;
}

/* Genitiv - Light Orange */
.gen-cell {
  background-color: #FFF3E0;
  border-left: 4px solid #FF9800;
}

/* Case labels */
.case-label {
  font-weight: 700;
  padding: 8px;
}

.case-label.nom { color: #2196F3; }
.case-label.akk { color: #F44336; }
.case-label.dat { color: #4CAF50; }
.case-label.gen { color: #FF9800; }
```

### Interaction States

```css
.table-cell {
  padding: 12px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
}

.table-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  z-index: 10;
}

.table-cell:active {
  transform: scale(0.98);
}
```

---

## Features

### 1. Table Display

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  German Declension Tables                          │
├────────────────────────────────────────────────────┤
│  Table Selection:                                  │
│  ○ Definite Article (der/die/das)                 │
│  ○ Indefinite Article (ein/eine)                  │
│  ○ Adjective - Weak Declension                    │
│  ○ Adjective - Strong Declension                  │
│  ○ Adjective - Mixed Declension                   │
├────────────────────────────────────────────────────┤
│  Definite Article (der/die/das)                   │
│  Use with specific, known nouns                   │
│                                                    │
│  ┌─────┬─────────┬─────────┬─────────┬─────────┐ │
│  │Case │   M     │    F    │    N    │   Pl    │ │
│  ├─────┼─────────┼─────────┼─────────┼─────────┤ │
│  │ Nom │  der    │   die   │   das   │   die   │ │ (blue)
│  │ Akk │  den    │   die   │   das   │   die   │ │ (red)
│  │ Dat │  dem    │   der   │   dem   │   den   │ │ (green)
│  │ Gen │  des    │   der   │   des   │   der   │ │ (orange)
│  └─────┴─────────┴─────────┴─────────┴─────────┘ │
└────────────────────────────────────────────────────┘
```

**Radio Button Implementation:**
- Use HTML radio inputs (styled)
- Default: Definite Article selected
- Switching tables shows/hides corresponding table
- Smooth transition (fade effect)

### 2. Cell Interaction

**Click Behavior:**
1. User clicks any cell (e.g., "den" in Akkusativ-Masculine)
2. Modal/popup appears with:
   - Large display of the form ("den")
   - Case, gender, and context info
   - 2-3 example sentences
   - Close button (X) or click outside to dismiss

**Modal Design:**
```
┌─────────────────────────────────────────┐
│  den                              [X]   │
│  Akkusativ, Masculine                   │
├─────────────────────────────────────────┤
│  Examples:                              │
│                                         │
│  • Ich sehe den Mann.                   │
│    (I see the man)                      │
│                                         │
│  • Ich sehe den großen Mann.            │
│    (I see the big man)                  │
│                                         │
│  [Close]                                │
└─────────────────────────────────────────┘
```

### 3. Responsive Design

**Desktop (>768px):**
- Table at comfortable width (700px max)
- Centered on page
- Radio buttons horizontal

**Tablet (768px - 480px):**
- Table fills width
- Radio buttons may stack

**Mobile (<480px):**
- Radio buttons vertical
- Table scrollable horizontally if needed
- Larger tap targets (min 44px)
- Modal full-width

---

## Technical Requirements

### HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>German Declension Tables</title>
  <style>
    /* All CSS inline here */
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>German Declension Tables</h1>
      <p class="subtitle">Color-coded reference for A2 learners</p>
    </header>
    
    <div class="table-selector">
      <!-- Radio buttons for table selection -->
    </div>
    
    <div class="tables-container">
      <!-- All 5 tables here, show/hide based on selection -->
    </div>
    
    <div id="modal" class="modal hidden">
      <!-- Modal for examples -->
    </div>
  </div>
  
  <script>
    /* All JavaScript inline here */
  </script>
</body>
</html>
```

### JavaScript Functionality

```javascript
// Core functions needed:

function showTable(tableId) {
  // Hide all tables
  // Show selected table
  // Update radio button state
}

function showExamples(form, caseType, gender) {
  // Look up examples from data
  // Populate modal
  // Show modal
}

function closeModal() {
  // Hide modal
}

// Event listeners:
// - Radio button changes → showTable()
// - Cell clicks → showExamples()
// - Modal close button → closeModal()
// - Escape key → closeModal()
// - Click outside modal → closeModal()
```

### Constraints

- **Single file:** All HTML, CSS, JS in one file
- **No external dependencies:** No jQuery, no frameworks
- **File size:** Target <50KB total
- **Browser support:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **No build step:** Should work by opening HTML directly

---

## Accessibility

- Proper semantic HTML (`<table>`, `<th>`, `<td>`)
- ARIA labels for radio buttons
- Keyboard navigation:
  - Tab through radio buttons and cells
  - Enter/Space to activate
  - Escape to close modal
- Focus indicators visible
- Sufficient color contrast (WCAG AA)
- Alt text for any icons

---

## Example Generation Guidelines

For each cell, create examples that:
1. Use common, A2-level vocabulary
2. Show the form in natural context
3. Include both simple and compound examples
4. Provide English translations
5. Are grammatically correct

**Good examples:**
- "Der Mann läuft. (The man runs)" - Simple, clear
- "Der große Mann läuft schnell. (The big man runs fast)" - With adjective

**Avoid:**
- Technical jargon
- C1-level vocabulary
- Overly complex sentences

---

## Testing Checklist

Before considering Agent 1 complete, verify:

- [ ] All 5 tables display correctly
- [ ] Radio button switching works smoothly
- [ ] Every cell is clickable
- [ ] Modal shows correct examples for each cell
- [ ] Modal can be closed (X button, outside click, ESC)
- [ ] Colors are visually distinct
- [ ] Works on mobile (test at 320px width)
- [ ] No JavaScript console errors
- [ ] Keyboard navigation works
- [ ] Page loads in <1 second

---

## Optional Enhancements

If time permits (not required for MVP):

1. **Pattern Highlighting:**
   - Click case label → highlight all cells of that case
   - Click again to unhighlight

2. **Search:**
   - Search box to find examples containing a word
   - Highlights relevant cells

3. **Print Stylesheet:**
   - CSS for printing the tables cleanly

4. **Dark Mode:**
   - Toggle for dark theme
   - Adjusted colors for readability

---

## Output

### File to Create
- `table.html` - Complete, working table module

### File Location
- Save to: `../app/table.html` (relative to agents/ folder)

### Testing URL
- Open `app/table.html` in browser
- Or serve with: `python3 -m http.server 8000` and visit `http://localhost:8000/table.html`

---

## Success Criteria

✅ **Agent 1 is complete when:**
1. Table displays all 5 declension types correctly
2. Color coding is clear and consistent
3. Every cell opens modal with examples
4. Modal interaction is smooth and intuitive
5. Mobile responsive (works at 320px width)
6. No console errors
7. Loads in <1 second
8. Code is clean and well-commented

---

## Notes for Claude Code

- Focus on clean, readable code
- Use descriptive variable names
- Add comments for complex logic
- Prioritize functionality over fancy animations
- Test each feature as you build
- Keep it simple - this is an MVP

---

**Ready to build? Create a complete, working `table.html` file according to this specification!**

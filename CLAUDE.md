# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a German declension learning app MVP built as a **static site** using vanilla HTML/CSS/JavaScript. The project uses a three-agent architecture where each agent builds a self-contained module that can be developed independently.

**Core Value Proposition:** Color-coded declension tables + basic flashcards to help A2 German learners master declension patterns.

## Architecture

### Three-Agent System

The codebase is designed around three independent modules that integrate into a final app:

1. **Agent 1 - Table Module** (`app/table.html`)
   - Interactive declension tables with color-coded cells (blue=Nominativ, red=Akkusativ, green=Dativ, orange=Genitiv)
   - Covers 5 table types: definite articles, indefinite articles, weak/strong/mixed adjective declensions
   - Clicking cells shows modal with example sentences
   - Self-contained HTML file with embedded CSS and JavaScript

2. **Agent 2 - Flashcard Module** (`app/flashcards.html`)
   - Leitner box spaced repetition system (5 boxes with intervals: 0, 1, 3, 7, 14 days)
   - Minimum 50 flashcards covering articles and adjective declensions
   - LocalStorage persistence for progress tracking
   - Self-contained HTML file with embedded CSS and JavaScript

3. **Agent 3 - Integration** (`app/index.html`)
   - Landing page with navigation between modules
   - Shared styles and cross-module progress tracking
   - Final deployment configuration

### Key Design Principles

- **Self-contained modules:** Each HTML file includes all CSS and JavaScript inline (no external dependencies)
- **No build step:** Files should work by opening directly in a browser
- **LocalStorage for state:** All user data persists client-side (no backend)
- **Mobile-first responsive:** Must work at 320px width minimum
- **Target bundle size:** <100KB gzipped for entire app

## Development Commands

### Local Development

```bash
# Start development server (Python)
npm run dev
# Or: python -m http.server 8000 --directory app

# Start development server (Node.js)
npm run dev:node
# Or: npx http-server app -p 8000 -o

# Then visit http://localhost:8000
```

### Testing

```bash
# Validate HTML
npm run validate

# Run Lighthouse audit
npm run lighthouse
```

### Deployment

```bash
# Deploy to Netlify (recommended)
npm run deploy:netlify

# Deploy to GitHub Pages
npm run deploy:gh-pages
```

### Minification (optional)

```bash
npm run minify:html
npm run minify:css
npm run minify:js
```

## Code Structure

```
app/
├── index.html          # Landing page (Agent 3)
├── table.html          # Declension tables (Agent 1)
├── flashcards.html     # Flashcard system (Agent 2)
├── styles.css          # Shared styles (Agent 3)
└── data/               # Any shared data files
```

## Working with Agents

### When Working on Agent 1 (Tables)

- Read specification in `agents/AGENT_1_TABLE.md`
- Output must be a single `app/table.html` file
- Use the exact color scheme: Nominativ=#E3F2FD/border #2196F3, Akkusativ=#FFEBEE/#F44336, Dativ=#E8F5E9/#4CAF50, Genitiv=#FFF3E0/#FF9800
- Include examples for all cells (der/die/das/die × 4 cases × 5 table types)
- Modal should close on ESC key, X button, or outside click

### When Working on Agent 2 (Flashcards)

- Read specification in `agents/AGENT_2_FLASHCARD.md`
- Output must be a single `app/flashcards.html` file
- Implement Leitner box intervals exactly: box 1=0 days, box 2=1 day, box 3=3 days, box 4=7 days, box 5=14 days
- Correct answer moves card to next box (max 5), incorrect moves to box 1
- Persist state to localStorage using keys: `flashcards`, `progress`
- Generate minimum 50 cards covering definite/indefinite articles and adjective declensions

### When Working on Agent 3 (Integration)

- Read specification in `agents/AGENT_3_INTEGRATION.md` (if exists) or `EXECUTION_PLAN.md`
- Create landing page with clear navigation to table.html and flashcards.html
- Extract shared styles into styles.css
- Ensure progress tracking works across modules
- Configure deployment (netlify.toml or GitHub Actions)

## Testing Checklist

Before considering any agent complete:

- [ ] No JavaScript console errors
- [ ] Works on mobile (test at 320px width)
- [ ] LocalStorage persists correctly (for flashcard module)
- [ ] All interactive elements have hover/focus states
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Validate HTML at https://validator.w3.org/
- [ ] Lighthouse accessibility score >90
- [ ] Page loads in <2 seconds on throttled connection
- [ ] Works in Chrome, Firefox, Safari

## Important Constraints

- **No frameworks:** Pure vanilla JavaScript only (no React, Vue, jQuery)
- **No external CDNs:** All code must be inline (except optional analytics)
- **Single file per module:** Each agent outputs one complete HTML file
- **Browser support:** Modern browsers only (Chrome, Firefox, Safari, Edge - latest versions)
- **File size:** Each module should be <50KB, total app <100KB gzipped

## Color Scheme Reference

Cases use consistent color coding across all modules:

- **Nominativ:** Background #E3F2FD, Border/Text #2196F3 (light blue)
- **Akkusativ:** Background #FFEBEE, Border/Text #F44336 (light red)
- **Dativ:** Background #E8F5E9, Border/Text #4CAF50 (light green)
- **Genitiv:** Background #FFF3E0, Border/Text #FF9800 (light orange)

Ensure WCAG AA contrast ratios (4.5:1 minimum).

## LocalStorage Schema

```javascript
// Flashcard data
localStorage.setItem('flashcards', JSON.stringify([{
  id: 1,
  front: "Ich sehe ___ Mann",
  back: "den",
  explanation: "Akkusativ, masculine",
  hint: "(accusative, masculine)",
  tags: ["akkusativ", "masculine", "article"],
  box: 1,              // 1-5
  nextReview: null,    // timestamp or null
  correctCount: 0,
  incorrectCount: 0,
  lastReviewed: null,
  created: 1234567890
}]));

// Progress tracking
localStorage.setItem('progress', JSON.stringify({
  cardsStudied: 10,
  cardsCorrect: 8,
  currentStreak: 3,
  lastStudy: 1234567890
}));
```

## Common Pitfalls to Avoid

1. **Don't create separate CSS/JS files** - Each agent module must be self-contained
2. **Don't use relative paths for cross-module links** - Use `./table.html` not `/table.html`
3. **Don't forget mobile testing** - 320px is the minimum supported width
4. **Don't skip localStorage error handling** - Private browsing mode disables it
5. **Don't add build complexity** - No webpack, no bundlers, keep it simple
6. **Don't over-engineer** - This is an MVP; resist adding features beyond the spec

## Deployment Notes

- **Recommended platform:** Netlify (easier than GitHub Pages)
- **Publish directory:** `app/`
- **Build command:** None (static site)
- **Environment variables:** None needed
- SSL is automatic on both Netlify and GitHub Pages

See `DEPLOY.md` for detailed deployment instructions.

## Git Workflow

When implementing agents sequentially:

```bash
# After Agent 1 complete
git add app/table.html
git commit -m "feat: Add table module (Agent 1)"

# After Agent 2 complete
git add app/flashcards.html
git commit -m "feat: Add flashcard module (Agent 2)"

# After Agent 3 complete
git add app/index.html app/styles.css
git commit -m "feat: Add integration and landing page (Agent 3)"

# Tag MVP release
git tag -a v1.0.0-mvp -m "MVP Release"
```

## Code Style

Follow the standards in `CONTRIBUTING.md`:

- Use `const` and `let` (never `var`)
- Meaningful variable names (`scheduleNextReview` not `snr`)
- Comment complex logic
- Semantic HTML (`<section>`, `<nav>`, `<article>`)
- CSS variables for colors and spacing
- Handle errors gracefully (especially localStorage failures)

## Success Criteria

The MVP is complete when:

- ✅ All 5 declension tables display correctly with color coding
- ✅ 50+ flashcards work with Leitner system
- ✅ Progress saves to localStorage
- ✅ Deployed to Netlify or GitHub Pages
- ✅ Mobile responsive (320px+)
- ✅ No console errors
- ✅ Lighthouse score >80 overall, >90 accessibility
- ✅ Loads in <2 seconds on throttled 3G

## Resources

- Agent specifications: `agents/AGENT_1_TABLE.md`, `agents/AGENT_2_FLASHCARD.md`
- Execution plan: `EXECUTION_PLAN.md`
- Deployment guide: `DEPLOY.md`
- Contributing guidelines: `CONTRIBUTING.md`

# German Declension Learning App - Integration Guide

## Overview
This document describes the landing page and integration layer built by Agent 3, connecting the Tables and Flashcards modules into a cohesive learning experience.

## Architecture

### Routing System
**File:** `src/router/index.js`

Three main routes:
- `/` - Home page with hero section and progress dashboard
- `/tables` - Declension tables (built by Agent 1)
- `/flashcards` - Smart flashcard system (built by Agent 2)

Features:
- Vue Router with HTML5 history mode
- Smooth scroll-to-top on navigation
- Dynamic document title updates
- Page transition animations

### Progress Store
**File:** `src/stores/progressStore.js`

Central store for tracking user progress across both modules:

**State:**
- `cardsStudied` - Total flashcards reviewed
- `cardsMastered` - Cards in Box 5 (mastery level)
- `tableInteractions` - Number of table cell clicks
- `currentStreak` - Consecutive days of study
- `studyHistory` - Array of daily study sessions (last 30 days)

**Computed Properties:**
- `totalInteractions` - Combined activity across modules
- `masteryPercentage` - Percentage of studied cards mastered
- `streakText` - Human-readable streak description

**Methods:**
- `incrementCardsStudied()` - Call when user reviews a flashcard
- `incrementCardsMastered()` - Call when card reaches Box 5
- `decrementCardsMastered()` - Call when card drops from Box 5
- `incrementTableInteractions()` - Call when user clicks table cell
- `recordStudySession()` - Automatically tracks daily activity and streak
- `resetProgress()` - Clear all progress data

**LocalStorage Persistence:**
All progress automatically saves to localStorage and loads on app init.

### Navigation Component
**File:** `src/components/AppNav.vue`

Sticky navigation header with:
- Logo and app title
- Desktop horizontal menu
- Mobile hamburger menu (< 768px)
- Active route highlighting (katyella violet)
- Smooth transitions

**Styling:**
- Primary: Katyella violet (#7c3aed / violet-600)
- Hover states with violet-50 background
- Active states with white text on violet background

### Home View
**File:** `src/views/HomeView.vue`

**Hero Section:**
- Gradient background (violet-600 → violet-700 → blue-600)
- Main tagline: "Master German Declensions"
- Value proposition description
- Two primary CTAs: "Study Tables" and "Practice Flashcards"

**Progress Widget:**
Shows live progress from progressStore:
- Cards Studied (violet gradient)
- Cards Mastered (blue gradient)
- Table Interactions (indigo gradient)
- Current Streak (purple gradient)
- Overall Mastery progress bar with percentage
- Adaptive: Shows "Start Your Journey" for new users

**Features Section:**
Highlights both modules with descriptions and quick navigation links.

### Tables View Placeholder
**File:** `src/views/TablesView.vue`

Placeholder for Agent 1's tables module with:
- Demo interactive table (2x4 grid)
- Click handlers connected to progressStore
- Alert demo for "Practice this case" feature
- Integration documentation callout

**Integration Hooks:**
```javascript
const handleCellClick = (gender, caseType) => {
  progressStore.incrementTableInteractions()
  // Future: Navigate to filtered flashcards
}
```

### Flashcards View
**File:** `src/views/FlashcardsView.vue`

Full flashcard implementation by Agent 2 with:
- Leitner box spaced repetition system
- Three modes: Study, Browse, Stats
- Progress tracking integrated with progressStore
- Keyboard shortcuts
- Mobile responsive design

**Integration Features:**
- Automatically calls `progressStore.incrementCardsStudied()` on card review
- Updates mastery counts in real-time
- Progress visible on home page dashboard

## Cross-Module Integration

### Table → Flashcards
**Feature:** Practice specific declensions

When user clicks a table cell (e.g., "Masculine Accusative"):
1. TablesView calls `progressStore.incrementTableInteractions()`
2. (Future) Navigate to `/flashcards?filter=masculine-accusative`
3. FlashcardsView applies filter to show only matching cards

**Implementation Status:** Hook ready, filtering to be completed by Agent 2

### Flashcards → Tables
**Feature:** View table explanation

When viewing flashcard explanation:
1. Link/button to "View in Declension Table"
2. Navigate to `/tables?highlight=masculine-accusative`
3. TablesView scrolls and highlights the relevant cell

**Implementation Status:** Hook ready, highlighting to be completed by Agent 1

## Color Scheme

Consistent Katyella violet theme throughout:

**Primary Colors:**
- Violet 600: `#7c3aed` - Primary actions, active states
- Blue 600: `#2563eb` - Secondary actions, accents

**Gradients:**
- Hero: `from-violet-600 via-violet-700 to-blue-600`
- Progress cards: Soft violet, blue, indigo, purple variants
- Mastery bar: `from-violet-600 to-blue-600`

**Neutrals:**
- Gray 50-900 for text and backgrounds
- White for cards and elevated surfaces

## Mobile Responsiveness

**Breakpoints:**
- Desktop: `≥768px` - Horizontal navigation, multi-column layouts
- Mobile: `<768px` - Hamburger menu, stacked layouts

**Mobile Optimizations:**
- Hamburger menu with smooth transitions
- Full-width CTAs on mobile
- Stacked progress cards
- Touch-friendly button sizes (min 44x44px)
- Responsive text sizing

## Testing Checklist

✅ Navigation between all three routes works
✅ Mobile hamburger menu opens/closes
✅ Active route highlighting in navigation
✅ Hero section displays correctly
✅ Progress widget shows/hides based on data
✅ CTAs navigate to correct routes
✅ Table cell clicks increment progress
✅ Progress persists across page reloads (localStorage)
✅ Page transitions are smooth
✅ Mobile responsive layout works correctly
✅ Color scheme consistent (katyella violet)

## Performance

**Load Time:** Fast initial load with Vite
- Code splitting by route
- Lazy-loaded view components
- Minimal dependencies

**Bundle Size:**
- Vue 3: ~40KB gzipped
- Vue Router: ~12KB gzipped
- Pinia: ~8KB gzipped
- Total base: ~60KB + app code

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## Next Steps for Other Agents

### Agent 1 (Tables Module)
- Build complete declension tables with color coding
- Implement cell click → flashcard filtering
- Add URL parameter support for highlighting cells
- Replace placeholder TablesView.vue

### Agent 2 (Flashcards Module)
- (Already completed! Full implementation live)
- Consider adding URL filter parameters
- Link to table explanations from cards

## File Structure

```
src/
├── App.vue                    # Main app wrapper with router-view
├── main.js                    # App initialization with Pinia & Router
├── style.css                  # Global Tailwind styles
│
├── router/
│   └── index.js              # Route definitions
│
├── stores/
│   ├── progressStore.js      # Cross-module progress tracking
│   └── flashcardStore.js     # Flashcard-specific state (Agent 2)
│
├── components/
│   ├── AppNav.vue            # Sticky navigation header
│   ├── FlashcardCard.vue     # Flashcard component (Agent 2)
│   └── ...
│
├── views/
│   ├── HomeView.vue          # Landing page with hero & progress
│   ├── TablesView.vue        # Declension tables (placeholder)
│   └── FlashcardsView.vue    # Flashcard practice (Agent 2)
│
└── data/
    ├── flashcards.js         # Flashcard data (Agent 2)
    └── ...
```

## Key Integration Points

1. **Progress Store** - Central source of truth for all progress
2. **Navigation** - Unified header across all pages
3. **Color Scheme** - Katyella violet (#7c3aed) throughout
4. **Mobile Design** - Responsive breakpoint at 768px
5. **LocalStorage** - Automatic persistence of all progress

## Browser Compatibility

- Chrome/Edge: ✅ (latest 2 versions)
- Firefox: ✅ (latest 2 versions)
- Safari: ✅ (latest 2 versions)
- Mobile Safari: ✅ (iOS 14+)
- Chrome Mobile: ✅ (latest)

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators on all interactive elements
- Color contrast meets WCAG AA standards

---

**Built by Agent 3** | Integration Layer Complete ✅

# AGENT 3: INTEGRATION & DEPLOYMENT

## Mission
Integrate the table and flashcard modules into a unified app and deploy to GitHub Pages or Netlify.

## Deliverable
A deployed static site with navigation between modules and basic progress tracking.

---

## App Structure

```
app/
├── index.html          (landing page with navigation)
├── table.html          (from Agent 1)
├── flashcards.html     (from Agent 2)
├── styles.css          (shared styles)
├── app.js              (navigation, shared state)
└── assets/
    └── data/
        ├── declensions.json  (centralized data)
        └── flashcards.json   (centralized cards)
```

---

## Landing Page

### Layout
```html
┌─────────────────────────────────────────────┐
│  🇩🇪 German Declension Learning              │
│                                             │
│  Master German declensions with             │
│  color-coded tables and spaced repetition   │
│                                             │
│  ┌───────────────┐  ┌──────────────────┐   │
│  │ 📊 View       │  │ 🎴 Study         │   │
│  │    Tables     │  │    Flashcards    │   │
│  │               │  │                  │   │
│  └───────────────┘  └──────────────────┘   │
│                                             │
│  Your Progress                              │
│  ────────────────────────────────────────   │
│  • 23/50 cards mastered (46%)              │
│  • Study streak: 5 days 🔥                 │
│  • Last studied: 2 hours ago               │
│  • Accuracy this week: 78%                 │
│                                             │
└─────────────────────────────────────────────┘
```

### Features
- Hero section with app description
- Two large buttons for main modules
- Progress summary (cards mastered, streak, accuracy)
- Quick stats dashboard
- Motivational messaging
- Responsive design (mobile-first)

---

## Shared Navigation

### Header Component
```html
<header>
  <nav>
    <div class="logo">🇩🇪 DeclensionLab</div>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="table.html">Tables</a></li>
      <li><a href="flashcards.html">Flashcards</a></li>
    </ul>
    <button class="mobile-menu-toggle">☰</button>
  </nav>
</header>
```

### Features
- Consistent across all pages
- Active page indicator (highlight current page)
- Responsive hamburger menu on mobile (<768px)
- Smooth transitions
- Accessible (keyboard navigation, ARIA labels)

---

## Shared Progress Tracking

### LocalStorage Schema
```javascript
const progress = {
  // Global stats
  cardsStudied: 23,
  cardsTotal: 50,
  cardsMastered: 23, // cards in box 4 or 5
  studyStreak: 5,
  lastStudyDate: '2024-11-20',
  totalStudyTime: 3600, // seconds
  
  // Per-module tracking
  tableClicks: 45,
  tableCellsViewed: ['der-Nom-M', 'die-Nom-F', ...],
  
  flashcardsAnswered: 67,
  flashcardAccuracy: 0.78,
  
  // Per-case mastery
  masteredCells: {
    'nominativ': 12,
    'akkusativ': 8,
    'dativ': 5,
    'genitiv': 7
  },
  
  // Achievements
  achievements: [
    { id: 'first_study', name: 'First Study Session', unlocked: true },
    { id: 'week_streak', name: '7 Day Streak', unlocked: false }
  ]
};
```

### Progress API
```javascript
// app.js - Shared progress functions
const ProgressAPI = {
  load() {
    const saved = localStorage.getItem('germanLearningProgress');
    return saved ? JSON.parse(saved) : getDefaultProgress();
  },
  
  save(progress) {
    localStorage.setItem('germanLearningProgress', JSON.stringify(progress));
  },
  
  incrementTableClick() {
    const progress = this.load();
    progress.tableClicks++;
    this.save(progress);
  },
  
  updateFlashcardProgress(cardsStudied, accuracy) {
    const progress = this.load();
    progress.flashcardsAnswered += cardsStudied;
    progress.flashcardAccuracy = accuracy;
    progress.lastStudyDate = new Date().toISOString();
    this.save(progress);
  },
  
  getStreak() {
    const progress = this.load();
    const lastStudy = new Date(progress.lastStudyDate);
    const today = new Date();
    const daysDiff = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return progress.studyStreak;
    if (daysDiff === 1) return progress.studyStreak + 1;
    return 0; // streak broken
  }
};
```

---

## Cross-Module Integration

### 1. Table → Flashcard Link
**In table.html modal:**
```html
<div class="modal-footer">
  <button onclick="practiceCell('den', 'akkusativ', 'masculine')">
    🎴 Practice this with flashcards
  </button>
</div>

<script>
function practiceCell(form, case, gender) {
  // Save filter to localStorage
  localStorage.setItem('flashcardFilter', JSON.stringify({
    case: case,
    gender: gender
  }));
  
  // Navigate to flashcards
  window.location.href = 'flashcards.html';
}
</script>
```

**In flashcards.html:**
```javascript
// On page load, check for filter
window.onload = function() {
  const filter = localStorage.getItem('flashcardFilter');
  if (filter) {
    const { case, gender } = JSON.parse(filter);
    applyFilter(case, gender);
    localStorage.removeItem('flashcardFilter'); // Clear after use
  }
};
```

### 2. Flashcard → Table Link
**In flashcard explanation:**
```html
<div class="explanation">
  <p>Akkusativ, masculine (Hund), weak declension</p>
  <a href="table.html?highlight=den-Akk-M" class="reference-link">
    📊 View in declension table
  </a>
</div>
```

**In table.html:**
```javascript
// On page load, check for highlight parameter
const urlParams = new URLSearchParams(window.location.search);
const highlight = urlParams.get('highlight');
if (highlight) {
  const cell = document.querySelector(`[data-cell="${highlight}"]`);
  if (cell) {
    cell.classList.add('highlighted');
    cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
```

---

## Deployment Setup

### Option A: GitHub Pages

#### File: `.github/workflows/deploy.yml`
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./app
```

#### Manual Deployment
```bash
# One-time setup
git init
git add .
git commit -m "Initial MVP"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main

# Create gh-pages branch
git checkout -b gh-pages
git push origin gh-pages

# Enable in GitHub repo Settings → Pages → Source: gh-pages
```

### Option B: Netlify (Recommended)

#### File: `netlify.toml`
```toml
[build]
  publish = "app"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

#### Deployment Methods

**Method 1: Drag & Drop**
1. Go to https://app.netlify.com/drop
2. Drag the `app/` folder
3. Site deployed instantly

**Method 2: CLI**
```bash
npm install -g netlify-cli
netlify login
cd app/
netlify deploy --prod
```

**Method 3: Git Integration**
1. Push to GitHub
2. Connect repo in Netlify dashboard
3. Auto-deploys on push to main

---

## Performance Optimization

### 1. Inline Critical CSS
```html
<head>
  <style>
    /* Critical styles (< 14KB) */
    body { margin: 0; font-family: system-ui; }
    .hero { min-height: 100vh; display: flex; }
    /* ... other critical styles */
  </style>
  <link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'">
</head>
```

### 2. Lazy Load Flashcard Data
```javascript
// Don't load all 50 cards at once
async function loadFlashcards() {
  const response = await fetch('assets/data/flashcards.json');
  const cards = await response.json();
  return cards;
}
```

### 3. Minify Assets
```bash
# Simple minification
# HTML: remove whitespace, comments
# CSS: remove comments, whitespace
# JS: use Terser or online tool
```

### 4. Add Service Worker (Optional)
```javascript
// sw.js - Basic offline support
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('declension-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/table.html',
        '/flashcards.html',
        '/styles.css',
        '/app.js'
      ]);
    })
  );
});
```

---

## Configuration Files

### package.json (Optional)
```json
{
  "name": "german-declension-app",
  "version": "1.0.0",
  "description": "Interactive German declension learning app",
  "scripts": {
    "dev": "python -m http.server 8000 --directory app",
    "deploy:netlify": "netlify deploy --prod --dir=app",
    "deploy:gh": "gh-pages -d app"
  },
  "keywords": ["german", "learning", "declension", "flashcards"],
  "author": "",
  "license": "MIT"
}
```

### .gitignore
```
node_modules/
.DS_Store
.env
dist/
*.log
```

### README.md (User Guide)
```markdown
# German Declension Learning App

Learn German declensions through interactive tables and spaced repetition flashcards.

## Features
- Color-coded declension tables for all article and adjective types
- 50+ flashcards with Leitner system scheduling
- Progress tracking and streak counting
- Mobile-responsive design

## Usage
1. Visit [your-site-url]
2. Start with "View Tables" to learn the patterns
3. Practice with "Study Flashcards"
4. Track your progress on the home page

## Local Development
```bash
cd app/
python -m http.server 8000
# Open http://localhost:8000
```

## Deployment
See DEPLOY.md for deployment instructions.

## License
MIT
```

---

## Quality Checklist

### Functionality
- [ ] Navigate between all pages
- [ ] Progress updates on landing page
- [ ] localStorage persists across reloads
- [ ] Cross-module links work (table ↔ flashcard)
- [ ] Shared navigation on all pages
- [ ] Mobile menu works

### Performance
- [ ] Initial load <2s on 3G
- [ ] Lighthouse Performance score >90
- [ ] Total bundle size <200KB
- [ ] No render-blocking resources

### Accessibility
- [ ] All interactive elements keyboard-accessible
- [ ] ARIA labels on navigation
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Screen reader tested

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Deployment
- [ ] Site accessible via HTTPS
- [ ] Custom domain configured (optional)
- [ ] No 404 errors
- [ ] Fast CDN delivery
- [ ] Analytics configured (optional)

---

## Output Files

```
app/
├── index.html          (landing page)
├── table.html          (declension tables)
├── flashcards.html     (flashcard study)
├── styles.css          (shared styles)
├── app.js              (shared logic)
├── assets/
│   └── data/
│       ├── declensions.json
│       └── flashcards.json
├── README.md           (user guide)
├── DEPLOY.md           (deployment guide)
├── netlify.toml        (Netlify config)
└── .gitignore
```

---

## Testing Checklist

- [ ] All pages load without errors
- [ ] Navigation works on all pages
- [ ] Progress syncs between modules
- [ ] Mobile responsive (tested on real device)
- [ ] Fast load times (<2s)
- [ ] No console errors or warnings
- [ ] Cross-module links functional
- [ ] Deployed site accessible
- [ ] Works offline (after first load)
- [ ] Data persists in localStorage

---

## Post-Deployment Tasks

### 1. Smoke Test
- Visit all pages
- Complete one study session
- Check progress updates
- Test on mobile device

### 2. Analytics Setup (Optional)
- Add Plausible or Simple Analytics
- Track page views
- Monitor study completions

### 3. User Testing
- Share with 3-5 A2 German learners
- Collect feedback
- Document bugs and feature requests

### 4. Iterate
- Fix critical bugs
- Add highest-value features
- Optimize based on analytics

---

## Deployment Commands Summary

### Netlify (Recommended)
```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd app/
netlify deploy --prod

# Custom domain (optional)
netlify domains:add yourdomain.com
```

### GitHub Pages
```bash
# Create and push gh-pages branch
git checkout -b gh-pages
git add app/*
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# Enable in repo Settings → Pages
```

---

## Success Metrics

After 1 week of deployment:
- [ ] 10+ users have visited
- [ ] 50+ cards studied
- [ ] No critical bugs reported
- [ ] Average session length >5 minutes
- [ ] Mobile usage >30%

---

## Acceptance Criteria

✅ All three pages integrated and functional
✅ Shared navigation works on all pages
✅ Progress tracks across modules
✅ Cross-module links functional
✅ Deployed to Netlify or GitHub Pages
✅ Site accessible via HTTPS
✅ Mobile responsive and tested
✅ Performance Lighthouse score >90
✅ No console errors
✅ README and deployment docs complete

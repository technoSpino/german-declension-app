# German Declension Learning App - MVP

## CTO Review Summary

**Original Spec Assessment:** Overengineered for MVP. The full spec was a 6-8 week, 4-person project.

**MVP Thesis:** Prove that color-coded declension tables + basic flashcards can help A2 learners. 

### Scope Decisions

#### ✅ Keep for MVP
1. **Interactive Declension Table** - Core value, relatively simple
2. **Basic Flashcard System** - Essential for practice, proven pedagogy
3. **Simple Progress Tracking** - Motivation, low complexity

#### ❌ Defer to V2
1. **3D Room Module** - High complexity (Three.js), unproven learning value
2. **Advanced Analytics** - Nice-to-have, not core
3. **Full SRS Algorithm** - Start with simple Leitner system, iterate later
4. **Gamification** - Polish, not essential
5. **Multi-language UI** - English only for MVP
6. **Cloud Sync** - LocalStorage sufficient for MVP

---

## Tech Stack (Optimized for Simple Deploy)

- **Framework**: Vanilla JS or lightweight setup (Vite if needed)
- **Styling**: Tailwind CSS (utility-first)
- **State**: LocalStorage (no Redux/Zustand)
- **Deployment**: GitHub Pages or Netlify (static site)
- **No backend**: Pure client-side
- **Bundle Size Target**: <100KB gzipped

---

## Project Structure

```
german-declension-mvp/
  ├── README.md                    (this file)
  ├── EXECUTION_PLAN.md            (how to build this)
  ├── DEPLOY.md                    (deployment instructions)
  │
  ├── agents/
  │   ├── AGENT_1_TABLE.md         (Table module spec)
  │   ├── AGENT_2_FLASHCARD.md     (Flashcard module spec)
  │   └── AGENT_3_INTEGRATION.md   (Integration & deploy spec)
  │
  └── app/                         (output directory for final app)
      ├── index.html               (to be created by Agent 3)
      ├── table.html               (to be created by Agent 1)
      ├── flashcards.html          (to be created by Agent 2)
      ├── styles.css               (to be created by Agent 3)
      └── data/                    (to be created)
```

---

## Three-Agent Architecture

Each agent is completely independent and can be executed in parallel or sequentially.

### Agent 1: Table Module
- **Input**: Declension rules, color scheme
- **Output**: Single HTML page with interactive tables
- **Complexity**: Low-Medium
- **Files**: 1 HTML file

### Agent 2: Flashcard Module
- **Input**: Card generation rules, Leitner system
- **Output**: Single HTML page with flashcard study interface
- **Complexity**: Medium
- **Files**: 1 HTML file

### Agent 3: Integration & Deployment
- **Input**: Outputs from Agent 1 & 2
- **Output**: Integrated app with navigation, deployed site
- **Complexity**: Low
- **Files**: Landing page, shared styles, config files

---

## Execution Sequence

### Option A: Sequential (Recommended)
```bash
Week 1: Execute Agent 1 → Test table module
Week 2: Execute Agent 2 → Test flashcard module
Week 3: Execute Agent 3 → Integrate and deploy
```

### Option B: Parallel (If using multiple developers)
```bash
Developer 1: Agent 1
Developer 2: Agent 2
Developer 3: Agent 3 (starts after 1 & 2 complete)
```

---

## Getting Started

1. Read `EXECUTION_PLAN.md` for detailed build instructions
2. Review each agent spec in `agents/` folder
3. Execute agents using Claude Code or your preferred method
4. Follow `DEPLOY.md` for deployment instructions

---

## MVP Success Criteria

### Must Have (Week 3)
- ✅ All 5 declension tables display correctly
- ✅ 50 flashcards with working Leitner system
- ✅ Progress saves to localStorage
- ✅ Deployed to GitHub Pages or Netlify
- ✅ Mobile responsive
- ✅ No major bugs

### Nice to Have (Can defer)
- Table pattern highlighting
- Flashcard swipe gestures
- Dark mode
- Export progress to CSV

### Post-MVP (V2)
- 3D room module
- Advanced analytics
- Cloud sync
- Community features

---

## Timeline

- **Week 1**: Agent 1 complete, tested
- **Week 2**: Agent 2 complete, tested
- **Week 3**: Integration, deploy, initial user testing
- **Week 4**: Bug fixes, polish based on feedback

---

## Technology Decisions

### Why Vanilla JS?
- No build complexity
- Easier for Claude Code to generate
- Faster iteration
- Simpler deployment

### Why LocalStorage?
- No backend needed
- Works offline
- Perfect for MVP
- Easy to migrate to cloud sync later

### Why Netlify?
- Easier than GitHub Pages (no branch management)
- Instant previews for testing
- Better for iteration
- Free tier sufficient

---

## Questions?

Read the detailed agent specifications in the `agents/` folder. Each agent spec is self-contained and can be handed directly to Claude Code for execution.

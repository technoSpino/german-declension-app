# Execution Plan

## Overview

This document explains how to build the German Declension Learning App MVP using the three-agent architecture.

---

## Prerequisites

- Basic understanding of HTML/CSS/JavaScript
- Claude Code CLI installed (or ability to work with Claude.ai)
- Git installed
- Text editor (VS Code, Sublime, etc.)
- Local web server for testing (Python's `http.server`, VS Code Live Server, etc.)

---

## Project Setup

### 1. Initialize Project

```bash
# Create project directory
mkdir german-declension-mvp
cd german-declension-mvp

# Create folder structure
mkdir -p agents app/data

# Initialize git (optional but recommended)
git init
```

### 2. Copy Agent Specifications

Place the following files in the `agents/` directory:
- `AGENT_1_TABLE.md`
- `AGENT_2_FLASHCARD.md`
- `AGENT_3_INTEGRATION.md`

---

## Execution Methods

### Method A: Using Claude Code CLI

```bash
# Execute Agent 1
cd agents
claude "Build the table module according to AGENT_1_TABLE.md specification. 
        Output the complete HTML file to ../app/table.html"

# Test Agent 1
cd ../app
python3 -m http.server 8000
# Open http://localhost:8000/table.html

# Execute Agent 2
cd ../agents
claude "Build the flashcard module according to AGENT_2_FLASHCARD.md specification.
        Output the complete HTML file to ../app/flashcards.html"

# Test Agent 2
cd ../app
# Open http://localhost:8000/flashcards.html

# Execute Agent 3
cd ../agents
claude "Build the integration layer according to AGENT_3_INTEGRATION.md specification.
        Integrate table.html and flashcards.html, create landing page and shared resources."

# Test complete app
cd ../app
# Open http://localhost:8000/
```

### Method B: Using Claude.ai Web Interface

1. **For each agent:**
   - Open a new conversation in Claude.ai
   - Copy the entire agent specification
   - Ask: "Please build this according to the specification"
   - Copy the generated code into the appropriate files

2. **Testing between agents:**
   - Create files in `app/` directory
   - Test in browser before proceeding to next agent

3. **Iteration:**
   - If bugs found, provide specific feedback
   - Claude can iterate on the code

### Method C: Manual Development

Use the agent specifications as detailed requirements documents and build yourself.

---

## Recommended Workflow

### Week 1: Agent 1 - Table Module

**Day 1-2: Initial Build**
```bash
# Execute Agent 1
# Review generated code
# Create app/table.html
```

**Day 3-4: Testing & Refinement**
- Test on desktop browsers (Chrome, Firefox, Safari)
- Test on mobile (iOS Safari, Chrome Mobile)
- Verify color scheme is accessible
- Check all 5 tables display correctly
- Test modal interactions

**Day 5: Checklist Completion**
- [ ] All 5 tables display correctly
- [ ] Clicking cells shows examples
- [ ] Colors are distinct and accessible
- [ ] Works on mobile (320px width)
- [ ] No console errors

### Week 2: Agent 2 - Flashcard Module

**Day 1-2: Initial Build**
```bash
# Execute Agent 2
# Review generated code
# Create app/flashcards.html
```

**Day 3-4: Testing & Refinement**
- Test card display
- Verify Leitner system logic
- Test localStorage persistence
- Check all 50 cards generated correctly
- Test on mobile

**Day 5: Checklist Completion**
- [ ] Cards display correctly
- [ ] Answer buttons work
- [ ] Progress saves to localStorage
- [ ] Due date calculation correct
- [ ] Stats update accurately
- [ ] Filter works in browse mode

### Week 3: Agent 3 - Integration & Deployment

**Day 1-2: Integration**
```bash
# Execute Agent 3
# Create landing page (app/index.html)
# Create shared styles (app/styles.css)
# Wire up navigation
```

**Day 3: Testing**
- Test navigation between pages
- Verify progress tracking works across modules
- Test cross-module links (table → flashcard, etc.)
- Mobile responsiveness check

**Day 4: Deployment**
```bash
# Follow DEPLOY.md
# Deploy to Netlify or GitHub Pages
# Test deployed version
```

**Day 5: Final Checklist**
- [ ] All pages linked correctly
- [ ] Navigation works
- [ ] Progress syncs across modules
- [ ] Mobile responsive
- [ ] Fast load (<2s on 3G)
- [ ] No console errors
- [ ] Deployed site accessible

---

## Testing Strategy

### Local Testing

```bash
# Start local server
cd app/
python3 -m http.server 8000

# Or use Node.js
npx http-server -p 8000

# Or use PHP
php -S localhost:8000
```

### Browser Testing

**Required browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

**Test at breakpoints:**
- 320px (small mobile)
- 768px (tablet)
- 1024px (desktop)

### LocalStorage Testing

```javascript
// In browser console
// View all data
console.log(localStorage);

// Clear data (for fresh start)
localStorage.clear();

// Inspect specific keys
console.log(localStorage.getItem('flashcards'));
console.log(localStorage.getItem('progress'));
```

---

## Troubleshooting

### Common Issues

**Issue: Tables not displaying**
- Check browser console for errors
- Verify data structure in HTML
- Check CSS is loading

**Issue: Flashcards not saving**
- Check localStorage is enabled (private browsing disables it)
- Verify JSON.stringify/parse is working
- Check browser console for errors

**Issue: Navigation broken**
- Verify file paths are correct (relative paths)
- Check href attributes in links
- Test on deployed site (local paths may differ)

**Issue: Mobile layout broken**
- Check viewport meta tag exists
- Verify responsive CSS (media queries)
- Test actual device, not just browser resize

---

## Code Quality Checks

Before considering an agent "complete", verify:

1. **No Console Errors**
   - Open browser DevTools
   - Check Console tab
   - Should be clean (no red errors)

2. **Valid HTML**
   - Run through https://validator.w3.org/
   - Fix any errors

3. **Performance**
   - Open DevTools Network tab
   - Total page size < 500KB
   - Load time < 2s on throttled connection

4. **Accessibility**
   - Run Lighthouse audit
   - Accessibility score > 90
   - Test keyboard navigation (Tab key)

---

## Version Control

### Git Workflow

```bash
# After Agent 1 complete
git add app/table.html
git commit -m "feat: Add table module (Agent 1)"

# After Agent 2 complete
git add app/flashcards.html
git commit -m "feat: Add flashcard module (Agent 2)"

# After Agent 3 complete
git add app/*.html app/*.css app/*.js
git commit -m "feat: Add integration and landing page (Agent 3)"

# Tag MVP release
git tag -a v1.0.0-mvp -m "MVP Release"
```

---

## Success Criteria

### Agent 1 Success
✅ Table module works standalone
✅ All declension tables render correctly
✅ Color coding is clear and consistent
✅ Modal interactions work smoothly
✅ Mobile responsive

### Agent 2 Success
✅ Flashcard module works standalone
✅ All 50 cards generated correctly
✅ Leitner system schedules cards properly
✅ LocalStorage persists data
✅ Mobile responsive

### Agent 3 Success
✅ Landing page provides clear navigation
✅ All modules integrated seamlessly
✅ Progress tracking works across modules
✅ App deployed successfully
✅ No broken links or errors

---

## Next Steps After MVP

Once MVP is complete and deployed:

1. **User Testing**
   - Share with 5-10 A2 German learners
   - Collect feedback (Google Form or similar)
   - Observe them using the app (if possible)

2. **Analytics** (Optional)
   - Add simple analytics (Plausible or similar)
   - Track: page views, session duration, most-used features

3. **Iteration**
   - Prioritize feedback
   - Fix critical bugs
   - Consider V2 features

4. **Marketing** (If desired)
   - Share on Reddit (r/German, r/languagelearning)
   - Post on language learning forums
   - Create short demo video

---

## Support

If you encounter issues during execution:

1. **Check agent specification** - Re-read the requirements
2. **Review testing checklist** - Verify each item
3. **Browser DevTools** - Console errors often explain issues
4. **Start fresh** - Sometimes easier to regenerate than debug
5. **Simplify** - If a feature is problematic, consider removing it for MVP

---

## Timeline Summary

**Aggressive:** 1 week (if experienced, working full-time)
**Realistic:** 3 weeks (part-time, with testing)
**Comfortable:** 4 weeks (includes user feedback iteration)

Choose the timeline that fits your schedule and experience level.

# Deployment Guide

Complete guide for deploying the German Declension Learning App to production.

---

## Quick Links

- **Netlify** (Recommended): See Section 1
- **GitHub Pages**: See Section 2  
- **Vercel**: See Section 3
- **Custom Domain**: See Section 4

---

## Prerequisites

Before deploying, ensure:
- [ ] All 3 agents completed
- [ ] app/ folder contains all files
- [ ] Tested locally (http://localhost:8000)
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Git repository initialized (optional but recommended)

---

## Section 1: Netlify Deployment (Recommended)

### Why Netlify?
- ✅ Easiest setup (drag & drop)
- ✅ Instant preview deploys
- ✅ Auto HTTPS
- ✅ Generous free tier
- ✅ Custom domains
- ✅ Form handling (if needed later)

### Method A: Drag & Drop (Fastest)

1. **Prepare folder**
   ```bash
   cd german-declension-mvp/
   # Ensure app/ contains: index.html, table.html, flashcards.html, styles.css, app.js
   ```

2. **Deploy**
   - Visit: https://app.netlify.com/drop
   - Drag the `app/` folder onto the page
   - Wait 10-20 seconds
   - Get URL: `https://random-name-12345.netlify.app`

3. **Customize (Optional)**
   - Click "Site settings"
   - Change site name: `german-declension-yourname`
   - New URL: `https://german-declension-yourname.netlify.app`

4. **Test**
   - Visit your URL
   - Click through all pages
   - Test on mobile
   - Verify progress saves

### Method B: CLI (For Updates)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   # or
   yarn global add netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   # Opens browser, authorize
   ```

3. **Deploy**
   ```bash
   cd german-declension-mvp/
   netlify deploy --prod --dir=app
   
   # Follow prompts:
   # - Create new site (first time)
   # - Publish directory: app
   ```

4. **Future updates**
   ```bash
   # After making changes
   netlify deploy --prod --dir=app
   ```

### Method C: GitHub Integration (Auto-deploy)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/german-declension.git
   git push -u origin main
   ```

2. **Connect in Netlify**
   - Visit: https://app.netlify.com
   - Click "Add new site" → "Import from Git"
   - Select your GitHub repo
   - Configure:
     - Build command: (leave empty)
     - Publish directory: `app`
   - Click "Deploy"

3. **Auto-deploys**
   - Every push to `main` auto-deploys
   - Pull requests get preview URLs

### netlify.toml Configuration

Create `netlify.toml` in project root:

```toml
[build]
  publish = "app"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Optional: Custom headers for specific files
[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## Section 2: GitHub Pages

### Why GitHub Pages?
- ✅ Free forever
- ✅ Integrated with GitHub
- ✅ Simple for open source projects
- ❌ Requires branch management
- ❌ HTTPS requires custom domain

### Setup

#### Option A: Deploy from main branch

1. **Prepare repository**
   ```bash
   # Ensure app/ is in root or move contents to root
   cd german-declension-mvp/
   
   # Option 1: Keep app/ folder
   git init
   git add .
   git commit -m "Initial commit"
   
   # Option 2: Move contents to root
   mv app/* .
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**
   ```bash
   git branch -M main
   git remote add origin https://github.com/yourusername/german-declension.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repo → Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main`
   - Folder: `/root` or `/app` (depending on structure)
   - Click Save

4. **Wait & Access**
   - Deployment takes 1-2 minutes
   - URL: `https://yourusername.github.io/german-declension/`

#### Option B: Deploy from gh-pages branch

1. **Create gh-pages branch**
   ```bash
   cd german-declension-mvp/
   
   # Create orphan branch
   git checkout --orphan gh-pages
   
   # Copy app contents
   git rm -rf .
   cp -r app/* .
   
   # Commit
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

2. **Enable GitHub Pages**
   - Settings → Pages
   - Source: `gh-pages` branch
   - Folder: `/root`

3. **Future updates**
   ```bash
   # Make changes in main branch
   git checkout main
   # ... edit files ...
   git commit -am "Updates"
   
   # Update gh-pages
   git checkout gh-pages
   git merge main
   git push origin gh-pages
   ```

### .nojekyll File

Add empty `.nojekyll` file to prevent Jekyll processing:

```bash
cd app/  # or root
touch .nojekyll
git add .nojekyll
git commit -m "Add .nojekyll"
git push
```

---

## Section 3: Vercel

### Why Vercel?
- ✅ Very fast CDN
- ✅ Great DX (developer experience)
- ✅ Auto HTTPS
- ✅ Preview deployments

### Setup

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd german-declension-mvp/app/
   vercel
   
   # Follow prompts:
   # - Login/signup
   # - Set up and deploy? Yes
   # - Which scope? (your account)
   # - Link to existing project? No
   # - What's your project's name? german-declension
   # - In which directory is your code located? ./
   # - Override settings? No
   ```

3. **Production deploy**
   ```bash
   vercel --prod
   ```

4. **Future updates**
   ```bash
   vercel --prod
   ```

### vercel.json Configuration

Optional `vercel.json` in app/:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

---

## Section 4: Custom Domain

### Netlify Custom Domain

1. **Buy domain** (Namecheap, Google Domains, etc.)

2. **Add in Netlify**
   - Site settings → Domain management
   - Add custom domain: `learn-german.com`
   - Follow DNS instructions

3. **Configure DNS** (at domain registrar)
   - Add A record: `185.199.108.153` (or Netlify's IP)
   - Or CNAME: `your-site.netlify.app`

4. **Enable HTTPS**
   - Netlify auto-provisions SSL
   - Wait 10-60 minutes

### GitHub Pages Custom Domain

1. **Add CNAME file**
   ```bash
   cd app/  # or root
   echo "learn-german.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. **Configure DNS**
   - A records:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`

3. **Enable HTTPS**
   - Settings → Pages
   - Check "Enforce HTTPS"

---

## Section 5: Performance Optimization

### Before Deploying

1. **Minify files**
   ```bash
   # HTML
   html-minifier --collapse-whitespace --remove-comments index.html -o index.html
   
   # CSS
   cleancss -o styles.min.css styles.css
   
   # JS
   uglifyjs app.js -o app.min.js -c -m
   ```

2. **Optimize images**
   - Convert to WebP
   - Compress PNGs/JPGs
   - Use appropriate sizes

3. **Enable caching**
   - See headers in netlify.toml above
   - Add cache-control headers

### After Deploying

1. **Test with Lighthouse**
   ```bash
   # Install
   npm install -g lighthouse
   
   # Run
   lighthouse https://your-site.com --view
   ```

2. **Target scores**
   - Performance: >90
   - Accessibility: >90
   - Best Practices: >90
   - SEO: >90

---

## Section 6: Testing Checklist

### Pre-deployment
- [ ] All pages load locally
- [ ] Navigation works
- [ ] Progress saves/loads
- [ ] Mobile responsive (320px+)
- [ ] No console errors
- [ ] localStorage works

### Post-deployment
- [ ] Site loads at URL
- [ ] All pages accessible
- [ ] HTTPS enabled (green padlock)
- [ ] Mobile test on real device
- [ ] Cross-browser test (Chrome, Firefox, Safari)
- [ ] Lighthouse audit >90
- [ ] Share with 5 users

---

## Section 7: Monitoring & Analytics

### Simple Analytics (Privacy-focused)

#### Plausible Analytics
```html
<!-- Add to <head> in all pages -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

#### Self-hosted (optional)
- Use Umami or Matomo
- Full privacy control
- Requires server

### Error Tracking

#### Sentry (Free tier)
```html
<script src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"></script>
<script>
  Sentry.init({
    dsn: 'YOUR_DSN',
    environment: 'production'
  });
</script>
```

---

## Section 8: Continuous Deployment

### GitHub Actions (Auto-deploy to Netlify)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=app
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

Setup:
1. Get Netlify auth token: https://app.netlify.com/user/applications
2. Get site ID: Site settings → Site information
3. Add as GitHub secrets: Settings → Secrets

---

## Section 9: Rollback & Recovery

### Netlify
- Deploys → Previous deploys
- Click "Publish deploy" on any previous version
- Instant rollback

### GitHub Pages
```bash
# Revert to previous commit
git revert HEAD
git push

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force
```

### Backups
```bash
# Download deployed site
wget --recursive --no-parent https://your-site.com

# Or use git tags
git tag v1.0.0
git push --tags
```

---

## Section 10: Troubleshooting

### Issue: Site doesn't load
- Check deployment logs
- Verify publish directory is correct
- Check for 404s in Network tab
- Verify index.html exists

### Issue: Styles not loading
- Check file paths (relative vs absolute)
- Verify CSS file deployed
- Check browser console for errors
- Clear cache

### Issue: LocalStorage not working
- Check HTTPS (required for some browsers)
- Verify no incognito/private mode
- Check browser storage settings

### Issue: Mobile not responsive
- Add viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Test with DevTools mobile emulator
- Test on real device

---

## Section 11: Post-Launch Checklist

### Week 1
- [ ] Monitor for errors
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Update documentation

### Week 2
- [ ] Analyze usage patterns
- [ ] Identify most-used features
- [ ] Plan improvements
- [ ] Consider V2 features

### Ongoing
- [ ] Keep dependencies updated
- [ ] Monitor performance
- [ ] Respond to user issues
- [ ] Iterate based on feedback

---

## Quick Reference

### Netlify Deploy
```bash
netlify deploy --prod --dir=app
```

### GitHub Pages Deploy
```bash
git push origin gh-pages
```

### Vercel Deploy
```bash
vercel --prod
```

### Test Locally
```bash
python -m http.server 8000
# or
npx http-server app/ -p 8000
```

---

## Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **GitHub Pages Docs**: https://docs.github.com/pages
- **Vercel Docs**: https://vercel.com/docs
- **Web.dev**: https://web.dev (performance tips)

---

**You're ready to ship!** 🚀

Choose your deployment method above and follow the steps. Netlify drag-and-drop is the fastest way to get live in 60 seconds.

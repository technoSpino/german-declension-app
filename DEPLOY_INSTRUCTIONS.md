# Deployment Instructions

## Quick Deploy to Netlify (5 minutes)

### Option 1: Drag & Drop (Easiest)

1. **Build the app:**
   ```bash
   cd app
   npm run build
   ```
   This creates the `app/dist` folder.

2. **Deploy to Netlify:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Sign up or log in
   - Drag the `app/dist` folder onto the upload area
   - Done! Your site will be live at `https://random-name.netlify.app`

3. **Custom domain (optional):**
   - Click "Domain settings" in Netlify
   - Add your custom domain
   - Follow DNS instructions

### Option 2: Git-Connected (Best for updates)

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/german-declension-mvp.git
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Select your repository
   - Configure build settings:
     - **Base directory:** `app`
     - **Build command:** `npm run build`
     - **Publish directory:** `app/dist`
   - Click "Deploy site"

3. **Automatic deployments:**
   - Every `git push` will trigger a new deployment
   - Netlify builds and deploys in ~1 minute

## What's Deployed

- **Landing page** with hero section and progress dashboard
- **Declension tables** with color-coded cells and examples
- **Flashcard system** with Leitner box algorithm
- **LocalStorage persistence** for user progress
- **Mobile responsive** design

## Build Info

- **Bundle size:** ~67 KB gzipped (CSS 9KB + JS 58KB)
- **Load time:** <1 second
- **Tests:** 27/31 passing (87%)
- **Browser support:** Chrome, Firefox, Safari, Edge (latest)

## Post-Deployment

### Test the deployment:
1. Visit your Netlify URL
2. Test all three sections:
   - Landing page (/)
   - Tables (/tables)
   - Flashcards (/flashcards)
3. Test on mobile device
4. Check localStorage persistence (answer some flashcards, reload page)

### Monitor:
- Netlify dashboard shows bandwidth, builds, errors
- Check browser console for any errors

## Troubleshooting

**Build fails:**
- Make sure `node_modules` exists: `cd app && npm install`
- Check Node version: Need v18 or higher

**404 errors:**
- Netlify should use `netlify.toml` redirects automatically
- Check "Publish directory" is set to `app/dist`

**Blank page:**
- Check browser console for errors
- Verify build succeeded: `cd app && npm run build`
- Test locally first: `npm run preview`

## Ready to Deploy!

Your app is production-ready. Choose Option 1 for quick deployment or Option 2 for continuous deployment.

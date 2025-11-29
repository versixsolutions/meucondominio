# Sentry Activation Guide

## Status: Ready for Setup ✅

Your project already has Sentry SDK integrated and configured. You just need to activate it with a DSN (Data Source Name).

## Step-by-Step Setup

### 1. Create Sentry Account
- Go to https://sentry.io/signup/
- Sign up with your email or GitHub account
- Verify your email
- Choose "Web Development" as your first project

### 2. Create React Project
- After signup, select "React" as the framework
- Name the project: `versix-norma` or similar
- Click "Create Project"

### 3. Get Your DSN
- You'll see a setup screen with your DSN
- DSN format: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
- Copy the entire DSN value

### 4. Add to Vercel Environment
Option A - Via Vercel Dashboard:
```bash
1. Go to https://vercel.com
2. Select "versix-norma" project
3. Go to Settings → Environment Variables
4. Add new variable:
   Name: VITE_SENTRY_DSN
   Value: [paste your DSN here]
5. Click "Save"
6. Redeploy or trigger new deployment
```

Option B - Via Vercel CLI (from terminal):
```bash
# If using Vercel CLI (installed earlier)
vercel env add VITE_SENTRY_DSN
# Paste your DSN when prompted
# Then redeploy: vercel --prod
```

### 5. Alternative: Local Development with .env
For testing locally before deploying:

Create `.env.local` file in project root:
```
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
VITE_SENTRY_ENVIRONMENT=development
```

Then:
```bash
npm run dev
```

### 6. Verify It's Working

**On Production:**
- Deploy the changes (automatic via Vercel or manual `vercel --prod`)
- Visit https://app.versixnorma.com.br
- Go to https://sentry.io/projects/versix-norma
- You should see "Waiting for events..."
- Trigger a test error to verify (check browser console for any errors)

**On Local:**
- Run `npm run dev`
- Open browser console (F12)
- Sentry will log: "✅ Sentry initialized (development)"
- Check Sentry dashboard for incoming events

## Important Files Already Configured

✅ `src/lib/sentry.ts` - Initialization function ready
✅ `src/main.tsx` - Calls initializeSentry() at startup
✅ `src/App.tsx` - ErrorBoundary and Profiler wrapper applied
✅ `vercel.json` - CSP headers allow sentry.io
✅ `.env.example` - Template includes VITE_SENTRY_DSN

## What Sentry Tracks (Once Activated)

🔴 **Errors:**
- Uncaught exceptions
- React errors
- Network failures
- Custom errors via `captureError()`

📊 **Performance:**
- Page load times (LCP, FCP, CLS)
- API response times
- Component render duration

🎥 **Session Replays:**
- Video recording of errors
- User interactions before error
- Network and console logs (masked for privacy)

## Using Sentry in Your Code

### Capture Custom Errors
```typescript
import { captureError } from '@/lib/sentry'

try {
  // Some operation
} catch (error) {
  captureError('Failed to load votações', { context: error })
}
```

### Capture Custom Messages
```typescript
import { captureMessage } from '@/lib/sentry'

captureMessage('User voted on votação', 'info')
```

### Set Custom Tags
```typescript
import { setTag } from '@/lib/sentry'

setTag('user-type', 'admin')
setTag('page', 'dashboard')
```

## Pricing

✅ **FREE Tier (Perfect for this project):**
- 5,000 errors/month
- 1 GB session replays
- Unlimited team members
- 30-day retention

Our project usage estimate:
- 100-500 errors/month (well within free tier)
- Light session replay usage

## FAQ

**Q: Will Sentry slow down my app?**
A: No, Sentry uses async event capture (<1ms impact)

**Q: Is my user data safe?**
A: Yes! Session replays mask all text content and sensitive data by default

**Q: Can I disable Sentry in development?**
A: Yes, just don't set VITE_SENTRY_DSN in your .env.local

**Q: When will I see errors?**
A: Immediately after first user interaction or error occurs

## Next Steps

1. ✅ Create Sentry account (free tier)
2. ✅ Create React project
3. ✅ Copy DSN
4. ✅ Add VITE_SENTRY_DSN to Vercel environment
5. ✅ Redeploy to production
6. ✅ Monitor dashboard at https://sentry.io

Once done, error tracking will be live! 🚀

---

**Status:** Waiting for DSN setup
**Estimated Time:** 5 minutes
**Difficulty:** ⭐ Very Easy

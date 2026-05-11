# TruthCheck — AI Fact Verification

AI-powered real-time news verification using Claude + live web search.

## Tech Stack
- React 18 + Vite
- Anthropic Claude API (web_search tool)
- Netlify (hosting)

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy on Netlify via GitHub

1. Push this repo to GitHub
2. Go to netlify.com → Add new site → Import from GitHub
3. Select this repo
4. Build settings (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click Deploy

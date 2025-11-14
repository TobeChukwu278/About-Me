# Render Configuration - pnpm Setup

## 🎯 For Render Dashboard

When creating your Web Service on Render, use these exact settings:

### Service Configuration

| Setting | Value |
|---------|-------|
| **Name** | `portfolio-admin` |
| **Environment** | `Node` |
| **Root Directory** | *(leave empty)* |
| **Build Command** | `pnpm install --frozen-lockfile` |
| **Start Command** | `pnpm start` |
| **Instance Type** | `Free` (for testing) or `Starter` ($7/month) |

### Why These Commands?

- **`pnpm install --frozen-lockfile`** - Installs exact versions from `pnpm-lock.yaml` (reproducible builds)
- **`pnpm start`** - Runs `npm start` command from `package.json` (which executes `node index.js`)
- **Root Directory: empty** - Uses repository root (where `package.json` and `pnpm-lock.yaml` live)

## 📋 Environment Variables (Add in Render)

Add these in the "Advanced" → "Environment" section:

```
MONGO_URI=mongodb+srv://astrolix278_db_user:D6DqSBoJLhk18jhH@cluster0.zmxiulc.mongodb.net/?appName=Cluster0

SESSION_SECRET=your-strong-secret-key-here

NODE_ENV=production

PORT=3000
```

## ✅ Your Project Structure (Correct)

```
About-Me/                          ← Root directory (empty in Render)
├── index.js                       ← Entry point
├── package.json                   ← pnpm scripts defined here
├── pnpm-lock.yaml                 ← Dependency lock file
├── models/
│   ├── Admin.js
│   └── Portfolio.js
├── routes/
│   ├── admin.routes.js
│   ├── api.routes.js
│   └── portfolio.routes.js
├── views/
│   ├── layouts/
│   ├── admin/
│   └── ...
├── public/
│   └── js/
├── scripts/
│   └── seed.js
└── DEPLOYMENT.md
```

## 🔍 Verify Your package.json Scripts

Check that your `package.json` has:

```json
{
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js",
    "seed": "node scripts/seed.js"
  }
}
```

✅ Your file already has this configured correctly!

## 🚀 Quick Deploy Checklist

- [x] `index.js` in root directory
- [x] `package.json` with correct scripts
- [x] `pnpm-lock.yaml` committed to git
- [x] `.env` in `.gitignore` (not committed)
- [x] `.env.example` as template

## 📝 Common Questions

**Q: What if Render asks for "Package Manager"?**
A: Select `pnpm` if available, or leave as default (Render auto-detects from `pnpm-lock.yaml`)

**Q: Should I commit `pnpm-lock.yaml`?**
A: YES! It ensures reproducible builds. It's already tracked in your git.

**Q: Can I use npm instead of pnpm?**
A: Yes, but stick with `pnpm` for consistency. Your commands become:
- Build: `pnpm install --frozen-lockfile`
- Start: `pnpm start`

**Q: What if build fails?**
A: Check Render logs - usually due to:
1. Wrong environment variables
2. MongoDB connection issue
3. Missing dependencies

## 🔗 Resources

- Render Node Deployment: https://render.com/docs/deploy-node-express-app
- pnpm: https://pnpm.io/
- Your Root Directory Path: `/About-Me` (or just leave empty in Render)

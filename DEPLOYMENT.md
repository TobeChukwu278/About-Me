# Deployment Guide: Render

This guide explains how to deploy your Fastify portfolio to Render.

## Prerequisites

1. A GitHub account (your repo is already there: `https://github.com/TobeChukwu278/About-Me`)
2. A Render account (free tier available at https://render.com)
3. MongoDB Atlas account (already configured in your `.env`)

## Step 1: Prepare Your Application

### 1.1 Update `index.js` for Production

The cookie secure flag needs to be set based on environment:

```javascript
// In index.js, line ~26
fastify.register(require('@fastify/session'), {
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
  cookie: { 
    secure: process.env.NODE_ENV === 'production' // true in production
  }
});
```

### 1.2 Ensure PORT is Configurable

Your app should listen on the PORT environment variable (it already does):

```javascript
// In index.js, line ~75
const PORT = process.env.PORT || 3000;
```

### 1.3 Update Production Environment Variables

Ensure your `.env` has production settings:

```
MONGO_URI=mongodb+srv://astrolix278_db_user:D6DqSBoJLhk18jhH@cluster0.zmxiulc.mongodb.net/?appName=Cluster0
SESSION_SECRET=your-production-session-secret-key-here-use-strong-value
NODE_ENV=production
PORT=3000
```

## Step 2: Deploy to Render

### 2.1 Login to Render

1. Go to https://render.com
2. Sign up or login with GitHub (recommended)

### 2.2 Create a New Web Service

1. Click **"New +"** → **"Web Service"**
2. Select **"Deploy an existing GitHub repository"**
3. Search for **"About-Me"** and select it
4. Configure the service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `portfolio-admin` (or your preferred name) |
   | **Environment** | `Node` |
   | **Region** | Select closest to your users |
   | **Branch** | `main` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | `Free` (for testing) or `Starter` ($7/month) |

### 2.3 Add Environment Variables

1. Scroll down to **"Environment"**
2. Add these environment variables:

   ```
   MONGO_URI = mongodb+srv://astrolix278_db_user:D6DqSBoJLhk18jhH@cluster0.zmxiulc.mongodb.net/?appName=Cluster0
   SESSION_SECRET = [Use a strong random value - generate at https://1password.com/password-generator/]
   NODE_ENV = production
   ```

   **Important:** Generate a strong SESSION_SECRET! Example:
   ```
   SESSION_SECRET = NwKzH7j4mXp2QrT9vN6LsB8dFgH5jK1oP3sU8xYzC2aM9qR5tV0wX
   ```

3. Click **"Create Web Service"**

### 2.4 Deploy

Render will automatically:
- Install dependencies
- Build the application
- Start the server
- Assign you a URL like: `https://portfolio-admin.onrender.com`

### 2.5 Monitor Deployment

1. Watch the **"Logs"** tab for any errors
2. Once it shows **"Your service is live"** ✅, your app is deployed!

## Step 3: Post-Deployment

### 3.1 Initialize Database (First Time Only)

Run the seed script to populate initial data:

```bash
# Via Render Shell (if available)
npm run seed
```

Or manually via MongoDB Atlas:
1. Go to MongoDB Atlas
2. Verify collections are created: `Hero`, `TechStack`, `Project`, `Experience`, `Admin`, `About`, `Contact`, `Analytics`

### 3.2 Test Your Application

1. Visit: `https://your-render-url.onrender.com`
2. Test home page loads correctly
3. Test admin login: `/admin/login`
   - Username: `admin`
   - Password: `admin123`
4. Test admin dashboard and CRUD operations

### 3.3 Update Admin Credentials

**Important:** Change the default admin password!

1. Login to admin panel
2. Use MongoDB Atlas to update the admin user with a strong password
3. Or modify `scripts/seed.js` and re-run seed with new credentials

## Step 4: Custom Domain (Optional)

1. In Render dashboard, go to your service
2. Click **"Settings"** → **"Custom Domains"**
3. Add your custom domain (requires DNS changes)
4. Follow Render's instructions for DNS configuration

## Step 5: Monitoring & Logs

### View Logs
- In Render dashboard, click **"Logs"** tab
- Filter by error level if needed

### Set Up Alerts (Optional)
- Enable notifications in Render account settings

## Troubleshooting

### "Service Failed to Start"
- Check logs for error messages
- Verify all environment variables are set correctly
- Ensure MongoDB URI is accessible

### "Cannot connect to MongoDB"
- Verify IP whitelist in MongoDB Atlas: https://cloud.mongodb.com/
- Add `0.0.0.0/0` to allow all IPs (only for development)

### "Static files not loading"
- Ensure `/public` directory is committed to git
- Check file paths in `index.js`

### "Session not persisting"
- Verify `SESSION_SECRET` is set in environment
- Check `cookie.secure` setting matches environment

## Updating Your Application

To deploy new changes:

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin main
   ```

2. Render will automatically redeploy (if auto-deploy is enabled)

3. Or manually trigger a deploy in Render dashboard:
   - Click **"Manual Deploy"** → **"Deploy latest commit"**

## Free Tier Limitations

- Your service may spin down after 15 minutes of inactivity
- First request after spin-down takes ~10 seconds
- For production, upgrade to Starter ($7/month)

## Production Checklist

- [ ] Environment variables configured in Render
- [ ] Strong `SESSION_SECRET` set
- [ ] MongoDB URI is production database
- [ ] Default admin credentials changed
- [ ] HTTPS enabled (automatic with Render)
- [ ] Tested all admin features
- [ ] Logs monitored for errors

## Support & Resources

- Render Documentation: https://render.com/docs
- Fastify Deployment: https://www.fastify.io/docs/latest/Deployment/
- MongoDB Atlas: https://docs.atlas.mongodb.com/

---

**Your Production URL:** Will be assigned by Render after deployment

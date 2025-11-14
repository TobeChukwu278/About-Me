# Quick Deploy to Render Checklist

## 5-Minute Setup

### Step 1: Get Your SESSION_SECRET
Generate a strong random key here: https://1password.com/password-generator/
(Copy a 50+ character string)

### Step 2: Go to Render
1. Open https://render.com
2. Sign in with GitHub (or create account)
3. Click **"New +"** → **"Web Service"**

### Step 3: Connect GitHub Repo
1. Select **"Deploy an existing GitHub repository"**
2. Search and select **"About-Me"**
3. Click **"Connect"**

### Step 4: Configure Service
| Field | Value |
|-------|-------|
| **Name** | `portfolio-admin` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### Step 5: Add Environment Variables
Click **"Advanced"** and add:

```
MONGO_URI = mongodb+srv://astrolix278_db_user:D6DqSBoJLhk18jhH@cluster0.zmxiulc.mongodb.net/?appName=Cluster0

SESSION_SECRET = [Paste your generated key here]

NODE_ENV = production
```

### Step 6: Deploy
Click **"Create Web Service"** and wait ~2 minutes

### Step 7: Test
Your app will be live at: `https://portfolio-admin.onrender.com` (or similar)

✅ Done! Your portfolio is now deployed!

---

## After Deployment

### Access Your App
- **Home:** https://your-url.onrender.com
- **Admin:** https://your-url.onrender.com/admin/login
- **Login:** admin / admin123

### Important: Change Admin Password
1. Login to admin panel
2. Go to MongoDB Atlas: https://cloud.mongodb.com/
3. Find the `Admin` collection
4. Update the password field with a secure password

### Monitor Your App
- Check Render dashboard for logs
- Verify all pages load correctly
- Test admin CRUD operations

---

## Troubleshooting

**App won't start?**
- Check Logs tab in Render
- Verify all env variables are set
- Ensure MongoDB connection string is correct

**Can't login?**
- Default: admin / admin123
- Check MongoDB is accessible

**Pages look broken?**
- Clear browser cache (Ctrl+Shift+Del)
- Verify `/public` files were deployed

---

## Need Help?
- Render Docs: https://render.com/docs
- Your GitHub: https://github.com/TobeChukwu278/About-Me
- MongoDB Atlas: https://cloud.mongodb.com/

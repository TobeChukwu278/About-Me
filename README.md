# 🚀 TobeChukwu Ejiofor - Developer Portfolio

Welcome to my personal developer portfolio!
This repository conatins projects that demonstrate my skills in **JavScript, React, Node.js, Express, Fastify, MongoDb**, and other moder web technologies.

The portfolio is designed to be **clean, fast, and responsive**, showcasing real-world examples of my abilitiy to bulidfunctional, user friendly web applications

## ✨ Features

- **Server-Side Rendering** with Fastify + EJS
- **Live System Stats** - Real-time uptime, latency, and request count
- **Internet Connectivity Monitor** - Auto-retry when connection is restored
- **AI Chat Assistant** - Context-aware portfolio information
- **Admin Dashboard** - Full CRUD operations for all content
- **Analytics & Logging** - Track page views, errors, and user interactions
- **Modular Components** - Separate sections for Hero, Stack, Projects, Experience, About, Contact
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Dark Theme** - Futuristic bento-style layout with neon accents

## 📁 Project Structure

```
fastify-portfolio/
├── server.js                 # Main Fastify server
├── package.json              
├── .env                      # Environment variables
├── models/
│   ├── Admin.js             # Admin authentication
│   └── Portfolio.js         # All portfolio schemas
├── routes/
│   ├── portfolio.js         # Main portfolio routes
│   ├── admin.js             # Admin dashboard routes
│   └── api.js               # API endpoints
├── views/
│   ├── layouts/
│   │   └── main.ejs        # Main layout template
│   ├── index.ejs           # Portfolio homepage
│   └── admin/
│       ├── login.ejs       # Admin login
│       ├── dashboard.ejs   # Admin dashboard
│       ├── hero.ejs        # Manage hero section
│       ├── tech-stack.ejs  # Manage tech stack
│       ├── projects.ejs    # Manage projects
│       └── analytics.ejs   # View analytics
├── public/
│   └── js/
│       └── main.js         # Client-side JavaScript
└── scripts/
    └── seed.js             # Database seeder
```

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Step 1: Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd fastify-portfolio

# Install dependencies
npm install
```

### Step 2: Environment Setup

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/portfolio
SESSION_SECRET=your-super-secret-key-change-in-production
NODE_ENV=development
```

### Step 3: Seed Database

```bash
pnpm run seed
```

This will create:
- Admin user (username: `admin`, password: `admin123`)
- Sample portfolio data (hero, tech stack, projects, experience, about, contact)

### Step 4: Run Server

**Development mode** (with auto-reload):
```bash
pnpm run dev
```

**Production mode**:
```bash
pnpm start
```

Visit:
- **Portfolio**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin/login

## 📊 MongoDB Schemas

### Hero Section
```javascript
{
  name: String,
  title: String,
  tagline: String,
  techStack: [String],
  isActive: Boolean
}
```

### Tech Stack
```javascript
{
  name: String,
  icon: String,
  description: String,
  order: Number,
  isActive: Boolean
}
```

### Projects
```javascript
{
  name: String,
  description: String,
  tags: [String],
  link: String,
  githubUrl: String,
  order: Number,
  featured: Boolean,
  isActive: Boolean
}
```

### Experience
```javascript
{
  role: String,
  company: String,
  period: String,
  description: String,
  order: Number,
  isActive: Boolean
}
```

### Analytics/Logs
```javascript
{
  eventType: String, // 'page_view', 'section_view', 'link_click', 'error', 'api_call'
  page: String,
  userAgent: String,
  ipAddress: String,
  referrer: String,
  metadata: Object,
  timestamp: Date
}
```

## 🔌 API Endpoints

### Public APIs

- `GET /` - Portfolio homepage
- `GET /health` - Health check
- `GET /api/stats` - Live system stats
- `GET /api/portfolio` - Get all portfolio data
- `POST /api/chat` - AI chat assistant
- `POST /api/track` - Track analytics events

### Admin APIs

- `GET /admin/login` - Login page
- `POST /admin/login` - Handle login
- `GET /admin/logout` - Logout
- `GET /admin/dashboard` - Dashboard overview
- `GET /admin/hero` - Manage hero section
- `POST /admin/hero` - Update hero section
- `GET /admin/tech-stack` - Manage tech stack
- `POST /admin/tech-stack/add` - Add tech
- `POST /admin/tech-stack/delete/:id` - Delete tech
- `GET /admin/projects` - Manage projects
- `POST /admin/projects/add` - Add project
- `POST /admin/projects/delete/:id` - Delete project
- `GET /admin/analytics` - View analytics

## 🎨 Customization

### Change Colors

Edit the Tailwind classes in templates:
- Cyan: `cyan-400`, `cyan-500`
- Emerald: `emerald-400`, `emerald-500`
- Violet: `violet-400`, `violet-500`

### Add New Sections

1. Create schema in `models/Portfolio.js`
2. Add route in `routes/admin.js`
3. Create template in `views/admin/`
4. Update `views/index.ejs`

### Modify AI Responses

Edit the chat logic in `routes/api.js` at the `/api/chat` endpoint.

## 🔒 Security Notes

- Change `SESSION_SECRET` in production
- Use strong admin passwords
- Enable HTTPS in production
- Set `secure: true` for cookies in production
- Implement rate limiting for API endpoints
- Add CORS configuration if needed

## 🚀 Deployment

### Render (Recommended - Free & Easy)

For a quick deployment guide, see **[DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)**

For detailed deployment documentation, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

**Quick Steps:**
1. Push to GitHub (already done)
2. Go to https://render.com and sign in with GitHub
3. Create new Web Service from your GitHub repo
4. Add environment variables (MONGO_URI, SESSION_SECRET, NODE_ENV)
5. Deploy!

Your app will be live at `https://your-app-name.onrender.com`

### Local Deployment (VPS/DigitalOcean)

```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/TobeChukwu278/About-Me.git
cd About-Me

# Install dependencies
npm install

# Create .env file
nano .env
# Add: MONGO_URI, SESSION_SECRET, NODE_ENV=production, PORT=3000

# Install PM2 (process manager)
npm install -g pm2

# Start application
pm2 start index.js --name portfolio

# Enable auto-restart on reboot
pm2 startup
pm2 save
```

### Environment Variables Required

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
SESSION_SECRET=your-strong-secret-key
NODE_ENV=production
PORT=3000
```

**⚠️ Security Notes:**
- Never commit `.env` file (it's in `.gitignore`)
- Use `.env.example` as template
- Generate strong SESSION_SECRET (50+ characters)
- Change default admin credentials after deployment
- Enable HTTPS (automatic with Render, use nginx/certbot for VPS)

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## 📝 Todo / Future Enhancements

- [ ] Add image upload for projects
- [ ] Implement blog section
- [ ] Add contact form with email notifications
- [ ] Export analytics as CSV
- [ ] Add more admin user roles
- [ ] Implement 2FA for admin
- [ ] Add dark/light theme toggle
- [ ] Create API documentation page
- [ ] Add unit tests

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License - feel free to use for your own portfolio!

## 🙏 Acknowledgments

- Fastify - Fast and low overhead web framework
- MongoDB - Flexible document database
- Tailwind CSS - Utility-first CSS framework
- EJS - Embedded JavaScript templates

---

Made with ⚡ Fastify & MongoDB | © 2025 Tobe Ejiofor

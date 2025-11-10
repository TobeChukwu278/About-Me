const Admin = require('../models/Admin');
const { 
  Hero, 
  TechStack, 
  Project, 
  Experience, 
  About, 
  Contact,
  Analytics 
} = require('../models/Portfolio');

// Middleware to check authentication
async function checkAuth(request, reply) {
  if (!request.session.adminId) {
    return reply.redirect('/admin/login');
  }
}

async function adminRoutes(fastify, options) {
  
  // Admin login page
  fastify.get('/login', async (request, reply) => {
    if (request.session.adminId) {
      return reply.redirect('/admin/dashboard');
    }
    return reply.view('admin/login', { error: null, pageTitle: 'Admin Login' });
  });

  // Handle login
  fastify.post('/login', async (request, reply) => {
    try {
      const { username, password } = request.body;

      const admin = await Admin.findOne({ username, isActive: true });
      
      if (!admin || !(await admin.comparePassword(password))) {
        return reply.view('admin/login', { 
          error: 'Invalid credentials',
          pageTitle: 'Admin Login'
        });
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      // Set session
      request.session.adminId = admin._id.toString();
      request.session.username = admin.username;

      return reply.redirect('/admin/dashboard');
    } catch (error) {
      fastify.log.error('Login error:', error);
      return reply.view('admin/login', { 
        error: 'An error occurred. Please try again.',
        pageTitle: 'Admin Login'
      });
    }
  });

  // Logout
  fastify.get('/logout', async (request, reply) => {
    request.session.destroy();
    return reply.redirect('/admin/login');
  });

  // Admin Dashboard
  fastify.get('/dashboard', { preHandler: checkAuth }, async (request, reply) => {
    try {
      const [
        heroCount,
        techStackCount,
        projectCount,
        experienceCount,
        recentAnalytics
      ] = await Promise.all([
        Hero.countDocuments({ isActive: true }),
        TechStack.countDocuments({ isActive: true }),
        Project.countDocuments({ isActive: true }),
        Experience.countDocuments({ isActive: true }),
        Analytics.find().sort({ timestamp: -1 }).limit(10).lean()
      ]);

      // Get analytics summary
      const pageViews = await Analytics.countDocuments({ eventType: 'page_view' });
      const errors = await Analytics.countDocuments({ eventType: 'error' });

      return reply.view('admin/dashboard', {
        stats: {
          heroCount,
          techStackCount,
          projectCount,
          experienceCount,
          pageViews,
          errors
        },
        recentAnalytics,
        username: request.session.username,
        pageTitle: 'Admin Dashboard'
      });
    } catch (error) {
      fastify.log.error('Dashboard error:', error);
      return reply.code(500).view('admin/error', { 
        error: 'Failed to load dashboard' 
      });
    }
  });

  // Hero Section Management
  fastify.get('/hero', { preHandler: checkAuth }, async (request, reply) => {
    try {
      const hero = await Hero.findOne({ isActive: true });
      return reply.view('admin/hero', { 
        hero: hero || {},
        success: null,
        error: null,
        pageTitle: 'Manage Hero Section'
      });
    } catch (error) {
      fastify.log.error('Hero load error:', error);
      return reply.code(500).view('admin/error', { error: 'Failed to load hero section' });
    }
  });

  fastify.post('/hero', { preHandler: checkAuth }, async (request, reply) => {
    try {
      const { name, title, tagline, techStack } = request.body;
      
      const techStackArray = techStack.split(',').map(t => t.trim());

      await Hero.findOneAndUpdate(
        { isActive: true },
        { name, title, tagline, techStack: techStackArray },
        { upsert: true, new: true }
      );

      const hero = await Hero.findOne({ isActive: true });
      return reply.view('admin/hero', { 
        hero,
        success: 'Hero section updated successfully!',
        error: null,
        pageTitle: 'Manage Hero Section'
      });
    } catch (error) {
      fastify.log.error('Hero update error:', error);
      const hero = await Hero.findOne({ isActive: true });
      return reply.view('admin/hero', { 
        hero: hero || {},
        success: null,
        error: 'Failed to update hero section',
        pageTitle: 'Manage Hero Section'
      });
    }
  });

  // Tech Stack Management
  fastify.get('/tech-stack', { preHandler: checkAuth }, async (request, reply) => {
    try {
      const techStack = await TechStack.find().sort({ order: 1 });
      return reply.view('admin/tech-stack', { 
        techStack,
        success: null,
        error: null,
        pageTitle: 'Manage Tech Stack'
      });
    } catch (error) {
      fastify.log.error('Tech stack load error:', error);
      return reply.code(500).view('admin/error', { error: 'Failed to load tech stack' });
    }
  });

  fastify.post('/tech-stack/add', { preHandler: checkAuth }, async (request, reply) => {
    try {
      const { name, icon, description, order } = request.body;
      
      await TechStack.create({ name, icon, description, order: parseInt(order) || 0 });
      
      return reply.redirect('/admin/tech-stack?success=added');
    } catch (error) {
      fastify.log.error('Tech stack add error:', error);
      return reply.redirect('/admin/tech-stack?error=failed');
    }
  });

  fastify.post('/tech-stack/delete/:id', { preHandler: checkAuth }, async (request, reply) => {
    try {
      await TechStack.findByIdAndDelete(request.params.id);
      return reply.redirect('/admin/tech-stack?success=deleted');
    } catch (error) {
      fastify.log.error('Tech stack delete error:', error);
      return reply.redirect('/admin/tech-stack?error=failed');
    }
  });

  // Projects Management
  fastify.get('/projects', { preHandler: checkAuth }, async (request, reply) => {
    try {
      const projects = await Project.find().sort({ order: 1 });
      return reply.view('admin/projects', { 
        projects,
        success: null,
        error: null,
        pageTitle: 'Manage Projects'
      });
    } catch (error) {
      fastify.log.error('Projects load error:', error);
      return reply.code(500).view('admin/error', { error: 'Failed to load projects' });
    }
  });

  fastify.post('/projects/add', { preHandler: checkAuth }, async (request, reply) => {
    try {
      const { name, description, tags, link, githubUrl, order, featured } = request.body;
      
      const tagsArray = tags.split(',').map(t => t.trim());

      await Project.create({ 
        name, 
        description, 
        tags: tagsArray, 
        link,
        githubUrl,
        order: parseInt(order) || 0,
        featured: featured === 'on'
      });
      
      return reply.redirect('/admin/projects?success=added');
    } catch (error) {
      fastify.log.error('Project add error:', error);
      return reply.redirect('/admin/projects?error=failed');
    }
  });

  fastify.post('/projects/delete/:id', { preHandler: checkAuth }, async (request, reply) => {
    try {
      await Project.findByIdAndDelete(request.params.id);
      return reply.redirect('/admin/projects?success=deleted');
    } catch (error) {
      fastify.log.error('Project delete error:', error);
      return reply.redirect('/admin/projects?error=failed');
    }
  });

  // Analytics/Logs
  fastify.get('/analytics', { preHandler: checkAuth }, async (request, reply) => {
    try {
      const page = parseInt(request.query.page) || 1;
      const limit = 50;
      const skip = (page - 1) * limit;

      const [analytics, total] = await Promise.all([
        Analytics.find().sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
        Analytics.countDocuments()
      ]);

      const totalPages = Math.ceil(total / limit);

      return reply.view('admin/analytics', {
        analytics,
        currentPage: page,
        totalPages,
        pageTitle: 'Analytics & Logs'
      });
    } catch (error) {
      fastify.log.error('Analytics load error:', error);
      return reply.code(500).view('admin/error', { error: 'Failed to load analytics' });
    }
  });

  // Similar routes for Experience, About, Contact...
  // (Follow same pattern as above)
}

module.exports = adminRoutes;

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
const crypto = require('crypto');

// Middleware to check authentication
async function checkAuth(request, reply) {
  if (!request.session.adminId) {
    return reply.redirect('/admin/login');
  }
}

// Ensure a CSRF token exists on the session
function ensureCsrf(request) {
  if (!request.session.csrfToken) {
    request.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  return request.session.csrfToken;
}

// Verify CSRF token from form submissions
function verifyCsrf(request, reply) {
  const token = request.body && request.body._csrf;
  if (!token || token !== request.session.csrfToken) {
    reply.code(403);
    return reply.view('admin/error', { error: 'Invalid CSRF token' });
  }
  return true;
}

async function adminRoutes(fastify, options) {

  // Admin login page
  fastify.get('/login', async (request, reply) => {
    if (request.session.adminId) {
      return reply.redirect('/admin/dashboard');
    }
    // ensure csrf token (useful if you later add login CSRF)
    ensureCsrf(request);
    return reply.view('admin/login', { error: null, pageTitle: 'Admin Login', csrfToken: request.session.csrfToken });
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

      // Redirect with a quick success flag so the dashboard can show a toast
      return reply.redirect('/admin/dashboard?login=1');
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
        pageTitle: 'Admin Dashboard',
        csrfToken: ensureCsrf(request)
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
        pageTitle: 'Manage Hero Section',
        csrfToken: ensureCsrf(request)
      });
    } catch (error) {
      fastify.log.error('Hero load error:', error);
      return reply.code(500).view('admin/error', { error: 'Failed to load hero section' });
    }
  });

  fastify.post('/hero', { preHandler: checkAuth }, async (request, reply) => {
    try {
      // CSRF check
      const csrfOk = verifyCsrf(request, reply);
      if (!csrfOk) return;

      const { name, title, tagline, techStack } = request.body;
      const techStackArray = techStack ? techStack.split(',').map(t => t.trim()) : [];

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
        pageTitle: 'Manage Hero Section',
        csrfToken: ensureCsrf(request)
      });
    } catch (error) {
      fastify.log.error('Hero update error:', error);
      const hero = await Hero.findOne({ isActive: true });
      return reply.view('admin/hero', {
        hero: hero || {},
        success: null,
        error: 'Failed to update hero section',
        pageTitle: 'Manage Hero Section',
        csrfToken: ensureCsrf(request)
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
        pageTitle: 'Manage Tech Stack',
        csrfToken: ensureCsrf(request)
      });
    } catch (error) {
      fastify.log.error('Tech stack load error:', error);
      return reply.code(500).view('admin/error', { error: 'Failed to load tech stack' });
    }
  });

  fastify.post('/tech-stack/add', { preHandler: checkAuth }, async (request, reply) => {
    try {
      // CSRF
      const csrfOk = verifyCsrf(request, reply);
      if (!csrfOk) return;

      const { name, icon, description, order } = request.body;
      // Basic validation
      if (!name) {
        return reply.redirect('/admin/tech-stack?error=validation');
      }

      await TechStack.create({ name, icon, description, order: parseInt(order) || 0 });
      return reply.redirect('/admin/tech-stack?success=added');
    } catch (error) {
      fastify.log.error('Tech stack add error:', error);
      return reply.redirect('/admin/tech-stack?error=failed');
    }
  });

  // Projects Management
  fastify.get('/projects', { preHandler: checkAuth }, async (request, reply) => {
    try {
      // Filtering and search
      const q = request.query.q ? String(request.query.q).trim() : null;
      const tag = request.query.tag ? String(request.query.tag).trim() : null;
      const featured = typeof request.query.featured !== 'undefined' ? request.query.featured === '1' : null;

      const query = {};
      if (q) {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ];
      }
      if (tag) {
        query.tags = tag;
      }
      if (featured !== null) {
        query.featured = featured;
      }

      const projects = await Project.find(query).sort({ order: 1 }).lean();
      const tags = await Project.distinct('tags');

      return reply.view('admin/projects', {
        projects,
        tags,
        success: null,
        error: null,
        pageTitle: 'Manage Projects',
        csrfToken: ensureCsrf(request),
        filters: { q, tag, featured }
      });
    } catch (error) {
      fastify.log.error('Projects load error:', error);
      return reply.code(500).view('admin/error', { error: 'Failed to load projects' });
    }
  });

  fastify.post('/projects/add', { preHandler: checkAuth }, async (request, reply) => {
    try {
      // CSRF
      const csrfOk = verifyCsrf(request, reply);
      if (!csrfOk) return;

      const { name, description, longDescription, tags, link, githubUrl, liveUrl, liveDemo, order, featured } = request.body;
      // Basic validation
      if (!name || !description) {
        return reply.redirect('/admin/projects?error=validation');
      }

      const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

      await Project.create({
        name,
        description,
        longDescription,
        tags: tagsArray,
        link,
        githubUrl,
        liveUrl,
        liveDemo,
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
      // CSRF
      const csrfOk = verifyCsrf(request, reply);
      if (!csrfOk) return;

      await Project.findByIdAndDelete(request.params.id);
      return reply.redirect('/admin/projects?success=deleted');
    } catch (error) {
      fastify.log.error('Project delete error:', error);
      return reply.redirect('/admin/projects?error=failed');
    }
  });

  // Project edit routes
  fastify.get('/projects/edit/:id', { preHandler: checkAuth }, async (request, reply) => {
    try {
      const project = await Project.findById(request.params.id).lean();
      if (!project) return reply.code(404).view('admin/error', { error: 'Project not found' });
      return reply.view('admin/project-edit', { project, pageTitle: `Edit ${project.name}`, csrfToken: ensureCsrf(request) });
    } catch (error) {
      fastify.log.error('Project edit load error:', error);
      return reply.code(500).view('admin/error', { error: 'Failed to load project for editing' });
    }
  });

  fastify.post('/projects/edit/:id', { preHandler: checkAuth }, async (request, reply) => {
    try {
      // CSRF
      const csrfOk = verifyCsrf(request, reply);
      if (!csrfOk) return;

      const { name, description, longDescription, tags, link, githubUrl, liveUrl, liveDemo, order, featured } = request.body;
      const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

      await Project.findByIdAndUpdate(request.params.id, {
        name,
        description,
        longDescription,
        tags: tagsArray,
        link,
        githubUrl,
        liveUrl,
        liveDemo,
        order: parseInt(order) || 0,
        featured: featured === 'on'
      });

      return reply.redirect('/admin/projects?success=updated');
    } catch (error) {
      fastify.log.error('Project update error:', error);
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
  // Experience Management
  fastify.get('/experience', { preHandler: checkAuth }, async (request, reply) => {
    try {
      const experience = await Experience.find().sort({ order: 1 }).lean();
      return reply.view('admin/experience', {
        experience,
        pageTitle: 'Manage Experience',
        csrfToken: ensureCsrf(request)
      });
    } catch (error) {
      fastify.log.error('Experience load error:', error);
      return reply.code(500).view('admin/error', { error: 'Failed to load experience' });
    }
  });

  fastify.post('/experience/add', { preHandler: checkAuth }, async (request, reply) => {
    try {
      // CSRF
      const csrfOk = verifyCsrf(request, reply);
      if (!csrfOk) return;

      const { role, company, period, description, order } = request.body;
      if (!role || !company) return reply.redirect('/admin/experience?error=validation');
      await Experience.create({ role, company, period, description, order: parseInt(order) || 0 });
      return reply.redirect('/admin/experience?success=added');
    } catch (error) {
      fastify.log.error('Experience add error:', error);
      return reply.redirect('/admin/experience?error=failed');
    }
  });

  fastify.post('/experience/delete/:id', { preHandler: checkAuth }, async (request, reply) => {
    try {
      // CSRF
      const csrfOk = verifyCsrf(request, reply);
      if (!csrfOk) return;

      await Experience.findByIdAndDelete(request.params.id);
      return reply.redirect('/admin/experience?success=deleted');
    } catch (error) {
      fastify.log.error('Experience delete error:', error);
      return reply.redirect('/admin/experience?error=failed');
    }
  });

  // Experience edit
  fastify.get('/experience/edit/:id', { preHandler: checkAuth }, async (request, reply) => {
    try {
      const item = await Experience.findById(request.params.id).lean();
      if (!item) return reply.code(404).view('admin/error', { error: 'Experience not found' });
      return reply.view('admin/experience-edit', { experience: item, pageTitle: `Edit ${item.role}`, csrfToken: ensureCsrf(request) });
    } catch (error) {
      fastify.log.error('Experience edit load error:', error);
      return reply.code(500).view('admin/error', { error: 'Failed to load experience for editing' });
    }
  });

  fastify.post('/experience/edit/:id', { preHandler: checkAuth }, async (request, reply) => {
    try {
      const csrfOk = verifyCsrf(request, reply);
      if (!csrfOk) return;

      const { role, company, period, description, order } = request.body;
      await Experience.findByIdAndUpdate(request.params.id, { role, company, period, description, order: parseInt(order) || 0 });
      return reply.redirect('/admin/experience?success=updated');
    } catch (error) {
      fastify.log.error('Experience update error:', error);
      return reply.redirect('/admin/experience?error=failed');
    }
  });
}

module.exports = adminRoutes;

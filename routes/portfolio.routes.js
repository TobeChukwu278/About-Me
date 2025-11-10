const { 
  Hero, 
  TechStack, 
  Project, 
  Experience, 
  About, 
  Contact,
  Analytics 
} = require('../models/Portfolio');

async function portfolioRoutes(fastify, options) {
  
  // Home page
  fastify.get('/', async (request, reply) => {
    try {
      // Log page view
      await Analytics.create({
        eventType: 'page_view',
        page: '/',
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
        referrer: request.headers.referer || 'direct'
      });

      // Fetch all portfolio data
      const [hero, techStack, projects, experience, about, contact] = await Promise.all([
        Hero.findOne({ isActive: true }).lean(),
        TechStack.find({ isActive: true }).sort({ order: 1 }).lean(),
        Project.find({ isActive: true, featured: true }).sort({ order: 1 }).limit(3).lean(),
        Experience.find({ isActive: true }).sort({ order: 1 }).lean(),
        About.findOne({ isActive: true }).lean(),
        Contact.findOne({ isActive: true }).lean()
      ]);

      // Render the portfolio page
      return reply.view('index', {
        hero: hero || {},
        techStack: techStack || [],
        projects: projects || [],
        experience: experience || [],
        about: about || {},
        contact: contact || {},
        pageTitle: 'Backend Developer Portfolio - Tobe Ejiofor'
      });

    } catch (error) {
      fastify.log.error('Error loading portfolio:', error);
      
      // Log error
      await Analytics.create({
        eventType: 'error',
        page: '/',
        metadata: { error: error.message }
      });

      return reply.code(500).view('error', {
        error: 'Failed to load portfolio. Please try again later.',
        isOffline: true
      });
    }
  });

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  });
}

module.exports = portfolioRoutes;
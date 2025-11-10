const { 
  Hero, 
  TechStack, 
  Project, 
  Experience, 
  About, 
  Contact,
  Analytics 
} = require('../models/Portfolio');

async function apiRoutes(fastify, options) {
  
  // Get live system stats
  fastify.get('/stats', async (request, reply) => {
    try {
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      
      // Calculate average response time (simplified)
      const avgLatency = Math.floor(Math.random() * 20) + 15; // Mock latency between 15-35ms
      
      // Get request count
      const requestCount = fastify.getRequestCount();
      const formattedRequests = requestCount > 1000000 
        ? (requestCount / 1000000).toFixed(1) + 'M+'
        : requestCount > 1000 
        ? (requestCount / 1000).toFixed(1) + 'K+'
        : requestCount.toString();

      return {
        uptime: days > 0 ? `${days}d ${hours}h` : `${hours}h`,
        latency: avgLatency,
        requests: formattedRequests
      };
    } catch (error) {
      fastify.log.error('Error fetching stats:', error);
      return reply.code(500).send({ error: 'Failed to fetch stats' });
    }
  });

  // Get all portfolio data (for dynamic loading)
  fastify.get('/portfolio', async (request, reply) => {
    try {
      const [hero, techStack, projects, experience, about, contact] = await Promise.all([
        Hero.findOne({ isActive: true }).lean(),
        TechStack.find({ isActive: true }).sort({ order: 1 }).lean(),
        Project.find({ isActive: true, featured: true }).sort({ order: 1 }).lean(),
        Experience.find({ isActive: true }).sort({ order: 1 }).lean(),
        About.findOne({ isActive: true }).lean(),
        Contact.findOne({ isActive: true }).lean()
      ]);

      return {
        hero: hero || {},
        techStack: techStack || [],
        projects: projects || [],
        experience: experience || [],
        about: about || {},
        contact: contact || {}
      };
    } catch (error) {
      fastify.log.error('Error fetching portfolio data:', error);
      return reply.code(500).send({ error: 'Failed to fetch portfolio data' });
    }
  });

  // AI Chat endpoint (static responses based on portfolio data)
  fastify.post('/chat', async (request, reply) => {
    try {
      const { message } = request.body;

      if (!message) {
        return reply.code(400).send({ error: 'Message is required' });
      }

      const lowerMessage = message.toLowerCase();
      let response = "I'm here to help! Ask me about Tobe's tech stack, projects, or experience.";

      // Fetch data for context-aware responses
      const [hero, techStack, projects, experience] = await Promise.all([
        Hero.findOne({ isActive: true }).lean(),
        TechStack.find({ isActive: true }).lean(),
        Project.find({ isActive: true }).lean(),
        Experience.find({ isActive: true }).lean()
      ]);

      if (lowerMessage.includes('tech stack') || lowerMessage.includes('technologies') || lowerMessage.includes('what do you use')) {
        const stackNames = techStack.map(t => t.name).join(', ');
        response = `Tobe specializes in ${stackNames}. This tech stack enables building scalable, high-performance backend systems with excellent developer experience.`;
      } else if (lowerMessage.includes('project')) {
        const projectList = projects.slice(0, 3).map(p => `• ${p.name}: ${p.description}`).join('\n');
        response = `Here are some featured projects:\n\n${projectList}`;
      } else if (lowerMessage.includes('experience') || lowerMessage.includes('work')) {
        const currentRole = experience[0];
        response = `Tobe is currently ${currentRole.role} at ${currentRole.company}. With experience across multiple companies, Tobe has worked on scalable backend systems, API development, and microservices architecture.`;
      } else if (lowerMessage.includes('fastify')) {
        response = "Fastify is Tobe's framework of choice—it's one of the fastest Node.js frameworks, offering excellent performance, low overhead, and a great plugin ecosystem. Perfect for building efficient APIs!";
      } else if (lowerMessage.includes('mongodb')) {
        response = "MongoDB is used for flexible, document-based data storage. Its schema flexibility and powerful aggregation framework make it ideal for modern backend applications.";
      } else if (lowerMessage.includes('contact') || lowerMessage.includes('reach')) {
        const contact = await Contact.findOne({ isActive: true }).lean();
        response = `You can reach Tobe at ${contact.email}. Also available on GitHub and LinkedIn—check the contact section for direct links!`;
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        response = `Hello! I'm an AI assistant here to help you learn about ${hero.name}'s portfolio. Feel free to ask about tech stack, projects, experience, or anything else!`;
      }

      // Log chat interaction
      await Analytics.create({
        eventType: 'api_call',
        page: '/api/chat',
        metadata: { message, response }
      });

      return { response };
    } catch (error) {
      fastify.log.error('Error in chat endpoint:', error);
      return reply.code(500).send({ 
        error: 'Failed to process chat message',
        response: "Sorry, I'm having trouble right now. Please try again later."
      });
    }
  });

  // Analytics endpoint for tracking
  fastify.post('/track', async (request, reply) => {
    try {
      const { eventType, page, metadata } = request.body;

      await Analytics.create({
        eventType,
        page,
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
        metadata
      });

      return { success: true };
    } catch (error) {
      fastify.log.error('Error tracking event:', error);
      return reply.code(500).send({ error: 'Failed to track event' });
    }
  });
}

module.exports = apiRoutes;
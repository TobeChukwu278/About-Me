const fastify = require('fastify')({ logger: true });
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Register plugins
fastify.register(require('@fastify/view'), {
  engine: {
    ejs: require('ejs')
  },
  root: path.join(__dirname, 'views'),
  layout: 'layouts/main',
  options: {
    useHtmlMinifier: false
  }
});

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/'
});

// Parse application/x-www-form-urlencoded bodies (HTML forms)
fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/session'), {
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
  cookie: { secure: false } // Set to true in production with HTTPS
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    fastify.log.info('MongoDB connected successfully');
  } catch (error) {
    fastify.log.error('MongoDB connection error:', error);
    console.error(error);
    process.exit(1);
  }
};

// Import models
require('./models/Portfolio');
require('./models/Admin');

// Import routes
fastify.register(require('./routes/portfolio.routes.js'), { prefix: '/' });
fastify.register(require('./routes/admin.routes.js'), { prefix: '/admin' });
fastify.register(require('./routes/api.routes.js'), { prefix: '/api' });

// Track server start time for uptime calculation
const serverStartTime = Date.now();
fastify.decorate('serverStartTime', serverStartTime);

// Request counter for stats
let requestCounter = 0;
fastify.addHook('onRequest', (request, reply, done) => {
  requestCounter++;
  done();
});
fastify.decorate('getRequestCount', () => requestCounter);

// Start server
const start = async () => {
  try {
    await connectDB();
    await fastify.listen({
      port: process.env.PORT || 3000,
      host: '0.0.0.0'
    });
    fastify.log.info(`Server running on port ${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

module.exports = fastify;
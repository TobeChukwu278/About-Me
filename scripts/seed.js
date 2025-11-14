require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Admin = require('../models/Admin');
const {
  Hero,
  TechStack,
  Project,
  Experience,
  About,
  Contact
} = require('../models/Portfolio');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Admin.deleteMany({});
    await Hero.deleteMany({});
    await TechStack.deleteMany({});
    await Project.deleteMany({});
    await Experience.deleteMany({});
    await About.deleteMany({});
    await Contact.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    await Admin.create({
      username: 'admin',
      email: 'admin@portfolio.com',
      password: 'admin123', // Will be hashed automatically
      role: 'admin'
    });
    console.log('Admin user created (username: admin, password: admin123)');

    // Seed Hero
    await Hero.create({
      name: 'TOBE EJIOFOR',
      title: 'Web Dev',
      tagline: 'Building scalable APIs and robust backend systems with precision and performance',
      techStack: ['Fastify', 'Node.js', 'MongoDB', 'Express'],
      isActive: true
    });
    console.log('Hero section seeded');

    // Seed Tech Stack
    await TechStack.insertMany([
      {
        name: 'Node.js',
        icon: '⬢',
        description: 'Runtime for scalable server applications',
        order: 1,
        isActive: true
      },
      {
        name: 'Fastify',
        icon: '⚡',
        description: 'Fast, lightweight server framework',
        order: 2,
        isActive: true
      },
      {
        name: 'MongoDB',
        icon: '🍃',
        description: 'Flexible, document-based database',
        order: 3,
        isActive: true
      },
      {
        name: 'Redis',
        icon: '◆',
        description: 'In-memory data structure store',
        order: 4,
        isActive: true
      },
      {
        name: 'Docker',
        icon: '🐋',
        description: 'Containerization for consistent deployments',
        order: 5,
        isActive: true
      }
    ]);
    console.log('Tech stack seeded');

    // Seed Projects
    await Project.insertMany([
      {
        name: 'FastAPI Gateway',
        description: 'High-performance API gateway handling 10K req/s with intelligent routing and rate limiting',
        longDescription: 'A production-ready API gateway built with Fastify that demonstrates advanced routing patterns, middleware composition, and performance optimization. Features include request rate limiting, automatic request throttling, and real-time metrics collection. The gateway seamlessly routes requests to multiple backend services while maintaining sub-millisecond latency.',
        tags: ['Fastify', 'Redis', 'Docker'],
        githubUrl: 'https://github.com',
        liveUrl: 'https://api-gateway-demo.example.com',
        liveDemo: 'https://stackblitz.com/github/fastify/fastify/tree/master/examples',
        order: 1,
        featured: true,
        isActive: true
      },
      {
        name: 'MongoDB Analytics Pipeline',
        description: 'Real-time data aggregation system processing millions of documents',
        longDescription: 'A sophisticated data processing system that aggregates and transforms large datasets in real-time. Built with MongoDB aggregation pipelines and Node.js, this system processes millions of documents daily while maintaining sub-second response times. Includes advanced filtering, sorting, and caching mechanisms for optimal performance.',
        tags: ['MongoDB', 'Node.js', 'Redis'],
        githubUrl: 'https://github.com',
        liveUrl: 'https://analytics-pipeline.example.com',
        liveDemo: 'https://stackblitz.com/github/mongodb-developer/nodejs-async-await',
        order: 2,
        featured: true,
        isActive: true
      },
      {
        name: 'Microservices Orchestrator',
        description: 'Container orchestration platform for managing distributed services',
        longDescription: 'An advanced microservices management platform that simplifies deployment, scaling, and monitoring of containerized applications. Built with Docker and Kubernetes principles, this orchestrator provides an intuitive interface for managing complex service topologies, health checks, and automated scaling policies.',
        tags: ['Docker', 'Kubernetes', 'Node.js'],
        githubUrl: 'https://github.com',
        liveUrl: 'https://orchestrator-demo.example.com',
        liveDemo: 'https://stackblitz.com/github/docker/awesome-compose',
        order: 3,
        featured: true,
        isActive: true
      }
    ]);
    console.log('Projects seeded');

    // Seed Experience
    await Experience.insertMany([
      // {
      //   role: 'Web development intern',
      //   company: 'Nnewi Tech Faculty',
      //   period: '2023 - Present',
      //   description: 'Leading backend development for enterprise applications',
      //   order: 1,
      //   isActive: true
      // },
      // {
      //   role: 'Backend Developer',
      //   company: 'StartupXYZ',
      //   period: '2021 - 2023',
      //   description: 'Built scalable APIs and microservices',
      //   order: 2,
      //   isActive: true
      // },
      {
        role: 'Web Development Intern',
        company: 'Nnewi Tech',
        period: 'May 2025 - September 2025',
        description: 'Developed backend features and REST APIs',
        order: 1,
        isActive: true
      }
    ]);
    console.log('Experience seeded');

    // Seed About
    await About.create({
      text: "Passionate about crafting efficient, maintainable backend systems. I believe clean architecture and performance optimization aren't mutually exclusive—they're complementary goals that define excellent engineering.",
      isActive: true
    });
    console.log('About section seeded');

    // Seed Contact
    await Contact.create({
      email: 'ejiofotobechi@gmail.com',
      github: 'https://github.com/TobeChukwu278',
      linkedin: 'https://www.linkedin.com/in/tobechukwu-ejiofor-493925316?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      resume: '/public/resume.pdf',
      isActive: true
    });
    console.log('Contact section seeded');

    console.log('\n✅ Database seeded successfully!');
    console.log('You can now login with:');
    console.log('Username: admin');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
const mongoose = require('mongoose');

// Hero Section Schema
const heroSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'TOBE EJIOFOR' },
  title: { type: String, required: true, default: 'Backend Engineer' },
  tagline: { type: String, required: true },
  techStack: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Tech Stack Schema
const techStackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Projects Schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  tags: [{ type: String }],
  link: { type: String },
  githubUrl: { type: String },
  order: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Experience Schema
const experienceSchema = new mongoose.Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  period: { type: String, required: true },
  description: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// About Section Schema
const aboutSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Contact Schema
const contactSchema = new mongoose.Schema({
  email: { type: String, required: true },
  github: { type: String },
  linkedin: { type: String },
  resume: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Analytics/Logs Schema
const analyticsSchema = new mongoose.Schema({
  eventType: { 
    type: String, 
    enum: ['page_view', 'section_view', 'link_click', 'error', 'api_call'],
    required: true 
  },
  page: { type: String },
  userAgent: { type: String },
  ipAddress: { type: String },
  referrer: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Create indexes for better query performance
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });

// Export models
module.exports = {
  Hero: mongoose.model('Hero', heroSchema),
  TechStack: mongoose.model('TechStack', techStackSchema),
  Project: mongoose.model('Project', projectSchema),
  Experience: mongoose.model('Experience', experienceSchema),
  About: mongoose.model('About', aboutSchema),
  Contact: mongoose.model('Contact', contactSchema),
  Analytics: mongoose.model('Analytics', analyticsSchema)
};

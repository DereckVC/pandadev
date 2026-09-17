const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    shortDesc: { type: String, default: '' },
    longDesc: { type: String, default: '' },
    // Campos extendidos para la ventana flotante detallada
    vision: { type: String, default: '' },
    goals: { type: String, default: '' },
    inspiration: { type: String, default: '' },
    team: { type: String, default: 'DereckVC (Panda158)' },
    architecture: { type: String, default: 'Web / Full-Stack' },
    category: { type: String, default: 'Web' },
    tags: { type: [String], default: [] },
    bannerUrl: { type: String, default: '' },
    images: { type: [String], default: [] },
    demoUrl: { type: String, default: '' },
    repoUrl: { type: String, default: '' },
    githubId: { type: Number },
    showGithubBtn: { type: Boolean, default: true },
    showDemoBtn: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
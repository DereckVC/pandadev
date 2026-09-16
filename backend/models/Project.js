const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  githubId: { type: Number, index: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true, trim: true },
  category: { type: String, enum: ['Web', 'Roblox', 'GameDev', 'Tools', 'Tools/Bots', 'Minecraft/Web', 'Otros'], default: 'Otros' },
  shortDesc: { type: String, required: true, trim: true },
  shortDescEn: { type: String, default: '', trim: true },
  longDesc: { type: String, default: '' },
  longDescEn: { type: String, default: '', trim: true },
  goals: { type: String, default: '', trim: true },
  inspiration: { type: String, default: '', trim: true },
  team: { type: String, default: 'En solitario (Panda158)', trim: true },
  bannerUrl: { type: String, default: '' },
  screenshots: { type: [String], default: [] },
  images: { type: [String], default: [] },
  repoUrl: { type: String, default: '' },
  demoUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  tags: { type: [String], default: [] },
  showGithubBtn: { type: Boolean, default: true },
  githubVisible: { type: Boolean, default: true },
  showDemoBtn: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);

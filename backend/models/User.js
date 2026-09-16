const mongoose = require('mongoose');

const CANONICAL_ADMIN_EMAILS = Object.freeze([
  'minombrexd158@gmail.com',
  'i2611843@continental.edu.pe',
]);
const ADMIN_GITHUB_USERNAME = 'DereckVC';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  name: { type: String, trim: true, default: '' },
  githubUsername: { type: String, trim: true, default: '' },
  avatar: { type: String, default: '' },
  discordTag: { type: String, trim: true, default: '' },
  provider: { type: String, enum: ['local', 'google', 'discord', 'github'], default: 'local' },
  role: { type: String, enum: ['guest', 'user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String, default: null, select: false },
  otpExpires: { type: Date, default: null, select: false },
  verificationToken: { type: String, select: false },
  verificationExpires: { type: Date, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: null, select: false },
}, { timestamps: true });

userSchema.pre('validate', function assignAdminRole() {
  if (CANONICAL_ADMIN_EMAILS.includes(this.email?.toLowerCase()) || this.githubUsername === ADMIN_GITHUB_USERNAME) this.role = 'admin';
});

module.exports = mongoose.model('User', userSchema);

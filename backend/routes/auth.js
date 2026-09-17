const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { sendPasswordResetEmail, sendOTPEmail } = require('../utils/mailer');

const router = express.Router();

// Obtiene la URL de frontend limpia sin diagonales al final
const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL || 'https://www.pandadev.me';
  return url.replace(/\/+$/, '');
};

// Determina si estamos en producción para exigir HTTPS y SameSite None
const isProduction = process.env.NODE_ENV === 'production' || (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost'));

const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const CANONICAL_ADMIN_EMAILS = Object.freeze(['minombrexd158@gmail.com', 'i2611843@continental.edu.pe']);
const CANONICAL_ADMIN_GITHUB = 'DereckVC';
const jwtSecret = () => process.env.JWT_SECRET || 'pandadev-development-secret';

const publicUser = (user) => ({
  id: user.id || user._id,
  email: user.email,
  name: user.name,
  avatar: user.avatar,
  provider: user.provider,
  githubUsername: user.githubUsername,
  discordTag: user.discordTag || '',
  role: user.role,
  isVerified: user.isVerified,
  twoFactorEnabled: user.twoFactorEnabled
});

const createToken = (user) => jwt.sign({ id: user.id || user._id, role: user.role }, jwtSecret(), { expiresIn: '7d' });

// Envía tanto la cookie como el parámetro en URL para compatibilidad total con Brave/Safari
const sendSession = (res, user, redirect = false) => {
  const token = createToken(user);
  res.cookie('token', token, cookieOptions);
  if (redirect) {
    return res.redirect(`${getFrontendUrl()}/?token=${token}&login=success`);
  }
  return res.json({ token, user: publicUser(user) });
};

const createOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const trustedDeviceSecret = () => process.env.JWT_SECRET || 'pandadev-development-secret';

const createTrustedDevice = (email, deviceId) => {
  const expires = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const payload = `${email}:${deviceId}:${expires}`;
  const signature = crypto.createHmac('sha256', trustedDeviceSecret()).update(payload).digest('hex');
  return `${expires}.${signature}`;
};

const isTrustedDevice = (email, deviceId, token) => {
  if (!deviceId || !token) return false;
  const [expires, signature] = token.split('.');
  if (!expires || Number(expires) < Date.now()) return false;
  const expected = crypto.createHmac('sha256', trustedDeviceSecret()).update(`${email}:${deviceId}:${expires}`).digest('hex');
  return signature?.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

router.post('/register', async (req, res) => {
  try {
    const rawEmail = req.body.email || req.body.mail;
    const { password, name = '' } = req.body;
    const email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

    if (!email || !password || !passwordRegex.test(password)) {
      return res.status(400).json({ message: 'La contraseña debe tener 8 caracteres, una mayúscula, una minúscula y un número.' });
    }
    if (CANONICAL_ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ message: 'Este correo está reservado exclusivamente para inicio de sesión federado oficial (OAuth).' });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const otpCode = createOtp();
    const user = await User.create({
      email,
      name,
      password: await bcrypt.hash(password, 12),
      provider: 'local',
      isVerified: false,
      otpCode,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });
    await sendOTPEmail(user.email, otpCode, 'verificación de registro');
    return res.status(201).json({ success: true, requireOTP: true, email: user.email });
  } catch (error) {
    return res.status(400).json({ message: 'Unable to create account' });
  }
});

router.post('/login', async (req, res) => {
  const rawEmail = req.body.email || req.body.mail;
  const email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

  const user = await User.findOne({ email }).select('+password +twoFactorSecret');
  if (!user || !user.password || !(await bcrypt.compare(req.body.password || '', user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (user.provider === 'local' && !user.isVerified) {
    return res.status(403).json({ message: 'Verifica tu correo antes de iniciar sesión.' });
  }
  if (user.twoFactorEnabled) {
    return res.json({ success: true, require2FA: true, userId: user._id, email: user.email });
  }
  const deviceId = req.body.deviceId || req.header('x-device-id');
  const trustedToken = req.cookies?.trusted_device;
  if (isTrustedDevice(user.email, deviceId, trustedToken)) {
    return sendSession(res, user);
  }
  const otpCode = createOtp();
  user.otpCode = otpCode;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendOTPEmail(user.email, otpCode, 'inicio de sesión');
  return res.json({ success: true, requireLoginOTP: true, email: user.email });
});

router.post('/verify-otp', async (req, res) => {
  const rawEmail = req.body.email || req.body.mail;
  const email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

  const user = await User.findOne({ email }).select('+password +otpCode +otpExpires');
  if (!user || !user.otpCode || user.otpCode !== String(req.body.otp || '').trim() || !user.otpExpires || user.otpExpires <= new Date()) {
    return res.status(400).json({ message: 'El código es incorrecto o ha expirado.' });
  }
  user.isVerified = true;
  user.otpCode = null;
  user.otpExpires = null;
  await user.save();
  if (req.body.rememberDevice && req.body.deviceId) {
    res.cookie('trusted_device', createTrustedDevice(user.email, req.body.deviceId), { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
  }
  return sendSession(res, user);
});

router.post('/verify-login-otp', async (req, res) => {
  const rawEmail = req.body.email || req.body.mail;
  const email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

  const user = await User.findOne({ email }).select('+password +otpCode +otpExpires');
  if (!user || !user.otpCode || user.otpCode !== String(req.body.otp || '').trim() || !user.otpExpires || user.otpExpires <= new Date()) {
    return res.status(400).json({ message: 'El código es incorrecto o ha expirado.' });
  }
  user.otpCode = null;
  user.otpExpires = null;
  await user.save();
  if (req.body.rememberDevice && req.body.deviceId) {
    res.cookie('trusted_device', createTrustedDevice(user.email, req.body.deviceId), { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
  }
  return sendSession(res, user);
});

router.post('/resend-otp', async (req, res) => {
  const rawEmail = req.body.email || req.body.mail;
  const email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

  const user = await User.findOne({ email }).select('+otpCode +otpExpires');
  if (!user) return res.status(404).json({ message: 'No encontramos una cuenta con ese correo.' });
  const otpCode = createOtp();
  user.otpCode = otpCode;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendOTPEmail(user.email, otpCode);
  return res.json({ success: true, message: 'Código reenviado.' });
});

router.post('/verify-2fa-login', async (req, res) => {
  const user = await User.findById(req.body.userId).select('+twoFactorSecret');
  const valid = user && user.twoFactorEnabled && user.twoFactorSecret && speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: String(req.body.token || '').trim(),
    window: 1
  });
  if (!valid) return res.status(401).json({ message: 'El código de autenticación no es válido.' });
  if (req.body.rememberDevice && req.body.deviceId) {
    res.cookie('trusted_device', createTrustedDevice(user.email, req.body.deviceId), { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
  }
  return sendSession(res, user);
});

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

router.put('/me', requireAuth, async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body.name === 'string') updates.name = req.body.name.trim().slice(0, 80);
    if (typeof req.body.discordTag === 'string') updates.discordTag = req.body.discordTag.trim().slice(0, 80);
    const user = await User.findByIdAndUpdate(req.user.id || req.user._id, updates, { returnDocument: 'after', runValidators: true });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return res.status(400).json({ message: 'Unable to update profile' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions);
  return res.json({ message: 'Logged out' });
});

router.post('/2fa/generate', requireAuth, async (req, res) => {
  const secret = speakeasy.generateSecret({ name: `PandaDev (${req.user.email})` });
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
  return res.json({ qrCodeUrl, base32: secret.base32 });
});

router.post('/2fa/enable', requireAuth, async (req, res) => {
  const { token, base32 } = req.body;
  if (!base32 || !speakeasy.totp.verify({ secret: base32, encoding: 'base32', token: String(token || '').trim(), window: 1 })) {
    return res.status(400).json({ message: 'El código de Google Authenticator no es válido.' });
  }
  req.user.twoFactorSecret = base32;
  req.user.twoFactorEnabled = true;
  await req.user.save();
  return res.json({ user: publicUser(req.user) });
});

router.post('/2fa/disable', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id || req.user._id).select('+twoFactorSecret');
  if (!user.twoFactorEnabled || !user.twoFactorSecret || !speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: String(req.body.token || '').trim(), window: 1 })) {
    return res.status(400).json({ message: 'El código de Google Authenticator no es válido.' });
  }
  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;
  await user.save();
  return res.json({ user: publicUser(user) });
});

router.post('/forgot-password', async (req, res) => {
  const rawEmail = req.body.email || req.body.mail;
  const email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) return res.json({ message: 'Si el correo existe, recibirás un enlace de recuperación.' });
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();
  await sendPasswordResetEmail(user.email, token);
  return res.json({ message: 'Si el correo existe, recibirás un enlace de recuperación.' });
});

router.post('/reset-password/:token', async (req, res) => {
  if (!req.body.password || !passwordRegex.test(req.body.password)) {
    return res.status(400).json({ message: 'La contraseña debe tener 8 caracteres, una mayúscula, una minúscula y un número.' });
  }
  const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: new Date() } }).select('+password +resetPasswordToken +resetPasswordExpires');
  if (!user) return res.status(400).json({ message: 'Reset token is invalid or expired' });
  user.password = await bcrypt.hash(req.body.password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.provider = 'local';
  await user.save();
  return res.json({ message: 'Password updated' });
});

const upsertOAuthUser = async (profile, provider) => {
  const email = (profile.emails?.[0]?.value || profile._json?.email)?.toLowerCase();
  if (!email) throw new Error('OAuth provider did not return an email');
  const githubUsername = provider === 'github' ? (profile.username || profile._json?.login || '') : '';
  const verifiedGoogleEmail = provider === 'google' && profile.emails?.some((entry) => entry.verified === true && CANONICAL_ADMIN_EMAILS.includes(entry.value?.toLowerCase()));
  const isAdmin = provider === 'github'
    ? githubUsername.toLowerCase() === CANONICAL_ADMIN_GITHUB.toLowerCase()
    : Boolean(verifiedGoogleEmail);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.provider = provider;
    existing.isVerified = true;
    existing.avatar = profile.photos?.[0]?.value || profile._json?.avatar_url || existing.avatar;
    if (githubUsername) existing.githubUsername = githubUsername;
    if (!existing.name) existing.name = profile.displayName || githubUsername;
    if (isAdmin) existing.role = 'admin';
    await existing.save();
    return existing;
  }
  return User.create({
    email,
    name: profile.displayName || githubUsername,
    githubUsername,
    avatar: profile.photos?.[0]?.value || profile._json?.avatar_url || '',
    provider,
    role: isAdmin ? 'admin' : 'user',
    isVerified: true
  });
};

const updateProfile = async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : (typeof req.body.username === 'string' ? req.body.username.trim() : req.user.name);
  if (!/^[\p{L}0-9_.-]{2,32}$/u.test(name)) return res.status(400).json({ message: 'Username must be 2-32 characters' });
  const discordTag = typeof req.body.discordTag === 'string' ? req.body.discordTag.trim().slice(0, 64) : req.user.discordTag || '';
  if (req.body.currentPassword || req.body.newPassword) {
    if (req.user.provider !== 'local') return res.status(400).json({ message: 'Las cuentas OAuth gestionan la contraseña con su proveedor.' });
    if (!req.body.currentPassword || !req.body.newPassword || req.body.newPassword.length < 8) {
      return res.status(400).json({ message: 'La contraseña actual y una nueva contraseña de 8 caracteres son obligatorias.' });
    }
    const userWithPassword = await User.findById(req.user.id || req.user._id).select('+password');
    if (!userWithPassword.password || !(await bcrypt.compare(req.body.currentPassword, userWithPassword.password))) {
      return res.status(401).json({ message: 'La contraseña actual no es correcta.' });
    }
    userWithPassword.password = await bcrypt.hash(req.body.newPassword, 12);
    await userWithPassword.save();
  }
  req.user.name = name;
  req.user.discordTag = discordTag;
  await req.user.save();
  return res.json({ user: publicUser(req.user) });
};

router.put('/profile', requireAuth, updateProfile);
router.patch('/profile', requireAuth, updateProfile);

router.put('/profile/avatar', requireAuth, async (req, res) => {
  if (typeof req.body.avatar !== 'string' || req.body.avatar.length > 2_000_000) {
    return res.status(400).json({ message: 'La imagen no es válida o supera el límite permitido.' });
  }
  req.user.avatar = req.body.avatar.trim();
  await req.user.save();
  return res.json({ user: publicUser(req.user) });
});

router.put('/change-password', requireAuth, async (req, res) => {
  if (req.user.provider !== 'local') return res.status(400).json({ message: 'Las cuentas OAuth gestionan la contraseña con su proveedor.' });
  if (!req.body.currentPassword || !passwordRegex.test(req.body.newPassword || '')) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener 8 caracteres, una mayúscula, una minúscula y un número.' });
  }
  const user = await User.findById(req.user.id || req.user._id).select('+password');
  if (!user.password || !(await bcrypt.compare(req.body.currentPassword, user.password))) {
    return res.status(401).json({ message: 'La contraseña actual no es correcta.' });
  }
  user.password = await bcrypt.hash(req.body.newPassword, 12);
  await user.save();
  return res.json({ user: publicUser(user) });
});

// Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new (require('passport-google-oauth20').Strategy)({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://pandadev-api.onrender.com/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      done(null, await upsertOAuthUser(profile, 'google'));
    } catch (error) {
      done(error);
    }
  }));

  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
  router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false, failureRedirect: `${getFrontendUrl()}/?auth_error=google` }, (err, user) => {
      if (err || !user) return res.redirect(`${getFrontendUrl()}/?auth_error=google`);
      return sendSession(res, user, true);
    })(req, res, next);
  });
}

// Discord OAuth
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  passport.use(new (require('passport-discord').Strategy)({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL || 'https://pandadev-api.onrender.com/api/auth/discord/callback',
    scope: ['identify', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      done(null, await upsertOAuthUser(profile, 'discord'));
    } catch (error) {
      done(error);
    }
  }));

  router.get('/discord', passport.authenticate('discord', { session: false }));
  router.get('/discord/callback', (req, res, next) => {
    passport.authenticate('discord', { session: false, failureRedirect: `${getFrontendUrl()}/?auth_error=discord` }, (err, user) => {
      if (err || !user) return res.redirect(`${getFrontendUrl()}/?auth_error=discord`);
      return sendSession(res, user, true);
    })(req, res, next);
  });
}

// GitHub OAuth
const githubConfigured = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
if (githubConfigured) {
  const GitHubStrategy = require('passport-github2').Strategy;
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'https://pandadev-api.onrender.com/api/auth/github/callback',
    scope: ['user:email', 'read:user'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      done(null, await upsertOAuthUser(profile, 'github'));
    } catch (error) {
      done(error);
    }
  }));

  router.get('/github', passport.authenticate('github', { scope: ['user:email', 'read:user'], session: false }));
  router.get('/github/callback', (req, res, next) => {
    passport.authenticate('github', { session: false, failureRedirect: `${getFrontendUrl()}/?auth_error=github` }, (err, user) => {
      if (err || !user) return res.redirect(`${getFrontendUrl()}/?auth_error=github`);
      return sendSession(res, user, true);
    })(req, res, next);
  });
} else {
  router.get('/github', async (req, res) => {
    if (process.env.NODE_ENV === 'production') return res.status(503).json({ message: 'GitHub OAuth is not configured' });
    try {
      const user = await User.findOneAndUpdate(
        { email: 'minombrexd158@gmail.com' },
        { $set: { role: 'admin', provider: 'github', githubUsername: 'DereckVC' }, $setOnInsert: { name: 'DereckVC', avatar: '' } },
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
      );
      return sendSession(res, user, true);
    } catch (error) {
      return res.status(503).json({ message: 'Demo authentication is unavailable' });
    }
  });

  router.get('/github/callback', (req, res) => {
    if (process.env.NODE_ENV === 'production') return res.status(503).json({ message: 'GitHub OAuth is not configured' });
    return res.redirect(`${getFrontendUrl()}/?login=success`);
  });
}

module.exports = router;
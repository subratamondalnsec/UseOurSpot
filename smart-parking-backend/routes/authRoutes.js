// Auth Routes — /api/auth
const express = require('express');
const router = express.Router();
// const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', (req, res) => res.json({ message: 'register endpoint — controller coming soon' }));

// POST /api/auth/login
router.post('/login', (req, res) => res.json({ message: 'login endpoint — controller coming soon' }));

// GET /api/auth/me  (protected)
router.get('/me', (req, res) => res.json({ message: 'getMe endpoint — controller coming soon' }));

module.exports = router;

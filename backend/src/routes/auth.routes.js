const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, changePassword } = require('../controllers/auth.controller');

const router = express.Router();

// Rate limiter: max 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const { protect } = require('../middlewares/auth.middleware');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.put('/change-password', protect, changePassword);

module.exports = router;

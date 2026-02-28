const crypto    = require('crypto');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const User      = require('../models/User');

// ─── Helper: generate & set JWT cookie ──────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );

  res
    .status(statusCode)
    .cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json({
      success: true,
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
};

// ─── @route  POST /api/auth/register ────────────────────────
// ─── @access Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'driver',
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('registerUser error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  POST /api/auth/login ───────────────────────────
// ─── @access Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user — explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('loginUser error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  POST /api/auth/logout ──────────────────────────
// ─── @access Private
exports.logoutUser = (req, res) => {
  res
    .cookie('token', '', {
      httpOnly: true,
      expires: new Date(0), // immediately expire
    })
    .json({ success: true, message: 'Logged out' });
};

// ─── @route  POST /api/auth/forgot-password ─────────────────
// ─── @access Public
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'No user with that email' });
//     }

//     // Generate raw token & hash it for storage
//     const rawToken   = crypto.randomBytes(20).toString('hex');
//     const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

//     user.resetPasswordToken  = hashedToken;
//     user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
//     await user.save({ validateBeforeSave: false });

//     // Build reset link (raw token — not the hash)
//     const resetLink = `http://localhost:3000/reset-password/${rawToken}`;

//     // Send reset link via shared sendEmail utility
//     await sendEmail({
//       to:      user.email,
//       subject: 'Password Reset Request',
//       html: `
//         <h2>Password Reset</h2>
//         <p>You requested a password reset. Click the link below (valid for 15 minutes):</p>
//         <a href="${resetLink}">${resetLink}</a>
//         <p>If you did not request this, ignore this email.</p>
//       `,
//     });

//     res.json({ success: true, message: 'Email sent' });
//   } catch (error) {
//     console.error('forgotPassword error:', error.message);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // ─── @route  PUT /api/auth/reset-password/:token ────────────
// // ─── @access Public
// exports.resetPassword = async (req, res) => {
//   try {
//     const { token }       = req.params;
//     const { newPassword } = req.body;

//     // Hash the incoming raw token to match stored hash
//     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//     const user = await User.findOne({
//       resetPasswordToken:  hashedToken,
//       resetPasswordExpire: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ success: false, message: 'Invalid or expired token' });
//     }

//     // Hash new password & clear reset fields
//     const salt           = await bcrypt.genSalt(10);
//     user.password        = await bcrypt.hash(newPassword, salt);
//     user.resetPasswordToken  = undefined;
//     user.resetPasswordExpire = undefined;
//     await user.save();

//     res.json({ success: true, message: 'Password reset successful' });
//   } catch (error) {
//     console.error('resetPassword error:', error.message);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

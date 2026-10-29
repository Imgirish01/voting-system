const { verifyToken } = require('../utils/jwt');
const db = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // 2. Check Authorization Bearer header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to access this official portal feature.',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
    }

    // Verify user exists in database and account is not suspended
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account record not found.',
      });
    }

    const user = rows[0];
    if (user.account_status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by the Election Commission. Please contact the Chief Election Officer.',
      });
    }

    // Exclude password_hash from req.user
    const { password_hash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;


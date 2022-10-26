const express = require('express');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Email or username is required'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Password is required'),
  handleValidationErrors
];

// Log in
router.post(
    '/',
    validateLogin,
    async (req, res, next) => {
      const { credential, password } = req.body;
  
      const user = await User.login({ credential, password });
  
      if (!user) {
        // const err = new Error('Invalid credentials');
        // err.status = 401;
        // err.title = 'Invalid credentials';
        // err.errors = ['The provided credentials were invalid.'];
        return res.status(401).json({message: 'Invalid credentials', statusCode: 401})
      }
  
      await setTokenCookie(res, user);
  
      return res.json({
        user
      });
    }
  );

  // Log out
router.delete(
  '/',
  (_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
  }
);

// Restore session user AKA get current user
router.get(
  '/',
  restoreUser,
  (req, res) => {
    const { user } = req;
    if (user) {
      return res.json(user.toSafeObject());
    } else return res.json({});
  }
);


module.exports = router;
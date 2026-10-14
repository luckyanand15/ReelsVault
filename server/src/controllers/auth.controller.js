const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

const checkEmail = asyncHandler(async (req, res) => {
  const exists = await authService.checkEmailExists(req.body.email);
  res.status(200).json({ success: true, data: { exists } });
});

const login = asyncHandler(async (req, res) => {
  try {
    const user = await authService.login(req.body);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    if (err instanceof authService.UserNotFoundError) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }
    if (err instanceof authService.InvalidCredentialsError) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
    throw err;
  }
});

module.exports = {
  checkEmail,
  login,
};

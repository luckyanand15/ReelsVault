const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');

const createUser = asyncHandler(async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: 'Email is already in use' });
    }
    throw err;
  }
});

module.exports = {
  createUser,
};

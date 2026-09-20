const User = require('../models/User');
const generateId = require('../utils/generateId');

const createUser = async ({ firstName, lastName, email }) => {
  const id = await generateId('user', 'USER');

  return User.create({ _id: id, firstName, lastName, email });
};

module.exports = {
  createUser,
};

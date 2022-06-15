const mongoose = require('mongoose');
const { ForbiddenError } = require('../errors');

const User = mongoose.model('User');
const IS_DEBUG = false;
const requireRole = (allowedRoles) => async (req, res, next) => {
  if (IS_DEBUG) return next();
  const { id: _id } = req.payload;
  const allowed = await User.exists({ _id, roles: { $in: allowedRoles } });

  return next(allowed ? null : new ForbiddenError(`Action allowed only for ${allowedRoles}`));
};
module.exports = requireRole;

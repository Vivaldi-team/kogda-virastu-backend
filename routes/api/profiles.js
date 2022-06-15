const router = require('express').Router();
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

const User = mongoose.model('User');
const { NotFoundError } = require('../../errors');
const auth = require('../auth');

// Preload user profile on routes with ':username'
router.param('username', asyncHandler(async (req, res, next, username) => {
  const user = await User.findOne({ username });
  if (!user) {
    // TODO: Use orFail instead
    return next(new NotFoundError(`Пользователь ${username} не найден`));
  }
  req.profile = user;
  return next();
}));

router.get('/:username', auth.optional, (req, res, next) => {
  // #swagger.tags = ["profiles"]
  // #swagger.summary = 'Получить профиль пользователя'
  /* #swagger.responses[200] = {
    schema: {
      user: [{$ref:"#/definitions/UserProfile"}],
    }
  } */
  if (req.payload) {
    User.findById(req.payload.id).then((user) => {
      if (!user) { return res.json({ profile: req.profile.toProfileJSONFor(false) }); }

      return res.json({ profile: req.profile.toProfileJSONFor(user) });
    });
  } else {
    return res.json({ profile: req.profile.toProfileJSONFor(false) });
  }
});

router.post('/:username/follow', auth.required, (req, res, next) => {
  // #swagger.tags = ["profiles"]
  // #swagger.summary = 'Подписаться на пользователя'
  /* #swagger.responses[200] = {
    schema: {
      user: [{$ref:"#/definitions/UserProfile"}],
    }
  } */
  const profileId = req.profile._id;

  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401); }

    return user.follow(profileId).then(() => res.json({ profile: req.profile.toProfileJSONFor(user) }));
  }).catch(next);
});

router.delete('/:username/follow', auth.required, (req, res, next) => {
  // #swagger.tags = ["profiles"]
  // #swagger.summary = 'Отписаться от пользователя'
  /* #swagger.responses[200] = {
    schema: {
      user: [{$ref:"#/definitions/UserProfile"}],
    }
  } */
  const profileId = req.profile._id;

  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401); }

    return user.unfollow(profileId).then(() => res.json({ profile: req.profile.toProfileJSONFor(user) }));
  }).catch(next);
});

module.exports = router;

const router = require('express').Router();
const mongoose = require('mongoose');

const Article = mongoose.model('Article');
const Comment = mongoose.model('Comment');
const User = mongoose.model('User');

const asyncHandler = require('express-async-handler');
const { requireRole } = require('../../middlewares');
const auth = require('../auth');
const { NotFoundError } = require('../../errors');

// Preload article objects on routes with ':article'
router.param('article', (req, res, next, slug) => {
  Article.findOne({ slug })
    .populate('author')
    .then((article) => {
      if (!article) {
        return res.sendStatus(404);
      }

      req.article = article;

      return next();
    })
    .catch(next);
});

router.param('comment', (req, res, next, id) => {
  Comment.findById(id)
    .then((comment) => {
      if (!comment) {
        return res.sendStatus(404);
      }

      req.comment = comment;

      return next();
    })
    .catch(next);
});

const setArticleState = async (state, req, res, next) => {
  const { article } = req;
  await article.setState(state);
  return res.send(article.toJSONFor());
};

const setCommentState = async (state, req, res, next) => {
  let { comment } = req;
  comment = await comment.setState(state);
  comment = await comment.populate('author', {
    name: 1, email: 1, bio: 1, image: 1, username: 1,
  });
  return res.send({ comment });
};

router.post('/articles/:article/publish', asyncHandler(async (req, res, next) => {
  /*
    #swagger.summary = 'Опубликовать статью'
    #swagger.tags = ["admin"]
    #swagger.parameters['article'] = {
          in: 'path',
          type: 'string',
          required: true,
          description: 'slug публикации' }
  */
  await setArticleState('published', req, res, next);
}));

router.post('/articles/:article/decline', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  /*
     #swagger.summary = 'Отклонить статью'
     #swagger.tags = ["admin"]
     #swagger.parameters['article'] = {
            in: 'path',
            type: 'string',
            required: true,
            description: 'slug публикации' }
  */
  await setArticleState('declined', req, res, next);
}));

router.post('/articles/:article/hold', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  /*
     #swagger.summary = 'Вернуть статью на модерацию'
     #swagger.tags = ["admin"]
     #swagger.parameters['article'] = {
            in: 'path',
            type: 'string',
            required: true,
            description: 'slug публикации' }
  */
  await setArticleState('pending', req, res, next);
}));

router.post('/articles/:article/comments/:comment/publish', asyncHandler(async (req, res, next) => {
  // #swagger.tags = ["admin"]
  // #swagger.summary = 'Опубликовать комментарий'
  /* #swagger.parameters['article'] = {
            in: 'path',
            type: 'string',
            required: true,
            description: 'slug публикации' }
  */
  /* #swagger.parameters['comment'] = {
            in: 'path',
            type: 'string',
            required: true,
            description: 'id комментария' }
  */
  await setCommentState('published', req, res, next);
}));

router.post('/articles/:article/comments/:comment/decline', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  /*
    #swagger.tags = ["admin"]
    #swagger.summary = 'Отклонить комментарий'
    #swagger.parameters['article'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'slug публикации' }
    #swagger.parameters['comment'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'id комментария' }
  */
  await setCommentState('declined', req, res, next);
}));

router.post('/articles/:article/comments/:comment/hold', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  /*
    #swagger.summary = 'Отправить комментарий на модерацию'
    #swagger.tags = ["admin"]
    #swagger.parameters['article'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'slug публикации' }
    #swagger.parameters['comment'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'id комментария' }
  */
  await setCommentState('pending', req, res, next);
}));

// TODO: Add pagination here
router.get('/articles/state/:state', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  // #swagger.tags = ["admin"]
  // #swagger.summary = 'Получить список публикаций (с указанным состоянием)'
  /* #swagger.parameters['state'] = {
      in: 'path',
      required: true,
      schema: {
          '$ref': '#/definitions/PublishState'
      },
      description: 'состояние публикации' }
  */
  // TODO: Move to controller
  const { state } = req.params;
  // use toJSON hook instead
  const articles = (await Article.find({ state }).populate('author')).map((a) => a.toJSONFor());
  // TODO: Pagination
  return res.send({ articles, articlesCount: articles.length });
}));

// TODO: Add pagination here
router.get('/articles/:article/comments/state/:state', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  // #swagger.tags = ["admin"]
  // #swagger.summary = 'Получить список комментариев статьи (с указанным состоянием)'
  /* #swagger.parameters['state'] = {
            in: 'path',
            required: true,
            schema: {
                '$ref': '#/definitions/PublishState'
            },
            description: 'состояние комментария' }
  */
  // TODO: Move to controller
  const { article, state } = req.params;
  const comments = await Article.query({ slug: article }).populate('comments').find({ state });
  // TODO: Pagination
  return res.send({ comments, commentsCount: comments.length });
}));

router.get('/users', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  // TODO: Add pagination here
  // #swagger.tags = ["admin"]
  // #swagger.summary = 'Получить список пользователей'

  const users = await User.find({}, {
    username: 1, roles: 1, nickname: 1, email: 1, bio: 1, image: 1,
  });
  return res.json({ users, usersCount: users.length });
}));

router.get('/users/:username', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  /* #swagger.tags = ["admin"]
     #swagger.summary = 'Получить информацию о пользователе'
     #swagger.parameters['username'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'имя пользователя' }
  */
  const { username } = req.params;
  const user = await User.findOne({ username }, {
    username: 1, roles: 1, nickname: 1, email: 1, bio: 1, image: 1,
  }).orFail(new NotFoundError(`Пользователь с username ${username} не найден`));
  return res.json({ user });
}));

router.patch('/users/:username/roles', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  /* #swagger.tags = ["admin"]
     #swagger.summary = 'Обновить роли пользователя'
     #swagger.parameters['username'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'имя пользователя' }
    #swagger.requestBody = {
      required: true,
      schema: {
        type: "object",
        properties: {
          roles: { $ref:"#/definitions/UserRoles" },
        }
      }
    }
  */
  const { roles } = req.body;
  const { username } = req.params;
  const user = await User.findOne({ username }, {
    username: 1, roles: 1, nickname: 1, email: 1, bio: 1, image: 1,
  }).orFail(new NotFoundError(`Пользователь с username ${username} не найден`));
  await user.setRoles(roles);
  return res.json({ user });
}));

module.exports = router;

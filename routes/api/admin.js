const router = require('express').Router();
const mongoose = require('mongoose');

const Article = mongoose.model('Article');
const Comment = mongoose.model('Comment');

const asyncHandler = require('express-async-handler');
const { requireRole } = require('../../middlewares');
const auth = require('../auth');

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
  const { comment } = req;
  await comment.setState(state);
  return res.send(comment.toJSONFor());
};

router.post('/articles/:article/publish', asyncHandler(async (req, res, next) => {
  await setArticleState('published', req, res, next);
}));

router.post('/articles/:article/decline', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  await setArticleState('declined', req, res, next);
}));

router.post('/articles/:article/hold', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  await setArticleState('pending', req, res, next);
}));

router.post('/articles/:article/comments/:comment/publish', asyncHandler(async (req, res, next) => {
  await setCommentState('published', req, res, next);
}));

router.post('/articles/:article/comments/:comment/decline', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  await setCommentState('declined', req, res, next);
}));

router.post('/articles/:article/comments/:comment/hold', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  await setCommentState('pending', req, res, next);
}));

// TODO: Add pagination here
router.get('/articles/state/:value', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  // TODO: Move to controller
  const { value } = req.params;
  // use toJSON hook instead
  const articles = (await Article.find({ state: value }).populate('author')).map((a) => a.toJSONFor());
  // TODO: Pagination
  return res.send({ articles, articlesCount: articles.length });
}));

// TODO: Add pagination here
router.get('/articles/:article/comments/state/:value', auth.required, requireRole('admin'), asyncHandler(async (req, res, next) => {
  // TODO: Move to controller
  const { article, state } = req.params;
  const comments = await Article.query({ slug: article }).populate('comments').find({ state });
  // TODO: Pagination
  return res.send({ comments, commentsCount: comments.length });
}));

module.exports = router;

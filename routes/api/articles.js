const router = require('express').Router();
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

const Article = mongoose.model('Article');
const Comment = mongoose.model('Comment');
const User = mongoose.model('User');
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

router.get('/', auth.optional, (req, res, next) => {
  // #swagger.summary = 'Получить список статей'
  // #swagger.tags = ["article"]
  /* #swagger.responses[200] = {
    schema: {
        articles: [{$ref:"#/definitions/ArticleData"}],
        articlesCount: 1
    }
  } */
  let query = {};
  let limit = 20;
  let offset = 0;

  if (typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = req.query.offset;
  }

  if (typeof req.query.tag !== 'undefined') {
    query.tagList = { $in: [req.query.tag] };
  }

  Promise.all([
    req.query.author ? User.findOne({ username: req.query.author }) : null,
    req.query.favorited
      ? User.findOne({ username: req.query.favorited })
      : null,
  ])
    .then(async (results) => {
      const author = results[0];
      const favoriter = results[1];

      if (author) {
        query.author = author._id;
      }

      if (favoriter) {
        query._id = { $in: favoriter.favorites };
      } else if (req.query.favorited) {
        query._id = { $in: [] };
      }
      // Filter own or published articles
      const publishedOrOwnFilter = { $or: [{ state: 'published' }, { author: req?.payload?.id }] };
      query = { $and: [query, publishedOrOwnFilter] };

      return Promise.all([
        Article.find(query)
          .limit(Number(limit))
          .skip(Number(offset))
          .sort({ createdAt: 'desc' })
          .populate('author'),
        Article.count(query),
        req.payload ? User.findById(req.payload.id) : null,
      // eslint-disable-next-line no-shadow
      ]).then((results) => {
        const articles = results[0];
        const articlesCount = results[1];
        const user = results[2];

        return res.json({
          articles: articles.map((article) => article.toJSONFor(user)),
          articlesCount,
        });
      });
    })
    .catch(next);
});

router.get('/feed', auth.required, (req, res, next) => {
  // #swagger.summary = 'Получить фид публикаций'
  // #swagger.tags = ["article"]
  /* #swagger.responses[200] = {
    schema: {
        articles: [{$ref:"#/definitions/ArticleData"}],
        articlesCount: 1
    }
  } */
  let limit = 20;
  let offset = 0;

  if (typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = req.query.offset;
  }

  User.findById(req.payload.id).then(async (user) => {
    if (!user) {
      return res.sendStatus(401);
    }
    const publishedOrOwnFilter = { state: 'published' };
    const query = { $or: [{ author: { $in: user.followingUsers } }, { tagList: { $in: user.followingTags } }] };

    const _articles = await Article.find({ $and: [query, publishedOrOwnFilter] })
      .limit(Number(limit))
      .skip(Number(offset))
      .populate('author');

    return Promise.all([
      _articles,
      _articles.length,
    ])
      .then((results) => {
        const articles = results[0];
        const articlesCount = results[1];

        return res.json({
          articles: articles.map((article) => article.toJSONFor(user)),
          articlesCount,
        });
      })
      .catch(next);
  });
});

router.get('/top', asyncHandler(async (req, res, next) => {
  // #swagger.tags = ["article"]
  // #swagger.summary = 'Получить список самых популярных публикаций'
  /* #swagger.responses[200] = {
    schema: {
        articles: [{$ref:"#/definitions/ArticleDataPopulated"}],
        articlesCount: 1
    }
  } */
  const TOP_COUNT_LIMIT = 20;
  const articles = await Article.find({
    state: 'published',
  }).sort({ favoritesCount: -1 }).limit(TOP_COUNT_LIMIT).populate('author', {
    username: 1, bio: 1, nickname: 1, image: 1,
  });
  return res.json({ articles, articlesCount: articles.length });
}));

router.post('/', auth.required, (req, res, next) => {
  // #swagger.summary = 'Cоздать новую публикацию'
  // #swagger.tags = ["article"]
  /* #swagger.requestBody = {
      required: true,
      schema: {
        type: "object",
        properties: {
          article: {$ref:"#/definitions/ArticleData"},
        }
      }
    } */
  /* #swagger.responses[200] = {
    schema: {
        article: {$ref:"#/definitions/Article"},
    }
  } */
  User.findById(req.payload.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }

      const article = new Article(req.body.article);

      article.author = user;

      return article.save().then(() => {
        console.log(article.author);
        return res.json({ article: article.toJSONFor(user) });
      });
    })
    .catch(next);
});

// return a article
router.get('/:article', auth.optional, (req, res, next) => {
  // #swagger.summary = 'Получить публикацию с указанным Id'
  // #swagger.tags = ["article"]
  /* #swagger.responses[200] = {
    schema: {
        article: {$ref:"#/definitions/Article"},
    }
  } */
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.article.populate('author'),
  ])
    .then((results) => {
      const user = results[0];

      return res.json({ article: req.article.toJSONFor(user) });
    })
    .catch(next);
});

// update article
router.put('/:article', auth.required, (req, res, next) => {
  // #swagger.summary = 'Обновить публикацию'
  // #swagger.tags = ["article"]
  /* #swagger.requestBody = {
      required: true,
      schema: {
        type: "object",
        properties: {
          article: {$ref:"#/definitions/ArticleData"},
        }
      }
  } */
  /* #swagger.responses[200] = {
    schema: {
        article: {$ref:"#/definitions/Article"},
    }
  } */
  User.findById(req.payload.id).then((user) => {
    if (req.article.author._id.toString() === req.payload.id.toString()) {
      if (typeof req.body.article.title !== 'undefined') {
        req.article.title = req.body.article.title;
      }

      if (typeof req.body.article.description !== 'undefined') {
        req.article.description = req.body.article.description;
      }

      if (typeof req.body.article.body !== 'undefined') {
        req.article.body = req.body.article.body;
      }

      if (typeof req.body.article.tagList !== 'undefined') {
        req.article.tagList = req.body.article.tagList;
      }

      if (typeof req.body.article.link !== 'undefined') {
        req.article.link = req.body.article.link;
      }

      req.article
        .save()
        .then((article) => res.json({ article: article.toJSONFor(user) }))
        .catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

// delete article
router.delete('/:article', auth.required, (req, res, next) => {
  // #swagger.tags = ["article"]
  // #swagger.summary = 'Удалить публикацию с указанным Id'

  User.findById(req.payload.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }

      if (req.article.author._id.toString() === req.payload.id.toString()) {
        return req.article.remove().then(() => res.sendStatus(204));
      }
      return res.sendStatus(403);
    })
    .catch(next);
});

// Favorite an article
router.post('/:article/favorite', auth.required, (req, res, next) => {
  // #swagger.tags = ["article"]
  // #swagger.summary = 'Добавить публикацию в избранное'
  /* #swagger.responses[200] = {
    schema: {
        article: {$ref:"#/definitions/Article"},
    }
  } */
  const articleId = req.article._id;

  User.findById(req.payload.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.favorite(articleId).then(() => req.article.updateFavoriteCount().then((article) => res.json({ article: article.toJSONFor(user) })));
    })
    .catch(next);
});

// Unfavorite an article
router.delete('/:article/favorite', auth.required, (req, res, next) => {
  // #swagger.tags = ["article"]
  // #swagger.summary = 'Удалить публикацию из избранного'
  /* #swagger.responses[200] = {
    schema: {
        article: {$ref:"#/definitions/Article"},
    }
  } */
  const articleId = req.article._id;

  User.findById(req.payload.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.unfavorite(articleId).then(() => req.article.updateFavoriteCount().then((article) => res.json({ article: article.toJSONFor(user) })));
    })
    .catch(next);
});

// return an article's comments
router.get('/:article/comments', auth.optional, async (req, res, next) => {
  // #swagger.tags = ["article"]
  // #swagger.summary = 'Получить комментарии статьи'
  /* #swagger.responses[200] = {
    schema: {
        comments: [{$ref:"#/definitions/Comment"}],
    }
  } */
  const user = req?.payload?.id ? await User.findById(req.payload.id) : null;
  const comments = await Comment.find({
    $and: [
      { article: req.article._id },
      { $or: [{ state: 'published' }, { author: user?._id }] }],
  }, null, {
    sort: {
      createdAt: 'desc',
    },
  }).populate('author');
  return res.json({
    comments: comments.map((comment) => comment.toJSONFor(user)),
  });
});

// create a new comment
router.post('/:article/comments', auth.required, (req, res, next) => {
  // #swagger.tags = ["article"]
  // #swagger.summary = 'Добавить новый комментарий к статье'
  /* #swagger.requestBody = {
      required: true,
      schema: {
        type: "object",
        properties: {
          comment: {$ref:"#/definitions/Comment"},
        }
      }
  } */
  User.findById(req.payload.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }

      const comment = new Comment(req.body.comment);
      comment.article = req.article;
      comment.author = user;

      return comment.save().then(() => {
        req.article.comments.push(comment);

        return req.article.save().then((article) => {
          res.json({ comment: comment.toJSONFor(user) });
        });
      });
    })
    .catch(next);
});

router.delete(
  '/:article/comments/:comment',
  auth.required,
  (req, res, next) => {
    // #swagger.tags = ["article"]
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
    if (req.comment.author.toString() === req.payload.id.toString()) {
      req.article.comments.remove(req.comment._id);
      req.article
        .save()
        .then(Comment.find({ _id: req.comment._id }).remove().exec())
        .then(() => {
          res.sendStatus(204);
        });
    } else {
      res.sendStatus(403);
    }
  },
);
module.exports = router;

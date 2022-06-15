const { NotFoundError } = require('../errors');

module.exports = (req, res, next) => {
  const { path } = req;
  next(new NotFoundError(`Entrypoint handler for  ${path} doesn't exist`));
};

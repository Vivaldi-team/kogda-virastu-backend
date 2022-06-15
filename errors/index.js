/* eslint-disable max-classes-per-file */
class HttpError extends Error {
  constructor(message, name, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = name || 'HttpError';
  }
}

class NotFoundError extends HttpError {
  constructor(message, name = 'NotFoundError', code = 404) {
    super(message, name, code);
  }
}

class ForbiddenError extends HttpError {
  constructor(message, name = 'ForbiddenError', code = 403) {
    super(message, name, code);
  }
}

class BadRequestError extends HttpError {
  constructor(message, name = 'BadRequestError', code = 400) {
    super(message, name, code);
  }
}

class UnauthorizedError extends HttpError {
  constructor(message, name = 'UnauthorizedError', code = 401) {
    super(message, name, code);
  }
}

class ConflictError extends HttpError {
  constructor(message, name = 'ConflictError', code = 409) {
    super(message, name, code);
  }
}

module.exports = {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  UnauthorizedError,
  ConflictError,
};

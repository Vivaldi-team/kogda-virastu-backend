const jwt = require('express-jwt');
const { secret } = require('../config');

function getTokenFromHeader(req) {
  let { authorization } = req.headers;
  if (!authorization || !authorization.trim().startsWith("Bearer")) {
    return null;
  }
  authorization = authorization.trim();
  const [type, value] = authorization.split(' ');
  return value;
}

const auth = {
  required: jwt({
    secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader,
  }),
  optional: jwt({
    secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader,
  }),
};

module.exports = auth;

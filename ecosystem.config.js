// eslint-disable-next-line
require('dotenv-flow').load('.env.deploy');
const {
  SSH_USERNAME,
  SSH_HOST,
  REF,
  REPO,
  DEST_PATH,
  SECRET
} = process.env;

console.log({
    SSH_USERNAME,
    SSH_HOST,
    REF,
    REPO,
    DEST_PATH,
    SECRET
  })

module.exports = {
  apps: [
    {
      script: 'node app.js',
    },
  ],

  deploy: {
    production: {
      user: SSH_USERNAME,
      host: SSH_HOST,
      ref: REF,
      repo: REPO,
      path: DEST_PATH,
      'pre-deploy': `echo SECRET=${SECRET} > .env`,
      'post-deploy': 'docker compose up --build -d'
    },
  },
};

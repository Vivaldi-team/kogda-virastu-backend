// eslint-disable-next-line

const {
  SSH_USERNAME,
  SSH_HOST,
  REF,
  REPO,
  DEST_PATH,
} = process.env;

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
      'pre-deploy-local': `sh ./scripts/deployEnvs.sh ${DEST_PATH} ${SSH_USERNAME} ${SSH_HOST}`,
      'post-deploy': 'docker compose up --build -d',
    },
  },
};

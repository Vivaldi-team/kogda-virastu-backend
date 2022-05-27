FROM mhart/alpine-node:16
WORKDIR /app
RUN npm i -g pnpm pm2
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["pm2-runtime","./ecosystem.config.js"]

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Use npm ci with lockfile else fall back to installing prod deps
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --omit=dev; fi

COPY . .

EXPOSE 3002

CMD ["node", "index.js"]
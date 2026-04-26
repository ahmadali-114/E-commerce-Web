FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Use npm ci when a lockfile is present, otherwise fall back to npm install without dev deps
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --omit=dev; fi

COPY . .

EXPOSE 3004

CMD ["node", "index.js"]
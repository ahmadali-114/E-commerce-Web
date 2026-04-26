FROM node:18-alpine
WORKDIR /app
COPY package*.json ./

# Use npm ci when available, otherwise install production deps
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --omit=dev; fi

COPY . .

EXPOSE 3003

CMD ["node", "index.js"]
FROM node:18-alpine
RUN addgroup -g 1001 meditrack && adduser -u 1001 -G meditrack -S meditrack
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN chown -R meditrack:meditrack /app
USER meditrack
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/health',(r)=>{process.exit(r.statusCode===200?0:1)})"
CMD ["node", "server.js"]

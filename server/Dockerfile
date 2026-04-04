# Use Node 24 matching the environment
FROM node:24-alpine

WORKDIR /app

# Copy package config and install dependencies
COPY package*.json ./
RUN npm install

# Copy backend files
COPY index.js ./

# Expose backend REST/WebSocket port
EXPOSE 3001

# Start backend server
CMD ["node", "index.js"]

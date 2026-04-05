# Use Node 24 matching the environment
FROM node:24-alpine

WORKDIR /app

# Copy package config and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Build the Vite application for production
RUN npm run build

# Install a simple static server to serve the frontend
RUN npm install -g serve

# Expose the default serve port
EXPOSE 3000

# Start the frontend server serving the bundled app
CMD ["serve", "-s", "dist", "-l", "3000"]

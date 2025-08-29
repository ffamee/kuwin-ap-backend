# Base stage
FROM node:22-alpine3.20 AS base
# Set the working directory
WORKDIR /app
# Copy package.json and package-lock.json
COPY package*.json ./

# Development stage
FROM base AS development
# Install dependencies
RUN npm install
# Copy the rest of the application code
COPY . .
# Expose the port the app runs on
EXPOSE 3001
# Start the application in development mode
CMD ["npm", "run", "start:dev"]

# Production stage
FROM base AS production
# Install production dependencies
RUN npm install
# Copy the rest of the application code
COPY . .
# Build the application
RUN npm run build
# Expose the port the app runs on
EXPOSE 3001
# Start the application in production mode
CMD ["npm", "run", "start:prod"]

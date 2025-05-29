# Use official Node.js base image

FROM node:20-alpine

# Set working directory inside container

WORKDIR /app


# Copy package.json and install dependencies
COPY  package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build the TypeScript code
RUN npm run build


# Expose the backend port
EXPOSE 5000


# Start the app from dist
CMD ["npm", "start"]
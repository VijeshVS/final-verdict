# Use official Node.js image
FROM node:23-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Install g++ compiler
RUN apt-get update && apt-get install -y g++

# Copy rest of the application
COPY . .

# Create temp/exec_temp folder
RUN mkdir -p temp/exec_temp

# Expose port (optional, based on your app)
EXPOSE 3000

# Start the app
CMD [ "npm", "run", "server" ]

# Use Node.js as base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the correct port
EXPOSE 3002

# Start the application
CMD ["node", "src/index.js"]

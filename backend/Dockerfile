# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent

# Copy app files
COPY . ./

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Expose the port the app will run on
EXPOSE 4000

# Start the application
CMD ["npm", "run", "dev"]
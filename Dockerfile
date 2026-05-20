# Stage 1: Build
FROM node:20-slim AS builder

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Bundle app source
COPY . .

# Build the app
RUN npm run build

# Stage 2: Production
FROM node:20-slim AS production

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production

# Generate Prisma Client for the production environment
RUN npx prisma generate

# Copy the built app from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose port (adjust if your Nest app runs on a different port)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]

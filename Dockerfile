FROM node:24.22.1 AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
COPY . .

# Build the TypeScript files
RUN npm run build

FROM node:24.22.1-slim
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app /usr/src/app

# Expose port 8080
EXPOSE 8080

# Start the app
CMD npm run start

# Stage 1: Build the application
FROM node:lts-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files to the container
COPY ["package.json", "package-lock.json*", "./"]

# Install dependencies
RUN npm install 
# Copy the rest of the application files
COPY . .

# Build the TypeScript application
RUN npm run build

# Stage 2: Run the application
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /usr/dist/app

# Copy only necessary files from the previous stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json .
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Expose the port on which your application listens
EXPOSE 3000

# Run the application
USER node

CMD ["node", "./dist/app.js"]

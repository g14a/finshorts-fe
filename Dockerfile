# Step 1: Build the React app
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code to the working directory
COPY . .

# Build the React app for production
RUN npm run build

# Step 2: Serve the app using a lightweight Node.js server
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the build output from the previous stage to the working directory
COPY --from=build /app/build /app/build

# Install a simple Node.js server
RUN npm install serve@13.0.2

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to run the server and serve the build directory
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
# Step 1: Build the React app
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Step 2: Use NGINX to serve the built React app
FROM nginx:latest
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for NGINX
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript compilation)
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript to JavaScript
RUN npm run build

# Create the uploads directory if it doesn't exist
RUN mkdir -p uploads

# Expose port
EXPOSE 3001

# Start the application with compiled JavaScript
CMD ["npm", "start"]
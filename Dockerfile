# Use the official Node.js 14 image as a parent image
FROM node:14-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json files from your project folder into the /app directory in the container
COPY package*.json ./

# Install any dependencies
RUN npm install

# Copy the rest of your project's files into the /app directory in the container
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define the command to run your app using CMD which sets your runtime
CMD ["node", "index.js"]
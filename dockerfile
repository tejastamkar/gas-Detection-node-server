# Use the official lightweight Node.js 16 image.
# https://hub.docker.com/_/node

FROM node:20-buster
# Set the working directory to the root of your project directory

# Copy all files from the project root to the working directory
COPY . /app
WORKDIR /app
# Install production dependencies.
RUN npm install -g npm

RUN npm install 

# Copy local code to the container image.
# COPY . /app

# Bind the port that the app will run on
EXPOSE 3003
# EXPOSE 8765

# Run the web service on container startup.
CMD [ "node", "index.js" ]

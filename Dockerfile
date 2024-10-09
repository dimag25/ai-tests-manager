# Use ubuntu base image
FROM ubuntu:22.04

# Set environment variables for non-interactive installs
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies, Node.js (Node16 version), and Python3
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    python3 \
    python3-pip \
    && curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install pytest and allure-pytest & playwright for Python
RUN pip3 install --no-cache-dir pytest allure-pytest pytest-playwright
RUN playwright install

# Install OpenJDK (Java) for the backend
RUN apt-get update && \
    apt-get install -y openjdk-11-jdk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
    
# Set JAVA_HOME environment variable for backend
ENV JAVA_HOME="/usr/lib/jvm/java-11-openjdk-amd64"
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Install allure cmd globally via npm
RUN npm install -g allure-commandline --save-dev

# Install Playwright browsers and dependencies
RUN apt-get update && apt-get install -y \
    libnss3 libatk-bridge2.0-0 libcups2 libxkbcommon-x11-0 libgbm-dev \
    && npx playwright install --with-deps

# Copy backend dependencies and install them
COPY ./backend/package*.json /app/backend/
WORKDIR /app/backend
RUN npm install

# Copy frontend dependencies and install them
COPY ./frontend/package*.json /app/frontend/
WORKDIR /app/frontend
RUN npm install

# Move back to the /app directory
WORKDIR /app

# Copy the rest of the application files
COPY . .

# Set the environment variable for the port (Cloud Run uses PORT=8080)
ENV PORT=8080

# Expose both ports (5000 for backend, 8080 for frontend)
EXPOSE 5000
EXPOSE 8080

# Run the 'dev' script to concurrently run frontend and backend
CMD ["npm", "run", "dev"]

#!/bin/bash

# Make this script executable
chmod +x build.sh

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building the application..."
npm run build

echo "Build completed successfully!"
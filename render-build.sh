#!/bin/bash
# Make sure this script has execute permissions
chmod +x render-build.sh

# Install dependencies
npm ci

# Build the application
npm run build

# Output success message
echo "Build completed successfully!"
#!/bin/bash
# Make sure this script has execute permissions
chmod +x render-start.sh

# Start the application using the preview command
# This uses vite preview which serves the built files
npm run preview

# If the above fails, try using a simple static server as fallback
if [ $? -ne 0 ]; then
  echo "Falling back to serve static files..."
  # Install serve if not already installed
  npx serve -s dist
fi
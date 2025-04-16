#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js and npm before running this script."
    exit 1
fi

# Check if Next.js package is installed
if ! npm list -g | grep -q next; then
    echo "Next.js is not installed. Installing..."
    npm install -g next@13.5.5
fi

# Start the Next.js server
npm start

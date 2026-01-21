#!/bin/bash

echo "========================================"
echo "Starting TheRing Game Hub Server"
echo "========================================"
echo ""

# Change to the script's directory (project root)
cd "$(dirname "$0")"

echo "Current directory: $(pwd)"
echo ""

# Check if index.html exists in current directory
if [ ! -f "index.html" ]; then
    echo "ERROR: index.html not found in current directory!"
    echo "Please make sure you're running this from the project root."
    echo "Expected location: $(pwd)/index.html"
    exit 1
fi

echo "✓ Found index.html in project root"
echo ""

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js or use Python server instead"
    exit 1
fi

echo "Starting Node.js server..."
echo "Server will run at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

node server.js

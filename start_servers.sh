#!/bin/bash

# Drawing Tracker - Start Both Servers
# This script starts both the Node.js main app and Python AI backend

echo "🎨 Starting Drawing Tracker with AI Assistant..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $NODE_PID $PYTHON_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Check if Python dependencies are installed
echo "🔍 Checking Python dependencies..."
python3 -c "import flask, google.generativeai" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Python dependencies missing. Installing..."
    pip3 install -r requirements.txt
fi

# Start Python AI Backend
echo "🤖 Starting AI Backend (Python Flask)..."
python3 ai_backend.py &
PYTHON_PID=$!

# Wait a moment for Python server to start
sleep 5

# Check if Python server started successfully
if ! kill -0 $PYTHON_PID 2>/dev/null; then
    echo "❌ Python AI Backend failed to start"
    exit 1
fi

# Start Node.js Main App
echo "🚀 Starting Main App (Node.js Express)..."
npm start &
NODE_PID=$!

# Wait for both processes
echo "✅ Both servers are running!"
echo "📱 Main App: http://localhost:3000"
echo "🤖 AI Backend: http://localhost:5000"
echo "💡 Click the 🤖 button in the bottom-right to open AI Assistant"
echo "Press Ctrl+C to stop both servers"

wait

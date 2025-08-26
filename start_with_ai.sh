#!/bin/bash

# Drawing Tracker with AI - Startup Script
echo "🎨 Starting Drawing Tracker with AI Assistant..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $NODE_PID $PYTHON_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f ai_backend.py 2>/dev/null
pkill -f "node server.js" 2>/dev/null
sleep 2

# Start Python AI Backend
echo "🤖 Starting AI Backend (Python Flask)..."
python3 ai_backend.py &
PYTHON_PID=$!

# Wait for Python server to start
echo "⏳ Waiting for AI backend to start..."
for i in {1..10}; do
    if curl -s http://localhost:5000/api/ai/health > /dev/null 2>&1; then
        echo "✅ AI Backend is ready!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ AI Backend failed to start after 10 seconds"
        kill $PYTHON_PID 2>/dev/null
        exit 1
    fi
    sleep 1
done

# Start Node.js Main App
echo "🚀 Starting Main App (Node.js Express)..."
npm start &
NODE_PID=$!

# Wait for Node.js server to start
echo "⏳ Waiting for main app to start..."
for i in {1..10}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Main App is ready!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Main App failed to start after 10 seconds"
        cleanup
        exit 1
    fi
    sleep 1
done

echo ""
echo "🎉 Both servers are running successfully!"
echo "📱 Main App: http://localhost:3000"
echo "🤖 AI Backend: http://localhost:5000"
echo "🧪 AI Test Page: http://localhost:3000/test-ai.html"
echo ""
echo "💡 Click the 🤖 button in the bottom-right to open AI Assistant"
echo "🔧 If AI doesn't work, check the test page first"
echo ""
echo "Press Ctrl+C to stop both servers"

wait

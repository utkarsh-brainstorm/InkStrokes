#!/bin/bash

# InkStrokes Easy Clone Script
# This script helps users clone the repository without authentication issues

echo "🎨 InkStrokes - Easy Clone Script"
echo "=================================="

# Function to clone with different methods
clone_repo() {
    local method=$1
    local repo_url="https://github.com/utkarsh-brainstorm/InkStrokes.git"
    local target_dir="InkStrokes"
    
    echo "Attempting to clone using method: $method"
    
    case $method in
        "normal")
            git clone "$repo_url" "$target_dir"
            ;;
        "no-prompt")
            GIT_TERMINAL_PROMPT=0 git clone "$repo_url" "$target_dir"
            ;;
        "curl")
            echo "Downloading as ZIP file..."
            curl -L "https://github.com/utkarsh-brainstorm/InkStrokes/archive/refs/heads/main.zip" -o InkStrokes.zip
            unzip -q InkStrokes.zip
            mv InkStrokes-main InkStrokes
            rm InkStrokes.zip
            ;;
    esac
}

# Check if directory already exists
if [ -d "InkStrokes" ]; then
    echo "❌ Directory 'InkStrokes' already exists!"
    echo "Please remove it first or clone to a different location."
    exit 1
fi

# Try normal clone first
echo "🔄 Trying normal Git clone..."
if clone_repo "normal"; then
    echo "✅ Successfully cloned InkStrokes!"
    echo "📁 Project is ready in the 'InkStrokes' directory"
    echo "📖 Next steps:"
    echo "   cd InkStrokes"
    echo "   cat SETUP.md"
    exit 0
fi

echo "⚠️  Normal clone failed, trying without credential prompts..."
if clone_repo "no-prompt"; then
    echo "✅ Successfully cloned InkStrokes!"
    echo "📁 Project is ready in the 'InkStrokes' directory"
    echo "📖 Next steps:"
    echo "   cd InkStrokes"
    echo "   cat SETUP.md"
    exit 0
fi

echo "⚠️  Git clone failed, downloading as ZIP..."
if clone_repo "curl"; then
    echo "✅ Successfully downloaded InkStrokes!"
    echo "📁 Project is ready in the 'InkStrokes' directory"
    echo "📖 Next steps:"
    echo "   cd InkStrokes"
    echo "   cat SETUP.md"
    echo "ℹ️  Note: Downloaded as ZIP (not a Git repository)"
    exit 0
fi

echo "❌ All clone methods failed!"
echo "Please check your internet connection and try again."
echo "Or download manually from: https://github.com/utkarsh-brainstorm/InkStrokes"
exit 1

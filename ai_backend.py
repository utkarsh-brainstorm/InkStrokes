#!/usr/bin/env python3
"""
InkStrokes AI Backend Service
Provides AI-powered art critique and guidance using Google's Gemini AI
"""

import os
import sys
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai_backend.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class AIBackend:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        
        # Initialize AI model
        self.model = None
        self.setup_ai()
        self.setup_routes()
        
    def setup_ai(self):
        """Initialize Google AI Studio connection"""
        try:
            api_key = os.getenv('GOOGLE_AI_API_KEY')
            if not api_key:
                logger.error("GOOGLE_AI_API_KEY not found in environment variables")
                logger.error("Please set your Google AI Studio API key in the .env file")
                logger.error("Get your API key from: https://makersuite.google.com/app/apikey")
                return
                
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            logger.info("Google AI Studio configured successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI model: {e}")
            self.model = None
    
    def setup_routes(self):
        """Setup Flask routes"""
        
        @self.app.route('/api/ai/health', methods=['GET'])
        def health_check():
            """Health check endpoint"""
            return jsonify({
                'status': 'healthy' if self.model else 'ai_unavailable',
                'timestamp': datetime.utcnow().isoformat(),
                'model': 'gemini-pro' if self.model else None,
                'message': 'AI Backend is running' if self.model else 'AI model not initialized - check API key'
            })
        
        @self.app.route('/api/ai/chat', methods=['POST'])
        def chat():
            """Handle chat requests"""
            try:
                if not self.model:
                    return jsonify({
                        'success': False,
                        'error': 'AI service not available. Please check your Google AI Studio API key.',
                        'setup_url': 'https://makersuite.google.com/app/apikey'
                    }), 503
                
                data = request.get_json()
                if not data or 'message' not in data:
                    return jsonify({
                        'success': False,
                        'error': 'Message is required'
                    }), 400
                
                message = data['message']
                context = data.get('context', {})
                
                # Build context-aware prompt
                prompt = self.build_art_prompt(message, context)
                
                # Generate AI response
                response = self.model.generate_content(prompt)
                
                return jsonify({
                    'success': True,
                    'response': response.text,
                    'timestamp': datetime.utcnow().isoformat()
                })
                
            except Exception as e:
                logger.error(f"Chat error: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Failed to generate response. Please try again.'
                }), 500
    
    def build_art_prompt(self, message, context):
        """Build context-aware prompt for art instruction"""
        current_chapter = context.get('currentChapter', 'General')
        total_submissions = context.get('totalSubmissions', 0)
        recent_progress = context.get('recentProgress', 'Unknown')
        
        prompt = f"""You are an expert art instructor and mentor with years of experience teaching drawing and artistic techniques. You provide encouraging, specific, and actionable advice to help artists improve their skills.

Current Context:
- Student is working on: {current_chapter}
- Total artwork submissions: {total_submissions}
- Recent progress: {recent_progress}

Student's Question/Message: {message}

Please provide helpful, encouraging, and specific artistic advice. Focus on:
1. Practical techniques they can apply immediately
2. Constructive feedback that builds confidence
3. Specific exercises or practice suggestions
4. Encouragement for their artistic journey

Keep your response conversational, supportive, and focused on actionable advice. Avoid being overly technical unless the student specifically asks for technical details."""

        return prompt
    
    def run(self):
        """Start the Flask application"""
        port = int(os.getenv('AI_BACKEND_PORT', 5000))
        host = os.getenv('HOST', '127.0.0.1')
        
        logger.info(f"Starting AI Backend on {host}:{port}")
        
        if not self.model:
            logger.warning("AI model not initialized - service will run but AI features will be unavailable")
            logger.warning("To enable AI features:")
            logger.warning("1. Get API key from: https://makersuite.google.com/app/apikey")
            logger.warning("2. Add GOOGLE_AI_API_KEY=your_key_here to your .env file")
            logger.warning("3. Restart the service")
        
        try:
            self.app.run(host=host, port=port, debug=False, threaded=True)
        except Exception as e:
            logger.error(f"Failed to start server: {e}")
            sys.exit(1)

if __name__ == '__main__':
    # Check for required environment variables
    if not os.path.exists('.env'):
        logger.warning("No .env file found. Please create one based on .env.example")
        logger.warning("AI features will not work without proper configuration")
    
    # Start the AI backend service
    ai_backend = AIBackend()
    
    print("🤖 InkStrokes AI Backend Service")
    print("=" * 40)
    print("📡 AI Service starting...")
    
    if ai_backend.model:
        print("✅ Google AI Studio API configured")
    else:
        print("❌ Google AI Studio API not configured")
        print("   Get your API key: https://makersuite.google.com/app/apikey")
        print("   Add to .env: GOOGLE_AI_API_KEY=your_key_here")
    
    print(f"🚀 Server running on http://localhost:5000")
    print("🔧 Health check: http://localhost:5000/api/ai/health")
    print("")
    
    ai_backend.run()

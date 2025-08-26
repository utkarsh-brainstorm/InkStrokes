# 🎨 InkStrokes - Artistic Progress Tracker

> *Transform your artistic journey into an engaging, gamified experience with AI-powered feedback and structured learning.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%3E%3D12.0-blue)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-%3E%3D3.8-blue)](https://www.python.org/)

## 🎯 Overview

InkStrokes is a comprehensive artistic progress tracking application that gamifies the learning process through:

- **📅 Visual Progress Tracking**: GitHub-style activity calendar showing daily drawing submissions
- **🤖 AI-Powered Feedback**: Intelligent art critique and guidance using Google's Gemini AI
- **📚 Structured Learning**: 10-chapter course system with progressive skill building
- **🎮 Gamification**: Achievement system, streaks, milestones, and progress celebrations
- **🎨 Modern UI/UX**: Beautiful, responsive interface with dark/light themes

## ✨ Features

### 🎨 Core Features
- **📤 Smart Upload System**: Drag-and-drop image uploads with automatic optimization
- **📊 Progress Analytics**: Detailed statistics and progress insights
- **⭐ Favorites System**: Mark and organize your best artworks
- **🏷️ Tagging System**: Categorize and search your submissions
- **🎯 Milestone Tracking**: Achievement system with celebration animations

### 🤖 AI-Powered Features
- **💬 Intelligent Chat**: Real-time art critique and guidance
- **🎓 Personalized Feedback**: Context-aware suggestions based on your progress
- **📝 Exercise Recommendations**: AI-suggested practice exercises

### 📚 Learning System
- **📖 Course Content**: Comprehensive art curriculum (Chapter 1 and Final Exam included)
- **🎯 Progressive Unlocking**: Sequential chapter access based on submissions
- **📊 Progress Visualization**: Water-fill animations showing chapter completion

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16.0.0 or higher)
- **PostgreSQL** (v12.0 or higher)
- **Python** (v3.8 or higher)
- **Google AI Studio API Key** (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/InkStrokes.git
cd InkStrokes
```

2. **Install dependencies**
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

3. **Setup database**
```bash
# Create database
createdb drawing_tracker

# Import schema
psql drawing_tracker < database/schema.sql
```

4. **Configure environment**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

5. **Start the application**
```bash
# Start both services
./start_with_ai.sh
```

🎉 **Open http://localhost:3000 in your browser!**

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=drawing_tracker
DB_USER=your_username
DB_PASSWORD=your_password

# Server Configuration
PORT=3000
NODE_ENV=development

# AI Configuration (Optional - for AI features)
GOOGLE_AI_API_KEY=your_google_ai_studio_api_key
AI_BACKEND_PORT=5000

# Security
SESSION_SECRET=your_super_secret_session_key

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

### Google AI Studio Setup (Optional)

To enable AI chat features:

1. **Get API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env` file as `GOOGLE_AI_API_KEY`

2. **Without AI Key:**
   - The app works fully without AI features
   - AI chat will show setup instructions
   - All other features remain functional

## 📚 Course Content

### Included Content
- **Chapter 1**: Line Work (Complete content available)
- **Final Exam**: Comprehensive Assessment (Complete content available)
- **The End**: Completion celebration (Complete content available)

### Additional Content Available
- **Chapters 2-10**: Available upon request from the author
- **Full Course**: Complete curriculum with all chapters

### Adding Course Content

If you receive additional course files from the author:

1. **Place files in**: `Resources/course_data/`
2. **Restart the application**
3. **Content automatically appears** in the course section

**Required file format**: `.md` (Markdown files)

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+) with CSS3
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with optimized queries
- **AI Service**: Python Flask with Google Gemini AI
- **File Processing**: Sharp.js for image optimization

### Project Structure
```
InkStrokes/
├── 📁 public/                 # Frontend assets
│   ├── 📄 index.html         # Main application
│   ├── 📄 styles.css         # Styling and themes
│   ├── 📄 app.js             # Core application logic
│   ├── 📄 course.js          # Course system
│   └── 📄 ai-chat.js         # AI chat interface
├── 📁 database/              # Database schema
├── 📁 Resources/             # Course content
│   └── 📁 course_data/       # Markdown course files
├── 📄 server.js              # Node.js server
├── 📄 ai_backend.py          # Python AI service
├── 📄 package.json           # Dependencies
└── 📄 start_with_ai.sh       # Startup script
```

## 🎨 Usage

### 1. Upload Artwork
- Drag and drop images to the upload area
- Add descriptions and tags
- Watch your activity calendar fill up

### 2. Track Progress
- View your GitHub-style activity calendar
- Monitor streaks and milestones
- Check detailed statistics

### 3. Learn with Courses
- Start with Chapter 1: Line Work
- Complete exercises and evaluations
- Progress through available content

### 4. AI Assistance (Optional)
- Click the 🤖 button for AI chat
- Get personalized feedback on your art
- Receive practice suggestions

### 5. Organize Your Work
- Mark favorites with the ⭐ button
- Use tags to categorize artwork
- Search and filter your submissions

## 🔒 Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **File Upload Security**: Only image files allowed with size limits
- **SQL Injection Prevention**: Parameterized queries throughout
- **XSS Protection**: Content Security Policy headers
- **Secure Headers**: Helmet.js security middleware

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d drawing_tracker -c "SELECT 1;"
```

**AI Features Not Working:**
- Check if `GOOGLE_AI_API_KEY` is set in `.env`
- Visit http://localhost:5000/api/ai/health for status
- AI features are optional - app works without them

**Upload Issues:**
```bash
# Check uploads directory permissions
chmod 755 uploads/

# Check available disk space
df -h
```

**Port Already in Use:**
```bash
# Kill existing processes
pkill -f "node server.js"
pkill -f "ai_backend.py"

# Or change ports in .env file
```

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **Load Time**: <2 seconds average
- **Image Optimization**: 60-80% size reduction with Sharp.js
- **Database**: Optimized queries with proper indexing

## 🤝 Contributing

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/yourusername/InkStrokes.git

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm test

# Submit pull request
```

### Code Style
- Use ESLint for JavaScript
- Follow existing code patterns
- Add comments for complex logic
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI Studio** for AI capabilities
- **PostgreSQL** team for excellent database
- **Node.js** and **Express.js** communities
- **Sharp.js** for image processing

## 📞 Contact

For additional course content or questions:
- **GitHub Issues**: Report bugs or request features
- **Email**: [Contact the author for course materials]

---

**Built with ❤️ for artists everywhere**

*Start your artistic journey today with InkStrokes!*

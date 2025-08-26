# 🚀 InkStrokes Setup Guide
*Complete step-by-step installation guide*

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12.0 or higher) - [Download here](https://www.postgresql.org/download/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/downloads/)
- **Git** - [Download here](https://git-scm.com/downloads)

### Optional (for AI features)
- **Google AI Studio API Key** - [Get here](https://makersuite.google.com/app/apikey)

---

## 🔧 Installation Steps

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/InkStrokes.git
cd InkStrokes
```

### Step 2: Install Dependencies

**Install Node.js dependencies:**
```bash
npm install
```

**Install Python dependencies:**
```bash
pip install -r requirements.txt

# Or use virtual environment (recommended):
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 3: Database Setup

**Create PostgreSQL database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE drawing_tracker;

# Exit PostgreSQL
\q
```

**Import database schema:**
```bash
psql -U postgres -d drawing_tracker -f database/schema.sql
```

### Step 4: Environment Configuration

**Copy environment template:**
```bash
cp .env.example .env
```

**Edit the .env file:**
```bash
# Open with your preferred editor
nano .env
# or
code .env
```

**Required configuration:**
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=drawing_tracker
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Server Configuration
PORT=3000
NODE_ENV=development

# Security (generate random strings)
SESSION_SECRET=your_random_session_secret_here

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
```

**Optional AI configuration:**
```bash
# AI Configuration (optional)
GOOGLE_AI_API_KEY=your_google_ai_studio_api_key
AI_BACKEND_PORT=5000
```

### Step 5: Start the Application

**Start both services:**
```bash
./start_with_ai.sh
```

**Or start manually:**
```bash
# Terminal 1: Start main server
npm start

# Terminal 2: Start AI service (optional)
python ai_backend.py
```

### Step 6: Access the Application

Open your browser and navigate to:
- **Main Application**: http://localhost:3000
- **AI Health Check**: http://localhost:5000/api/ai/health (if AI enabled)

---

## 🎯 Verification

### Test Basic Functionality
1. **Upload Test**: Try uploading an image
2. **Calendar Check**: Verify activity calendar appears
3. **Course Access**: Check if Chapter 1 loads
4. **Theme Toggle**: Test dark/light mode switching

### Test AI Features (Optional)
1. **AI Chat**: Click the 🤖 button
2. **Health Check**: Visit http://localhost:5000/api/ai/health
3. **Send Message**: Try asking for art advice

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check PostgreSQL status
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Test connection
psql -U postgres -d drawing_tracker -c "SELECT 1;"
```

#### Port Already in Use
```bash
# Kill existing processes
pkill -f "node server.js"
pkill -f "ai_backend.py"

# Or change ports in .env
PORT=3001
AI_BACKEND_PORT=5001
```

#### Permission Errors
```bash
# Fix uploads directory permissions
chmod 755 uploads/

# Fix script permissions
chmod +x start_with_ai.sh
```

#### Node.js Module Errors
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### Python Dependencies Error
```bash
# Upgrade pip and reinstall
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

---

## 🎨 Adding Course Content

### Current Content
- ✅ **Chapter 1**: Line Work (Complete)
- ✅ **Final Exam**: Assessment (Complete)
- ✅ **The End**: Completion (Complete)
- ⏳ **Chapters 2-10**: Placeholders (Contact author)

### Adding Missing Chapters

If you receive additional course files:

1. **Place files in**: `Resources/course_data/`
2. **File format**: `.md` (Markdown)
3. **Restart application**: `./start_with_ai.sh`
4. **Content appears automatically**

**Example file structure:**
```
Resources/course_data/
├── c2.md          # Chapter 2 content
├── c2ep.md        # Chapter 2 exercises
├── c3.md          # Chapter 3 content
├── c3ep.md        # Chapter 3 exercises
└── course.md      # Full course content
```

---

## 🚀 Production Deployment

### Environment Setup
```bash
# Set production environment
NODE_ENV=production

# Use production database
DB_HOST=your_production_db_host
DB_NAME=drawing_tracker_prod
```

### Process Management
```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx Configuration (Optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ai/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📞 Support

### Getting Help
- **GitHub Issues**: Report bugs or ask questions
- **Documentation**: Check README.md for detailed info
- **Course Content**: Contact author for additional chapters

### Performance Tips
- **Database**: Ensure PostgreSQL is properly indexed
- **Images**: Upload reasonably sized images (< 10MB)
- **Browser**: Use modern browsers (Chrome 90+, Firefox 88+)

---

## ✅ Success Checklist

- [ ] Node.js, PostgreSQL, and Python installed
- [ ] Repository cloned and dependencies installed
- [ ] Database created and schema imported
- [ ] .env file configured with database credentials
- [ ] Application starts without errors
- [ ] Can upload images and see activity calendar
- [ ] Course content loads (Chapter 1, Final Exam)
- [ ] AI features working (optional)
- [ ] Theme switching works
- [ ] No console errors in browser

---

**🎉 Congratulations! InkStrokes is now ready for your artistic journey!**

*Need help? Check the troubleshooting section or create a GitHub issue.*

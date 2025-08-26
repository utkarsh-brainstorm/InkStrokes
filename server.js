const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'drawing_tracker',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", "http://localhost:5000", "http://127.0.0.1:5000"]
        }
    }
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/resources', express.static(path.join(__dirname, 'public/resources')));
app.use('/Resources', express.static(path.join(__dirname, 'Resources')));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
    try {
        await fs.access(path.join(__dirname, 'uploads'));
    } catch {
        await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });
    }
};

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
        }
    }
});

// Helper function to get default user ID
const getDefaultUserId = async () => {
    const result = await pool.query('SELECT id FROM users LIMIT 1');
    return result.rows[0]?.id;
};

// API Routes

// Get dashboard data (activity calendar + stats)
app.get('/api/dashboard', async (req, res) => {
    try {
        const userId = await getDefaultUserId();
        const year = req.query.year || new Date().getFullYear();

        // Get activity calendar data with proper date formatting
        const activityResult = await pool.query(
            `SELECT 
                TO_CHAR(activity_date, 'YYYY-MM-DD') as activity_date,
                submission_count,
                CASE 
                    WHEN submission_count = 0 THEN 0
                    WHEN submission_count = 1 THEN 1
                    WHEN submission_count = 2 THEN 2
                    WHEN submission_count >= 3 THEN 3
                    ELSE 0
                END as intensity_level
             FROM daily_activity 
             WHERE user_id = $1 AND EXTRACT(YEAR FROM activity_date) = $2
             ORDER BY activity_date`,
            [userId, year]
        );

        // Get total submissions count
        const totalResult = await pool.query(
            'SELECT COUNT(*) as total FROM drawings WHERE user_id = $1 AND is_deleted = false',
            [userId]
        );

        // Get recent submissions
        const recentResult = await pool.query(
            `SELECT id, title, file_path, created_at 
             FROM drawings 
             WHERE user_id = $1 AND is_deleted = false 
             ORDER BY created_at DESC 
             LIMIT 5`,
            [userId]
        );

        res.json({
            activity: activityResult.rows,
            totalSubmissions: parseInt(totalResult.rows[0].total),
            recentSubmissions: recentResult.rows,
            year: parseInt(year)
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Upload new drawing(s)
app.post('/api/drawings/upload', upload.array('drawings', 10), async (req, res) => {
    try {
        const userId = await getDefaultUserId();
        const { title, description } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        await ensureUploadsDir();

        const uploadedDrawings = [];

        for (const file of files) {
            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const originalExt = path.extname(file.originalname);
            const baseName = `${timestamp}_${randomString}`;
            
            // Original file (no compression)
            const originalFilename = `${baseName}_original${originalExt}`;
            const originalFilepath = path.join(__dirname, 'uploads', originalFilename);
            
            // Compressed file for display
            const compressedFilename = `${baseName}.webp`;
            const compressedFilepath = path.join(__dirname, 'uploads', compressedFilename);

            // Save original file as-is (no compression)
            await fs.writeFile(originalFilepath, file.buffer);

            // Create compressed version for display
            const compressedBuffer = await sharp(file.buffer)
                .resize(1920, 1920, { 
                    fit: 'inside', 
                    withoutEnlargement: true 
                })
                .webp({ quality: 85 })
                .toBuffer();

            // Save compressed file
            await fs.writeFile(compressedFilepath, compressedBuffer);

            // Get metadata from original file
            const metadata = await sharp(file.buffer).metadata();

            // Save to database with both file paths
            const result = await pool.query(
                `INSERT INTO drawings (user_id, title, description, file_path, original_file_path, file_name, original_file_name, file_size, original_file_size, mime_type, width, height)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                 RETURNING *`,
                [
                    userId,
                    title || `Drawing ${new Date().toLocaleDateString()}`,
                    description || '',
                    `/uploads/${compressedFilename}`, // Compressed for display
                    `/uploads/${originalFilename}`,   // Original for download
                    compressedFilename,
                    originalFilename,
                    compressedBuffer.length,
                    file.buffer.length, // Original file size
                    file.mimetype,
                    metadata.width,
                    metadata.height
                ]
            );

            uploadedDrawings.push(result.rows[0]);
        }

        res.json({
            message: 'Drawings uploaded successfully',
            drawings: uploadedDrawings
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload drawings' });
    }
});

// Get all drawings for gallery
app.get('/api/drawings', async (req, res) => {
    try {
        const userId = await getDefaultUserId();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT d.*, 
                    CASE WHEN f.drawing_id IS NOT NULL THEN true ELSE false END as is_favorite
             FROM drawings d
             LEFT JOIN favorites f ON d.id = f.drawing_id AND f.user_id = $1
             WHERE d.user_id = $1 AND d.is_deleted = false
             ORDER BY d.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        // Group by month for better organization
        const groupedDrawings = result.rows.reduce((acc, drawing) => {
            const date = new Date(drawing.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            
            if (!acc[monthKey]) {
                acc[monthKey] = {
                    monthName,
                    drawings: []
                };
            }
            acc[monthKey].drawings.push(drawing);
            return acc;
        }, {});

        res.json({
            groupedDrawings,
            page,
            hasMore: result.rows.length === limit
        });
    } catch (error) {
        console.error('Gallery error:', error);
        res.status(500).json({ error: 'Failed to fetch drawings' });
    }
});

// Delete drawing
app.delete('/api/drawings/:id', async (req, res) => {
    try {
        const userId = await getDefaultUserId();
        const drawingId = req.params.id;

        // Get drawing info before deletion
        const drawingResult = await pool.query(
            'SELECT file_path, original_file_path, submission_date FROM drawings WHERE id = $1 AND user_id = $2 AND is_deleted = false',
            [drawingId, userId]
        );

        if (drawingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Drawing not found' });
        }

        const drawing = drawingResult.rows[0];

        // Mark as deleted in database (soft delete) - this will trigger the function
        await pool.query(
            'UPDATE drawings SET is_deleted = true WHERE id = $1 AND user_id = $2',
            [drawingId, userId]
        );

        // Remove from favorites if exists
        await pool.query(
            'DELETE FROM favorites WHERE drawing_id = $1 AND user_id = $2',
            [drawingId, userId]
        );

        // Recalculate daily activity for the specific date to ensure accuracy
        const recalculateResult = await pool.query(
            `INSERT INTO daily_activity (user_id, activity_date, submission_count)
             SELECT $1, $2, COUNT(*)
             FROM drawings 
             WHERE user_id = $1 AND submission_date = $2 AND is_deleted = false
             ON CONFLICT (user_id, activity_date)
             DO UPDATE SET 
                submission_count = EXCLUDED.submission_count,
                updated_at = CURRENT_TIMESTAMP`,
            [userId, drawing.submission_date]
        );

        // Delete physical files (both compressed and original)
        const filePath = path.join(__dirname, drawing.file_path.replace('/uploads/', 'uploads/'));
        const originalFilePath = drawing.original_file_path ? 
            path.join(__dirname, drawing.original_file_path.replace('/uploads/', 'uploads/')) : null;
        
        try {
            // Delete compressed file
            await fs.unlink(filePath);
        } catch (fileError) {
            console.warn('Could not delete compressed file:', fileError.message);
        }
        
        // Delete original file if it exists
        if (originalFilePath) {
            try {
                await fs.unlink(originalFilePath);
            } catch (originalError) {
                console.warn('Could not delete original file:', originalError.message);
            }
        }

        res.json({ message: 'Drawing deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete drawing' });
    }
});

// Add/remove favorite
app.post('/api/drawings/:id/favorite', async (req, res) => {
    try {
        const userId = await getDefaultUserId();
        const drawingId = req.params.id;

        // Check if already favorited
        const existingFavorite = await pool.query(
            'SELECT id FROM favorites WHERE drawing_id = $1 AND user_id = $2',
            [drawingId, userId]
        );

        if (existingFavorite.rows.length > 0) {
            // Remove from favorites
            await pool.query(
                'DELETE FROM favorites WHERE drawing_id = $1 AND user_id = $2',
                [drawingId, userId]
            );
            res.json({ message: 'Removed from favorites', isFavorite: false });
        } else {
            // Add to favorites
            await pool.query(
                'INSERT INTO favorites (drawing_id, user_id) VALUES ($1, $2)',
                [drawingId, userId]
            );
            res.json({ message: 'Added to favorites', isFavorite: true });
        }
    } catch (error) {
        console.error('Favorite error:', error);
        res.status(500).json({ error: 'Failed to update favorite status' });
    }
});

// Get favorite drawings
app.get('/api/favorites', async (req, res) => {
    try {
        const userId = await getDefaultUserId();

        const result = await pool.query(
            `SELECT d.*, f.added_at
             FROM drawings d
             INNER JOIN favorites f ON d.id = f.drawing_id
             WHERE f.user_id = $1 AND d.is_deleted = false
             ORDER BY f.added_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Favorites error:', error);
        res.status(500).json({ error: 'Failed to fetch favorite drawings' });
    }
});

// Download drawing (original quality)
app.get('/api/drawings/:id/download', async (req, res) => {
    try {
        const userId = await getDefaultUserId();
        const drawingId = req.params.id;

        const result = await pool.query(
            'SELECT file_path, file_name, title, original_file_path, original_file_name FROM drawings WHERE id = $1 AND user_id = $2 AND is_deleted = false',
            [drawingId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Drawing not found' });
        }

        const drawing = result.rows[0];
        
        // Try to serve original file first, fallback to compressed
        let filePath, downloadName;
        
        if (drawing.original_file_path && drawing.original_file_name) {
            // Serve original file
            filePath = path.join(__dirname, drawing.original_file_path.replace('/uploads/', 'uploads/'));
            downloadName = drawing.title ? 
                `${drawing.title.replace(/[^a-z0-9]/gi, '_')}_original${path.extname(drawing.original_file_name)}` :
                drawing.original_file_name;
        } else {
            // Fallback to compressed file
            filePath = path.join(__dirname, drawing.file_path.replace('/uploads/', 'uploads/'));
            downloadName = drawing.title ? 
                `${drawing.title.replace(/[^a-z0-9]/gi, '_')}.webp` : 
                drawing.file_name;
        }
        
        // Check if file exists
        try {
            await fs.access(filePath);
        } catch (error) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Set download headers
        res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download drawing' });
    }
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

// Serve main app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
    try {
        await ensureUploadsDir();
        app.listen(PORT, () => {
            console.log(`🎨 Drawing Tracker Server running on port ${PORT}`);
            console.log(`📊 Dashboard: http://localhost:${PORT}`);
            console.log(`🖼️  Gallery: http://localhost:${PORT}/gallery`);
            console.log(`⭐ Best Artworks: http://localhost:${PORT}/favorites`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

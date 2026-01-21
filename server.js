const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Parse URL
    let filePath = req.url;
    
    // If root path or /index.html, ALWAYS serve root index.html
    if (filePath === '/' || filePath === '/index.html' || filePath === '') {
        filePath = '/index.html';
        console.log(`[ROOT REQUEST] Serving root index.html from: ${path.join(ROOT_DIR, 'index.html')}`);
    }
    
    // Remove query string
    filePath = filePath.split('?')[0];
    
    // Normalize path (remove leading slash for joining)
    const normalizedPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullPath = path.join(ROOT_DIR, normalizedPath);
    
    // Security: prevent directory traversal
    if (!fullPath.startsWith(ROOT_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 - Forbidden</h1>', 'utf-8');
        return;
    }
    
    // Get file extension
    const extname = String(path.extname(fullPath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // Check if file exists first
    fs.stat(fullPath, (statError) => {
        if (statError) {
            if (statError.code === 'ENOENT') {
                console.log(`[404] File not found: ${fullPath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`<h1>404 - File Not Found</h1><p>Requested: ${req.url}</p><p>Path: ${fullPath}</p>`, 'utf-8');
            } else {
                console.log(`[500] Server error: ${statError.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${statError.code}`, 'utf-8');
            }
            return;
        }

        // Read and serve file
        fs.readFile(fullPath, (error, content) => {
            if (error) {
                console.log(`[500] Read error: ${error.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            } else {
                console.log(`[200] Serving: ${fullPath}`);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });
});

server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Serving files from: ${ROOT_DIR}`);
    console.log(`Root index.html path: ${path.join(ROOT_DIR, 'index.html')}`);
    
    // Verify root index.html exists
    fs.stat(path.join(ROOT_DIR, 'index.html'), (err) => {
        if (err) {
            console.log(`⚠️  WARNING: Root index.html not found!`);
        } else {
            console.log(`✓ Root index.html exists`);
        }
    });
    
    console.log('='.repeat(60));
    console.log('\nPress Ctrl+C to stop the server\n');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('\n❌ ERROR: Port 8000 is already in use!');
        console.error('\nSolutions:');
        console.error('1. Kill processes using port 8000:');
        console.error('   - Run: kill-port-8000.bat');
        console.error('   - Or manually: netstat -ano | findstr :8000');
        console.error('   - Then: taskkill /F /PID <PID>');
        console.error('\n2. Use a different port:');
        console.error('   - Edit server.js and change PORT to 8001 or another port');
        console.error('\n3. Find and close the other server manually');
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});

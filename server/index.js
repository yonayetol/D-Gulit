const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname) || '';
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) return cb(null, true);
        cb(new Error('Only image files are allowed'));
    }
});

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
});

// Simple JSON file storage for posts
const postsFile = path.join(dataDir, 'posts.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(postsFile)) fs.writeFileSync(postsFile, JSON.stringify([]));
// Removed postsTxtFile reference

function readPosts() {
    try {
        const raw = fs.readFileSync(postsFile, 'utf8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function writePosts(posts) {
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
}

// Helpers to render posts.txt from JSON (avoid duplicates)
function renderPostBlock(post) {
    const lines = [];
    lines.push(`${post.id}.`);
    lines.push(`     Name: ${post.name}`);
    lines.push(`     Description: ${post.description}`);
    lines.push(`     price: ${post.price || ''}`);
    lines.push(`     image: ${post.imageUrl || 'None'}`);
    lines.push(`     seller: ${post.seller || ''}`);
    lines.push(`     status: ${post.isSold ? 'SOLD' : 'AVAILABLE'}`);
    if (post.buyer) lines.push(`     buyer: ${post.buyer}`);
    return lines.join('\n');
}

function rewritePostsTxt(posts) {
    const content = posts.map(renderPostBlock).join('\n\n');
    fs.writeFileSync(postsTxtFile, content ? content + '\n' : '');
}

// Get all posts
app.get('/posts', (req, res) => {
    const posts = readPosts();
    res.json(posts);
});

// Create a new post
app.post('/posts', (req, res) => {
    const { name, description, imageUrl = '', price = '', seller = '' } = req.body || {};
    if (!name || !description) {
        return res.status(400).json({ error: 'name and description are required' });
    }
    const posts = readPosts();
    // De-dupe by seller + name + description (when not sold)
    const idx = posts.findIndex(p => !p.isSold &&
        (p.seller || '').toLowerCase() === (seller || '').toLowerCase() &&
        (p.name || '') === name && (p.description || '') === description);
    let saved;
    if (idx !== -1) {
        posts[idx] = { ...posts[idx], imageUrl, price, seller };
        saved = posts[idx];
    } else {
        const now = new Date().toISOString();
        const id = posts.length > 0 ? posts[posts.length - 1].id + 1 : 1;
        saved = { id, name, description, imageUrl, price, seller, createdAt: now, isSold: false, buyer: '' };
        posts.push(saved);
    }
    writePosts(posts);
    try { rewritePostsTxt(posts); } catch { }
    res.status(201).json(saved);
});

// Plain text posts helpers/endpoints
function getNextIdFromTxt() {
    try {
        const raw = fs.readFileSync(postsTxtFile, 'utf8');
        const matches = raw.match(/^\d+\./gm);
        const count = matches ? matches.length : 0;
        return count + 1;
    } catch {
        return 1;
    }
}

function appendPostToTxt(post) {
    const lines = [];
    lines.push(`${post.id}.`);
    lines.push(`     Name: ${post.name}`);
    lines.push(`     Description: ${post.description}`);
    lines.push(`     price: ${post.price || ''}`);
    lines.push(`     image: ${post.imageUrl || 'None'}`);
    lines.push(`     seller: ${post.seller || ''}`);
    lines.push(`     status: ${post.isSold ? 'SOLD' : 'AVAILABLE'}`);
    if (post.buyer) {
        lines.push(`     buyer: ${post.buyer}`);
    }
    lines.push('');
    fs.appendFileSync(postsTxtFile, lines.join('\n') + '\n');
}

// (Removed plaintext parsePostsTxt)

// Upload with meaningful name Post{id}.ext and return its URL
app.post('/upload-post', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const posts = readPosts();
    const nextId = posts.length > 0 ? posts[posts.length - 1].id + 1 : 1;
    const ext = path.extname(req.file.originalname) || path.extname(req.file.filename) || '';
    const newName = `Post${nextId}${ext}`;
    const oldPath = path.join(uploadsDir, req.file.filename);
    const newPath = path.join(uploadsDir, newName);
    try {
        fs.renameSync(oldPath, newPath);
    } catch (e) {
        return res.status(500).json({ error: 'Rename failed' });
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${newName}`;
    res.json({ id: nextId, url, filename: newName });
});

// Append a post entry to posts.txt
// (Removed /posts-txt endpoint)

// Read posts.txt as parsed JSON
// (Removed GET /posts-txt)

// Mark a post as purchased (sold) and record buyer
app.post('/posts/:id/purchase', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { buyer = '' } = req.body || {};
    if (!id || !buyer) return res.status(400).json({ error: 'id and buyer are required' });
    const posts = readPosts();
    const idx = posts.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'post not found' });
    if (posts[idx].isSold) return res.status(400).json({ error: 'already sold' });
    posts[idx].isSold = true;
    posts[idx].buyer = buyer;
    writePosts(posts);
    // Re-generate TXT to keep single entry
    try { rewritePostsTxt(posts); } catch { }
    res.json({ ok: true });
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
    console.log(`Upload server listening on http://localhost:${PORT}`);
});



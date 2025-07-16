const http     = require('http');
const fs       = require('fs');
const path     = require('path');
const Database = require('better-sqlite3');
const db = new Database(path.join(__dirname,'data','requests.db'));

// ensure table exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS requests(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id INTEGER,
    media_type TEXT,
    title TEXT,
    release_date TEXT,
    poster_path TEXT
  )
`).run();

/// ─── Step 3: Static file serving ───
const PUBLIC = path.join(__dirname, 'public');
const mime   = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
};

const server = http.createServer((req, res) => {
  // derive the requested file’s path
  const urlPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const ext     = path.extname(urlPath);
  const fileLoc = path.join(PUBLIC, urlPath);

  // if this is a static asset and it exists, stream it
  if (ext && fs.existsSync(fileLoc)) {
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    return fs.createReadStream(fileLoc).pipe(res);
  }

  // — next we'll add API routes here —
});


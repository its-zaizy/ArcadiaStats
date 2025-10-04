const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const { hashPassword, comparePassword, signToken, verifyToken } = require('./auth');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

// 🔒 Middleware para proteger rotas
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Sem token' });
  const token = auth.replace(/^Bearer\\s+/i, '');
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Token inválido' });
  req.user = payload;
  next();
}

// 🧍‍♂️ Criar conta
app.post('/api/register', async (req, res) => {
  const { username, email, password, display_name } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username e password obrigatórios' });

  try {
    const password_hash = await hashPassword(password);
    const stmt = db.prepare(
      'INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(username, email || null, password_hash, display_name || username);
    const user = db
      .prepare('SELECT id, username, display_name, email, avatar, created_at FROM users WHERE id = ?')
      .get(info.lastInsertRowid);
    const token = signToken({ id: user.id, username: user.username });
    res.json({ user, token });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Username ou email já existem' });
    }
    console.error(e);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// 🔑 Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username e password obrigatórios' });
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);
    if (!user) return res.status(400).json({ error: 'Credenciais inválidas' });
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Credenciais inválidas' });
    const publicUser = { id: user.id, username: user.username, display_name: user.display_name, avatar: user.avatar };
    const token = signToken({ id: user.id, username: user.username });
    res.json({ user: publicUser, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// 🧝‍♀️ Criar perfil
app.post('/api/profiles', requireAuth, (req, res) => {
  const { name, avatar, bio } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome do perfil obrigatório' });
  const stmt = db.prepare('INSERT INTO profiles (user_id, name, avatar, bio) VALUES (?, ?, ?, ?)');
  const info = stmt.run(req.user.id, name, avatar || null, bio || null);
  const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(info.lastInsertRowid);
  res.json({ profile });
});

// 📜 Ver perfis do utilizador
app.get('/api/profiles', requireAuth, (req, res) => {
  const profiles = db.prepare('SELECT * FROM profiles WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ profiles });
});

// ✍️ Criar publicação
app.post('/api/posts', requireAuth, (req, res) => {
  const { profile_id, content, image } = req.body;
  if (!profile_id || !content)
    return res.status(400).json({ error: 'profile_id e content obrigatórios' });
  const p = db.prepare('SELECT * FROM profiles WHERE id = ? AND user_id = ?').get(profile_id, req.user.id);
  if (!p) return res.status(403).json({ error: 'Perfil inválido' });
  const stmt = db.prepare('INSERT INTO posts (profile_id, content, image) VALUES (?, ?, ?)');
  const info = stmt.run(profile_id, content, image || null);
  const post = db
    .prepare('SELECT po.*, pr.name as profile_name, pr.avatar as profile_avatar FROM posts po JOIN profiles pr ON pr.id = po.profile_id WHERE po.id = ?')
    .get(info.lastInsertRowid);
  res.json({ post });
});

// 📰 Feed
app.get('/api/posts', (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit || '20'));
  const offset = parseInt(req.query.offset || '0');
  const posts = db
    .prepare(`SELECT po.*, pr.name as profile_name, pr.avatar as profile_avatar, u.username as owner_username
              FROM posts po 
              JOIN profiles pr ON pr.id = po.profile_id 
              JOIN users u ON u.id = pr.user_id
              ORDER BY po.created_at DESC LIMIT ? OFFSET ?`)
    .all(limit, offset);
  res.json({ posts });
});

// ⚙️ Iniciar servidor
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log('🚀 Arcadia backend a correr na porta ' + port);
});

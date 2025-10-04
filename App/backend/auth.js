const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET = process.env.ARCADIA_JWT_SECRET || 'chave_super_secreta';
const TOKEN_EXP = '7d';

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_EXP });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

module.exports = { hashPassword, comparePassword, signToken, verifyToken };

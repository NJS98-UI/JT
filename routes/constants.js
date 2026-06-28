const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req, res) => res.json(db.prepare('SELECT * FROM constants').all()));

router.post('/', (req, res) => {
  const { algo_key, config_json } = req.body;
  db.prepare('INSERT OR REPLACE INTO constants (algo_key, config_json) VALUES (?, ?)').run(algo_key, config_json);
  res.json({ ok: true });
});

router.get('/:key', (req, res) => {
  const row = db.prepare('SELECT * FROM constants WHERE algo_key = ?').get(req.params.key);
  res.json(row || { config_json: '{}' });
});

module.exports = router;
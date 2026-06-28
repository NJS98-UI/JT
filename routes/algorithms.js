const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req, res) => res.json(db.prepare('SELECT * FROM algorithms').all()));

router.post('/', (req, res) => {
  const { algo_key, algo_name, countdown, need_serial, need_vin } = req.body;
  if (!algo_key || !algo_name) return res.status(400).json({ error: '参数不足' });
  db.prepare('INSERT INTO algorithms (algo_key, algo_name, countdown, need_serial, need_vin) VALUES (?,?,?,?,?)')
    .run(algo_key, algo_name, countdown || 'none', need_serial ? 1 : 0, need_vin ? 1 : 0);
  res.json({ ok: true });
});

router.put('/:key', (req, res) => {
  const { algo_name, countdown, need_serial, need_vin } = req.body;
  db.prepare('UPDATE algorithms SET algo_name=?, countdown=?, need_serial=?, need_vin=? WHERE algo_key=?')
    .run(algo_name, countdown, need_serial ? 1 : 0, need_vin ? 1 : 0, req.params.key);
  res.json({ ok: true });
});

router.delete('/:key', (req, res) => {
  db.prepare('DELETE FROM algorithms WHERE algo_key=?').run(req.params.key);
  res.json({ ok: true });
});

module.exports = router;
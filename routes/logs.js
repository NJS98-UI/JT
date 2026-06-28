const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 记录使用（无需认证，方便前端调用）
router.post('/', (req, res) => {
  const { car, version, device, ip } = req.body;
  db.prepare('INSERT INTO usage_logs (car_model, version, device, ip) VALUES (?, ?, ?, ?)')
    .run(car, version, device, ip);
  res.json({ ok: true });
});

// 查询日志（需要认证）
router.get('/', authenticateToken, (req, res) => {
  const logs = db.prepare('SELECT * FROM usage_logs ORDER BY id DESC LIMIT 100').all();
  res.json(logs);
});

module.exports = router;
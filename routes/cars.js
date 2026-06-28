const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// 获取所有车型（含版本）
router.get('/', (req, res) => {
  const cars = db.prepare('SELECT * FROM car_models').all();
  const result = cars.map(car => ({
    ...car,
    versions: db.prepare('SELECT * FROM car_versions WHERE car_model_id = ?').all(car.id),
    is_active: !!car.is_active
  }));
  res.json(result);
});

// 新增车型
router.post('/', (req, res) => {
  const { model_key, model_name } = req.body;
  if (!model_key || !model_name) return res.status(400).json({ error: '参数不足' });
  const info = db.prepare('INSERT INTO car_models (model_key, model_name) VALUES (?, ?)').run(model_key, model_name);
  res.json({ id: info.lastInsertRowid, model_key, model_name });
});

// 更新车型
router.put('/:id', (req, res) => {
  const { model_key, model_name, is_active } = req.body;
  db.prepare('UPDATE car_models SET model_key=?, model_name=?, is_active=? WHERE id=?')
    .run(model_key, model_name, is_active ? 1 : 0, req.params.id);
  res.json({ ok: true });
});

// 删除车型
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM car_models WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// 获取某车型的版本列表
router.get('/:carId/versions', (req, res) => {
  const versions = db.prepare('SELECT * FROM car_versions WHERE car_model_id = ?').all(req.params.carId);
  res.json(versions);
});

// 新增版本
router.post('/:carId/versions', (req, res) => {
  const { version_key, version_name, algorithm_name } = req.body;
  if (!version_key || !version_name || !algorithm_name) return res.status(400).json({ error: '参数不足' });
  const info = db.prepare('INSERT INTO car_versions (car_model_id, version_key, version_name, algorithm_name) VALUES (?, ?, ?, ?)')
    .run(req.params.carId, version_key, version_name, algorithm_name);
  res.json({ id: info.lastInsertRowid });
});

// 更新版本
router.put('/versions/:verId', (req, res) => {
  const { version_key, version_name, algorithm_name, is_default } = req.body;
  db.prepare('UPDATE car_versions SET version_key=?, version_name=?, algorithm_name=?, is_default=? WHERE id=?')
    .run(version_key, version_name, algorithm_name, is_default ? 1 : 0, req.params.verId);
  res.json({ ok: true });
});

// 删除版本
router.delete('/versions/:verId', (req, res) => {
  db.prepare('DELETE FROM car_versions WHERE id=?').run(req.params.verId);
  res.json({ ok: true });
});

module.exports = router;
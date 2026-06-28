const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, 'data.db'));
db.pragma('journal_mode = WAL');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS car_models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_key TEXT UNIQUE NOT NULL,
      model_name TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS car_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_model_id INTEGER NOT NULL,
      version_key TEXT NOT NULL,
      version_name TEXT NOT NULL,
      algorithm_name TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      FOREIGN KEY (car_model_id) REFERENCES car_models(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS algorithms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      algo_key TEXT UNIQUE NOT NULL,
      algo_name TEXT NOT NULL,
      countdown TEXT DEFAULT 'none',
      need_serial INTEGER DEFAULT 0,
      need_vin INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS constants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      algo_key TEXT NOT NULL,
      config_json TEXT DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_model TEXT,
      version TEXT,
      device TEXT,
      ip TEXT,
      time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 插入默认管理员
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT OR IGNORE INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash);

  // 插入初始数据（如果表为空）
  if (db.prepare('SELECT COUNT(*) as c FROM car_models').get().c === 0) {
    const insertCar = db.prepare('INSERT INTO car_models (model_key, model_name) VALUES (?, ?)');
    const insertVersion = db.prepare('INSERT INTO car_versions (car_model_id, version_key, version_name, algorithm_name, is_default) VALUES (?, ?, ?, ?, ?)');
    const cars = [
      ['traveler', '捷途旅行者/山海T2', [
        ['00x', '00.08及以下', 'serialNumber', 0],
        ['0406', '4.06及以下', 'dynamic230830', 0],
        ['0407', '4.07以上', 'dynamic250110', 1],
        ['other', '其他', 'serialNumberDaily', 0],
        ['cdm', '26款', 'dynamic250930', 0]
      ]],
      ['hu8', '虎8/8L', [
        ['unknown', '其他版本', 'hu8Daily', 1],
        ['latest', '最新版本', 'ruihuRandomCode', 0]
      ]],
      ['ruihu8pro', '瑞虎8PRO冠军版', [
        ['pre3', '2.0', 'ruihu8proPre3', 0],
        ['post3', '3.0及以上', 'ruihu8proPost3', 1],
        ['latest', '最新版本', 'ruihuRandomCode', 0]
      ]]
    ];
    cars.forEach(([key, name, versions]) => {
      const info = insertCar.run(key, name);
      versions.forEach(v => insertVersion.run(info.lastInsertRowid, ...v));
    });

    const insertAlgo = db.prepare('INSERT INTO algorithms (algo_key, algo_name, countdown, need_serial, need_vin) VALUES (?, ?, ?, ?, ?)');
    const algos = [
      ['serialNumber', '序列号算法', 'none', 1, 0],
      ['dynamic230830', '230830动态算法', 'hourly', 0, 0],
      ['dynamic250110', '250110动态算法', 'hourly', 0, 0],
      ['dynamic250930', '250930动态算法', 'hourly', 0, 0],
      ['serialNumberDaily', '序列号每日算法', 'daily', 0, 0],
      ['hu8Daily', '虎8每日算法', 'daily', 1, 1],
      ['ruihuRandomCode', '瑞虎随机码算法', 'none', 1, 0],
      ['ruihu8proPre3', '瑞虎8PRO 2.0', 'daily', 1, 1],
      ['ruihu8proPost3', '瑞虎8PRO 3.0+', 'daily', 1, 1]
    ];
    algos.forEach(a => insertAlgo.run(...a));
  }
}

module.exports = { db, initDatabase };
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const { initDatabase } = require('./database');

const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const algoRoutes = require('./routes/algorithms');
const constRoutes = require('./routes/constants');
const logRoutes = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化数据库
initDatabase();

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/algorithms', algoRoutes);
app.use('/api/constants', constRoutes);
app.use('/api/logs', logRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ 后端服务已启动：http://localhost:${PORT}`);
});
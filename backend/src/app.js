const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const StatsD = require('node-statsd');
const client = require('prom-client');
require('dotenv').config();

const app = express();

// Prometheus: стандартные метрики процесса (CPU, память, event loop и т.д.)
const metricsRegister = new client.Registry();
client.collectDefaultMetrics({ register: metricsRegister, prefix: 'dentlux_' });

// Graphite/StatsD Client (в тестах без Docker хоста `graphite` нет — не шлём UDP)
const statsd = new StatsD({
  host: process.env.STATSD_HOST || 'graphite',
  port: parseInt(process.env.STATSD_PORT, 10) || 8125,
  prefix: 'dentlux.',
  mock: process.env.NODE_ENV === 'test' || process.env.STATSD_MOCK === 'true',
});

// Middleware для мониторинга запросов
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const path = req.path.replace(/\//g, '_').replace(/^_/, '') || 'root';
    statsd.increment(`requests.count`);
    statsd.increment(`requests.path.${path}.count`);
    statsd.timing(`requests.path.${path}.duration`, duration);
    statsd.increment(`requests.status.${res.statusCode}.count`);
  });
  next();
});

// Security middleware - helmet для защиты заголовков
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Для API
}));

// CORS configuration - улучшенная настройка
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || 
  (process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173', 'http://localhost:3000']);

app.use(cors({
  origin: (origin, callback) => {
    // Разрешить запросы без origin (мобильные приложения, Postman и т.д.) только в development
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Automation-Secret'],
  maxAge: 86400, // 24 часа
}));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Импорт Prisma Client
const prisma = require('./config/database');

// Проверка подключения к базе данных при старте (не блокируем запуск сервера)
prisma.$connect().catch(err => {
  console.warn('⚠️  Предупреждение: не удалось подключиться к базе данных при старте:', err.message);
  console.warn('   Сервер продолжит работу, подключение будет установлено при первом запросе');
});

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DentReserve Pro API',
    version: '1.0.0',
  });
});

// Метрики для Prometheus (job `backend` в prometheus.yml)
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metricsRegister.contentType);
    res.end(await metricsRegister.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Health check маршрут
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Rate limiting middleware
const { authLimiter, apiLimiter } = require('./middlewares/rateLimiter');

// Apply general API rate limiting
app.use('/api', apiLimiter);

// API маршруты
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authLimiter, authRoutes);

const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

const clientRoutes = require('./routes/clientRoutes');
app.use('/api/clients', clientRoutes);

const doctorRoutes = require('./routes/doctorRoutes');
app.use('/api/doctors', doctorRoutes);

const serviceRoutes = require('./routes/serviceRoutes');
app.use('/api/services', serviceRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

const refundRoutes = require('./routes/refundRoutes');
app.use('/api/refunds', refundRoutes);

const expenseRoutes = require('./routes/expenseRoutes');
app.use('/api/expenses', expenseRoutes);

const profileRoutes = require('./routes/profileRoutes');
const path = require('path');

// Статическая раздача загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/profile', profileRoutes);

const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contact', contactRoutes);

const scheduleRoutes = require('./routes/scheduleRoutes');
app.use('/api/schedule', scheduleRoutes);

const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
app.use('/api/medical-records', medicalRecordRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const auditLogRoutes = require('./routes/auditLogRoutes');

const clientBlockRoutes = require('./routes/clientBlockRoutes');
app.use('/api/client-blocks', clientBlockRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// API Documentation (опционально, если установлены swagger модули)
try {
  const docsRoutes = require('./routes/docsRoutes');
  app.use('/api-docs', docsRoutes);
} catch (error) {
  console.warn('⚠️  Swagger документация недоступна. Установите зависимости: npm install swagger-ui-express swagger-jsdoc');
}

// Payment Gateway
const paymentGatewayRoutes = require('./routes/paymentGatewayRoutes');
app.use('/api/payments/gateway', paymentGatewayRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

const automationRoutes = require('./routes/automationRoutes');
app.use('/api/automation', automationRoutes);

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;

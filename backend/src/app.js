const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

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
  allowedHeaders: ['Content-Type', 'Authorization'],
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

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DentReserve Pro API',
      version: '1.0.0',
      description: 'API документация для системы записи к стоматологу DentReserve Pro',
      contact: {
        name: 'API Support',
        email: 'support@dentreserve.kz',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.dentreserve.kz/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Ошибка валидации',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            fullName: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['CLIENT', 'DOCTOR', 'ADMIN'],
            },
            phone: {
              type: 'string',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            clientId: {
              type: 'string',
              format: 'uuid',
            },
            doctorId: {
              type: 'string',
              format: 'uuid',
            },
            serviceId: {
              type: 'string',
              format: 'uuid',
            },
            appointmentDate: {
              type: 'string',
              format: 'date',
            },
            appointmentTime: {
              type: 'string',
              format: 'time',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'ARRIVED', 'VISITED', 'COMPLETED', 'CANCELLED', 'MISSED', 'DONE'],
            },
            notes: {
              type: 'string',
              nullable: true,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Путь к файлам с маршрутами
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

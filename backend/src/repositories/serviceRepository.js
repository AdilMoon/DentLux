const prisma = require('../config/database');

class ServiceRepository {
  // Получить все активные услуги
  async findAll() {
    return await prisma.service.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // Получить все услуги (включая неактивные) - для админа
  async findAllForAdmin() {
    return await prisma.service.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  // Найти по ID
  async findById(id) {
    return await prisma.service.findUnique({
      where: { id },
    });
  }

  // Создать услугу
  async create(data) {
    const { name, description, durationMinutes, price, isActive } = data;
    return await prisma.service.create({
      data: {
        name,
        description: description || null,
        durationMinutes: parseInt(durationMinutes) || 30,
        price: parseFloat(price),
        isActive: isActive !== undefined ? isActive : true,
      },
    });
  }

  // Обновить услугу
  async update(id, data) {
    const { name, description, durationMinutes, price, isActive } = data;
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (durationMinutes !== undefined) updateData.durationMinutes = parseInt(durationMinutes);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (isActive !== undefined) updateData.isActive = isActive;

    return await prisma.service.update({
      where: { id },
      data: updateData,
    });
  }

  // Удалить услугу (мягкое удаление через isActive)
  async delete(id) {
    return await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

module.exports = new ServiceRepository();

const clientBlockRepository = require('../repositories/clientBlockRepository');
const AppError = require('../utils/errors');

class ClientBlockService {
  // Заблокировать клиента
  async blockClient(clientId, adminId, reason, appointmentId) {
    // Проверяем, не заблокирован ли уже клиент
    const existingBlock = await clientBlockRepository.findActiveByClientId(clientId);
    if (existingBlock) {
      throw new AppError('Клиент уже заблокирован', 400);
    }

    const block = await clientBlockRepository.create({
      clientId,
      blockedBy: adminId,
      reason,
      appointmentId,
      isActive: true,
    });

    return this.formatBlock(block);
  }

  // Разблокировать клиента
  async unblockClient(blockId, adminId) {
    const block = await clientBlockRepository.findById(blockId);
    if (!block) {
      throw new AppError('Блокировка не найдена', 404);
    }

    if (!block.isActive) {
      throw new AppError('Клиент уже разблокирован', 400);
    }

    const updatedBlock = await clientBlockRepository.update(blockId, {
      isActive: false,
      unblockedAt: new Date(),
      unblockedBy: adminId,
    });

    return this.formatBlock(updatedBlock);
  }

  // Получить все активные блокировки
  async getActiveBlocks() {
    const blocks = await clientBlockRepository.findActive();
    return blocks.map(block => this.formatBlock(block));
  }

  // Получить блокировки клиента
  async getClientBlocks(clientId) {
    const blocks = await clientBlockRepository.findByClientId(clientId);
    return blocks.map(block => this.formatBlock(block));
  }

  // Проверить, заблокирован ли клиент
  async isClientBlocked(clientId) {
    const block = await clientBlockRepository.findActiveByClientId(clientId);
    return !!block;
  }

  // Форматировать блокировку для ответа
  formatBlock(block) {
    return {
      id: block.id,
      clientId: block.clientId,
      clientName: block.client?.fullName || null,
      clientEmail: block.client?.email || null,
      blockedBy: block.blockedBy,
      blockedByName: block.blockedByUser?.fullName || null,
      reason: block.reason,
      appointmentId: block.appointmentId,
      isActive: block.isActive,
      createdAt: block.createdAt,
      unblockedAt: block.unblockedAt,
      unblockedBy: block.unblockedBy,
      unblockedByName: block.unblockedByUser?.fullName || null,
    };
  }
}

module.exports = new ClientBlockService();

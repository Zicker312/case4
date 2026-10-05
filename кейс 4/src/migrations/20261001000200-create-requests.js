export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('maintenance_requests', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    equipment_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'equipment', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
    title: { type: Sequelize.STRING(120), allowNull: false },
    description: { type: Sequelize.TEXT },
    priority: { type: Sequelize.ENUM('low', 'medium', 'high', 'critical'), allowNull: false, defaultValue: 'medium' },
    status: { type: Sequelize.ENUM('new', 'in_progress', 'done', 'rejected'), allowNull: false, defaultValue: 'new' },
    planned_at: { type: Sequelize.DATE },
    author: { type: Sequelize.STRING(120) },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
  });
  await queryInterface.createTable('request_status_history', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    request_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'maintenance_requests', key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
    old_status: { type: Sequelize.ENUM('new', 'in_progress', 'done', 'rejected') },
    new_status: { type: Sequelize.ENUM('new', 'in_progress', 'done', 'rejected'), allowNull: false },
    author: { type: Sequelize.STRING(120) },
    comment: { type: Sequelize.STRING(500) },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
  });
  await queryInterface.createTable('request_assignees', {
    request_id: { type: Sequelize.UUID, allowNull: false, primaryKey: true, references: { model: 'maintenance_requests', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
    technician_id: { type: Sequelize.UUID, allowNull: false, primaryKey: true, references: { model: 'technicians', key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
    role: { type: Sequelize.ENUM('lead', 'member'), allowNull: false },
    hours: { type: Sequelize.DECIMAL(8, 2), allowNull: false, defaultValue: 1 }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('request_assignees');
  await queryInterface.dropTable('request_status_history');
  await queryInterface.dropTable('maintenance_requests');
  for (const type of ['enum_request_assignees_role', 'enum_request_status_history_new_status', 'enum_request_status_history_old_status', 'enum_maintenance_requests_status', 'enum_maintenance_requests_priority']) {
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${type}";`);
  }
}

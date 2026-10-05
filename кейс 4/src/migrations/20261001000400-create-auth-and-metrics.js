export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('users', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
    password_hash: { type: Sequelize.STRING(255), allowNull: false },
    role: { type: Sequelize.ENUM('viewer','technician','admin'), allowNull: false, defaultValue: 'viewer' },
    technician_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'technicians', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
  });
  await queryInterface.createTable('refresh_sessions', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
    token_hash: { type: Sequelize.STRING(64), allowNull: false, unique: true },
    expires_at: { type: Sequelize.DATE, allowNull: false },
    revoked_at: { type: Sequelize.DATE, allowNull: true },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
  });
  await queryInterface.createTable('api_request_metrics', {
    id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    request_id: { type: Sequelize.STRING(80), allowNull: false },
    method: { type: Sequelize.STRING(10), allowNull: false },
    route: { type: Sequelize.STRING(255), allowNull: false },
    status_code: { type: Sequelize.INTEGER, allowNull: false },
    duration_ms: { type: Sequelize.DECIMAL(12,3), allowNull: false },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
  });
  await queryInterface.addIndex('refresh_sessions', ['user_id']);
  await queryInterface.addIndex('refresh_sessions', ['expires_at']);
  await queryInterface.addIndex('api_request_metrics', ['created_at']);
  await queryInterface.addIndex('api_request_metrics', ['route','status_code']);
}
export async function down(queryInterface) {
  await queryInterface.dropTable('api_request_metrics'); await queryInterface.dropTable('refresh_sessions'); await queryInterface.dropTable('users');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
}

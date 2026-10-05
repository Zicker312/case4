export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  await queryInterface.createTable('sites', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    name: { type: Sequelize.STRING(120), allowNull: false },
    code: { type: Sequelize.STRING(30), allowNull: false, unique: true },
    region: { type: Sequelize.STRING(100), allowNull: false },
    latitude: { type: Sequelize.DECIMAL(9, 6), allowNull: false },
    longitude: { type: Sequelize.DECIMAL(9, 6), allowNull: false },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
  });
  await queryInterface.createTable('equipment', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    site_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'sites', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
    name: { type: Sequelize.STRING(100), allowNull: false },
    type: { type: Sequelize.ENUM('turbine', 'inverter', 'sensor', 'substation'), allowNull: false },
    serial_number: { type: Sequelize.STRING(100), allowNull: false, unique: true },
    status: { type: Sequelize.ENUM('operational', 'maintenance', 'fault', 'decommissioned'), allowNull: false, defaultValue: 'operational' },
    location_lat: { type: Sequelize.DECIMAL(9, 6), allowNull: false },
    location_lon: { type: Sequelize.DECIMAL(9, 6), allowNull: false },
    installed_at: { type: Sequelize.DATE, allowNull: false },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
  });
  await queryInterface.createTable('equipment_passports', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    equipment_id: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'equipment', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    manufacturer: { type: Sequelize.STRING(120), allowNull: false },
    model: { type: Sequelize.STRING(120), allowNull: false },
    rated_power: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
    last_calibration_at: { type: Sequelize.DATE, allowNull: true }
  });
  await queryInterface.createTable('technicians', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    full_name: { type: Sequelize.STRING(150), allowNull: false },
    specialization: { type: Sequelize.STRING(120), allowNull: false },
    employee_number: { type: Sequelize.STRING(50), allowNull: false, unique: true },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('equipment_passports');
  await queryInterface.dropTable('equipment');
  await queryInterface.dropTable('technicians');
  await queryInterface.dropTable('sites');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_equipment_type";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_equipment_status";');
}

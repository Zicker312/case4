export async function up(queryInterface) {
  await queryInterface.addIndex('equipment', ['site_id']);
  await queryInterface.addIndex('maintenance_requests', ['equipment_id', 'status']);
  await queryInterface.addIndex('maintenance_requests', ['priority']);
  await queryInterface.addIndex('request_status_history', ['request_id', 'created_at']);
}

export async function down(queryInterface) {
  await queryInterface.removeIndex('equipment', ['site_id']);
  await queryInterface.removeIndex('maintenance_requests', ['equipment_id', 'status']);
  await queryInterface.removeIndex('maintenance_requests', ['priority']);
  await queryInterface.removeIndex('request_status_history', ['request_id', 'created_at']);
}

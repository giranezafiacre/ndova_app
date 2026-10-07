import { DataTypes, QueryInterface } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.addColumn('appointments', 'providerServiceId', {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'provider_service', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addColumn('appointments', 'durationMinutes', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('appointments', 'sessionType', {
      type: DataTypes.STRING(20),
      allowNull: true,
    });
    await queryInterface.addColumn('appointments', 'location', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('appointments', 'meetingLink', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.removeColumn('appointments', 'meetingLink');
    await queryInterface.removeColumn('appointments', 'location');
    await queryInterface.removeColumn('appointments', 'sessionType');
    await queryInterface.removeColumn('appointments', 'durationMinutes');
    await queryInterface.removeColumn('appointments', 'providerServiceId');
  },
};

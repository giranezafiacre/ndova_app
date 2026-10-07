import { DataTypes, QueryInterface } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.addColumn('provider_service', 'imageUrl', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('provider_service', 'meetingLink', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.removeColumn('provider_service', 'meetingLink');
    await queryInterface.removeColumn('provider_service', 'imageUrl');
  },
};

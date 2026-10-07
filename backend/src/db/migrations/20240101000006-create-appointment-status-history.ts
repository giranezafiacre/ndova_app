import { QueryInterface, DataTypes } from 'sequelize';

const STATUS_VALUES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'];

module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('appointment_status_history', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      appointmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'appointments', key: 'id' },
        onDelete: 'CASCADE',
      },
      previousStatus: {
        type: DataTypes.ENUM(...STATUS_VALUES),
        allowNull: true,
      },
      newStatus: {
        type: DataTypes.ENUM(...STATUS_VALUES),
        allowNull: false,
      },
      changedById: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('appointment_status_history');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_appointment_status_history_previousStatus"'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_appointment_status_history_newStatus"'
    );
  },
};

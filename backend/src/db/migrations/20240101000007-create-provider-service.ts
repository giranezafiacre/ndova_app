import { DataTypes, QueryInterface } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('provider_service', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'services', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      providerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      stars: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      durationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addConstraint('provider_service', {
      fields: ['serviceId', 'providerId'],
      type: 'unique',
      name: 'provider_service_service_provider_unique',
    });

    await queryInterface.sequelize.query(`
      INSERT INTO "provider_service"
        ("id", "serviceId", "providerId", "location", "description", "stars", "durationMinutes", "createdAt", "updatedAt")
      SELECT
        gen_random_uuid(),
        service.id,
        user_role."userId",
        'Location not specified',
        COALESCE(service.description, service.name),
        0,
        service."durationMinutes",
        NOW(),
        NOW()
      FROM services AS service
      CROSS JOIN user_roles AS user_role
      INNER JOIN roles AS role ON role.id = user_role."roleId"
      WHERE role.name = 'PROVIDER'
      ON CONFLICT ("serviceId", "providerId") DO NOTHING
    `);

    await queryInterface.removeColumn('services', 'durationMinutes');
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.addColumn('services', 'durationMinutes', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    });
    await queryInterface.dropTable('provider_service');
  },
};

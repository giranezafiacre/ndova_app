import { QueryInterface } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.sequelize.query(`
      ALTER TABLE "appointments"
        DROP CONSTRAINT IF EXISTS "appointments_clientId_fkey",
        ADD CONSTRAINT "appointments_clientId_fkey"
          FOREIGN KEY ("clientId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        DROP CONSTRAINT IF EXISTS "appointments_providerId_fkey",
        ADD CONSTRAINT "appointments_providerId_fkey"
          FOREIGN KEY ("providerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

      ALTER TABLE "appointment_status_history"
        DROP CONSTRAINT IF EXISTS "appointment_status_history_changedById_fkey",
        ADD CONSTRAINT "appointment_status_history_changedById_fkey"
          FOREIGN KEY ("changedById") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.sequelize.query(`
      ALTER TABLE "appointments"
        DROP CONSTRAINT IF EXISTS "appointments_clientId_fkey",
        ADD CONSTRAINT "appointments_clientId_fkey"
          FOREIGN KEY ("clientId") REFERENCES "users" ("id"),
        DROP CONSTRAINT IF EXISTS "appointments_providerId_fkey",
        ADD CONSTRAINT "appointments_providerId_fkey"
          FOREIGN KEY ("providerId") REFERENCES "users" ("id");

      ALTER TABLE "appointment_status_history"
        DROP CONSTRAINT IF EXISTS "appointment_status_history_changedById_fkey",
        ADD CONSTRAINT "appointment_status_history_changedById_fkey"
          FOREIGN KEY ("changedById") REFERENCES "users" ("id");
    `);
  },
};

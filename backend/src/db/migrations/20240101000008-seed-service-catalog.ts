import { QueryInterface } from 'sequelize';

const services = [
  ['Medical Consultation', 'Professional medical consultations and healthcare guidance.'],
  ['Legal Advisory', 'Legal guidance, document review, and professional advisory services.'],
  ['Accounting & Tax', 'Accounting, bookkeeping, tax preparation, and compliance services.'],
  ['Architecture & Design', 'Architectural planning, design, and project consultation services.'],
  ['Civil Engineering', 'Civil engineering consultation, planning, and project support.'],
  ['Software Development', 'Custom software, web, mobile, and technical development services.'],
  ['Education & Tutoring', 'Academic tutoring, training, and educational support services.'],
  ['Dental Care', 'Professional dental consultation, treatment, and preventive care.'],
  ['Physiotherapy', 'Physical rehabilitation, mobility, and pain-management services.'],
  ['Real Estate', 'Property sales, rentals, valuation, and real-estate advisory services.'],
  ['Financial Planning', 'Personal and business financial planning and advisory services.'],
  ['Electrical Works', 'Electrical installation, repair, and maintenance services.'],
  ['Plumbing & Sanitation', 'Plumbing installation, repair, and sanitation services.'],
  ['Hair & Beauty', 'Hair styling, grooming, skincare, and beauty services.'],
  ['Photography & Events', 'Photography, videography, and event support services.'],
  ['Cleaning Services', 'Residential, commercial, and specialized cleaning services.'],
] as const;

function deterministicUuid(name: string): string {
  const escapedName = name.replace(/'/g, "''");
  return `md5('ndova-service-catalog:${escapedName}')`;
}

module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    for (const [name, description] of services) {
      await queryInterface.sequelize.query(`
        INSERT INTO services
          (id, name, description, "isActive", "createdAt", "updatedAt")
        SELECT
          (
            substr(${deterministicUuid(name)}, 1, 8) || '-' ||
            substr(${deterministicUuid(name)}, 9, 4) || '-' ||
            substr(${deterministicUuid(name)}, 13, 4) || '-' ||
            substr(${deterministicUuid(name)}, 17, 4) || '-' ||
            substr(${deterministicUuid(name)}, 21, 12)
          )::uuid,
          :name,
          :description,
          true,
          NOW(),
          NOW()
        WHERE NOT EXISTS (
          SELECT 1 FROM services WHERE LOWER(name) = LOWER(:name)
        )
      `, {
        replacements: { name, description },
      });
    }
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    for (const [name] of services) {
      await queryInterface.sequelize.query(`
        DELETE FROM services
        WHERE id = (
          substr(${deterministicUuid(name)}, 1, 8) || '-' ||
          substr(${deterministicUuid(name)}, 9, 4) || '-' ||
          substr(${deterministicUuid(name)}, 13, 4) || '-' ||
          substr(${deterministicUuid(name)}, 17, 4) || '-' ||
          substr(${deterministicUuid(name)}, 21, 12)
        )::uuid
      `);
    }
  },
};

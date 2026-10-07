// Global test setup — runs once before all test suites.
// Database seeding and teardown will be added in later stages.
export default async function globalSetup() {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.BCRYPT_SALT_ROUNDS = '1'; // Fast hashing for tests
}

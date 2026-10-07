// Runs in the test process before each test file is loaded.
// dotenv.config() inside config/env.ts won't overwrite already-set env vars,
// so these values take priority over .env during the test run.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_not_for_production';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_SALT_ROUNDS = '1'; // Fast hashing — never use 1 in production

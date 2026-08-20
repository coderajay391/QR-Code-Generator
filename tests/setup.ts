(process.env as Record<string, string | undefined>).NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_jest_tests_2026';
process.env.RATE_LIMIT_MAX_PUBLIC = '1000';
process.env.RATE_LIMIT_MAX_AUTH = '1000';

// Never inherit production credentials, even when tests are run from a developer shell.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/ilovesurprises_test';
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.JWT_SECRET = 'unit-only-randomized-fixture-0a9b8c7d6e5f';
process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
process.env.STRIPE_SECRET_KEY = 'sk_test_fixture_not_a_real_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_unit_fixture';

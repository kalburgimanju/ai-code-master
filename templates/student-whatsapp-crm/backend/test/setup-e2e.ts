// Runs before any module is imported, so TypeOrmModule.forRoot picks up the
// isolated test database. Required because ES module imports are hoisted above
// top-level statements in the spec file.
process.env.WHATSAPP_PROVIDER = 'mock';
process.env.AI_PROVIDER = 'mock';
process.env.PAYMENT_PROVIDER = 'mock';
process.env.CRM_TEST_DB = require('path').join(
  process.cwd(),
  'data',
  `e2e-${Date.now()}.db`,
);

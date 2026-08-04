// The database module reads DATABASE_URL during module initialization. Set the
// test connection before test modules are imported instead of mutating it in hooks.
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
  || 'postgresql://alas_user:change-this-strong-password@localhost:5433/alas'

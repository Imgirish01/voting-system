let app;
try {
  app = require('../backend/src/app');
} catch (e) {
  try {
    app = require('../frontend/api/backend/src/app');
  } catch (err) {
    console.error('Failed to load backend app:', err);
  }
}

module.exports = app;

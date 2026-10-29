let app;
try {
  app = require('./src/app');
} catch (e1) {
  try {
    app = require('./backend/src/app');
  } catch (e2) {
    app = require('../../backend/src/app');
  }
}

module.exports = app;

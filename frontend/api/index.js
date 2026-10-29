const path = require('path');

let app;
try {
  app = require(path.join(__dirname, 'backend/src/app'));
} catch (e) {
  try {
    app = require(path.join(__dirname, '../../backend/src/app'));
  } catch (err) {
    console.error('Failed to load backend app:', err);
  }
}

module.exports = app;

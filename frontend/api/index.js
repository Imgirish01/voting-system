const path = require('path');

let app;
try {
  app = require(path.join(__dirname, 'backend/src/app'));
} catch (e1) {
  try {
    app = require(path.join(__dirname, '../../backend/src/app'));
  } catch (err) {
    console.error('Failed to load backend app in frontend/api/index.js:', err);
  }
}

function handler(req, res) {
  if (!app) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Backend application failed to initialize' }));
  }
  return app(req, res);
}

module.exports = handler;
module.exports.default = handler;

// Root entrypoint for Cloud Deployments (Render, Railway, Heroku)
// This ensures 'node server.js' and 'npm start' work identically from repo root.

require('./backend/server.js');

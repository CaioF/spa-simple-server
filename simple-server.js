// Check node version.
if (Number(process.version.slice(1).split('.')[0]) < 10) throw new Error('Node 10.0.0 or higher is required. Update your Node');

// Load basic libraries
const fs = require('fs');
client.logger = require('./modules/logger');
// Adds Google's push file (google-services.json) automatically once it is in this folder.
const fs = require('fs');

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    ...(fs.existsSync('./google-services.json') ? { googleServicesFile: './google-services.json' } : {}),
  },
});

// The user-facing app version is sourced from package.json so a single
// `npm version patch|minor|major` bumps it (and git-tags the release). Everything
// else still lives in app.json — Expo reads app.json first and passes it here as
// `config`. EAS keeps auto-incrementing the iOS/Android build numbers via eas.json
// (`autoIncrement`), independent of this marketing version.
const pkg = require("./package.json");

module.exports = ({ config }) => ({
  ...config,
  version: pkg.version,
});

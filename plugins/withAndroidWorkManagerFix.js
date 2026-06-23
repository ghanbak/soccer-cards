// Config plugin: resolve a duplicate-class clash in androidx.work. react-native-
// android-widget requires work-runtime:2.8.1, but an old work-runtime-ktx:2.7.1 is
// still pulled in transitively. WorkManager 2.8.0 merged the -ktx classes into the
// main artifact, so 2.7.1's -ktx duplicates classes like OneTimeWorkRequestKt and
// the build fails at :app:checkDebugDuplicateClasses. Force both onto 2.8.1 (the
// 2.8.1 -ktx is an empty stub → no duplicates).
//
// android/ is gitignored/prebuild-generated, so this re-injects the block on every
// prebuild (idempotent via a marker comment).

const { withAppBuildGradle } = require("@expo/config-plugins");

const MARKER = "// bookem: align androidx.work (duplicate-class fix)";
const BLOCK = `
${MARKER}
configurations.all {
    resolutionStrategy {
        force 'androidx.work:work-runtime:2.8.1'
        force 'androidx.work:work-runtime-ktx:2.8.1'
    }
}
`;

module.exports = (config) =>
  withAppBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes(MARKER)) {
      cfg.modResults.contents = `${cfg.modResults.contents.trimEnd()}\n${BLOCK}`;
    }
    return cfg;
  });

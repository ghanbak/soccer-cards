// Config plugin: static Android app shortcuts (long-press the launcher icon →
// "Flash Yellow" / "Flash Red"). Each shortcut fires an ACTION_VIEW intent at
// MainActivity with a bookem://<side> deep link — the same seam every other
// surface uses (cardLink.ts → select). No runtime code, no extra dependency.
//
// android/ is gitignored and prebuild-generated, so this re-writes res/xml/
// shortcuts.xml + a shortcut icon and re-adds the <meta-data> + string resources
// on every `expo prebuild`.

const { withAndroidManifest, withStringsXml, withDangerousMod, AndroidConfig } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const PACKAGE = "com.ghanbak.bookem";
const SHORTCUTS_RESOURCE = "@xml/shortcuts";
const SHORTCUTS_META = "android.app.shortcuts";

const SHORTCUTS = [
  { id: "yellow", uri: "bookem://yellow", short: "Yellow", long: "Flash Yellow" },
  { id: "red", uri: "bookem://red", short: "Red", long: "Flash Red" },
];

const SHORTCUTS_XML = `<?xml version="1.0" encoding="utf-8"?>
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">
${SHORTCUTS.map(
  (s) => `  <shortcut
    android:shortcutId="${s.id}"
    android:enabled="true"
    android:icon="@drawable/ic_shortcut_card"
    android:shortcutShortLabel="@string/shortcut_${s.id}_short"
    android:shortcutLongLabel="@string/shortcut_${s.id}_long">
    <intent
      android:action="android.intent.action.VIEW"
      android:targetPackage="${PACKAGE}"
      android:targetClass="${PACKAGE}.MainActivity"
      android:data="${s.uri}" />
  </shortcut>`,
).join("\n")}
</shortcuts>
`;

// Monochrome rounded-rectangle "card" glyph; launchers tint/mask it.
const SHORTCUT_ICON = `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M8,2 L16,2 C17.66,2 19,3.34 19,5 L19,19 C19,20.66 17.66,22 16,22 L8,22 C6.34,22 5,20.66 5,19 L5,5 C5,3.34 6.34,2 8,2 Z" />
</vector>
`;

function withShortcutStrings(config) {
  return withStringsXml(config, (cfg) => {
    for (const s of SHORTCUTS) {
      cfg.modResults = AndroidConfig.Strings.setStringItem(
        [
          { $: { name: `shortcut_${s.id}_short`, translatable: "false" }, _: s.short },
          { $: { name: `shortcut_${s.id}_long`, translatable: "false" }, _: s.long },
        ],
        cfg.modResults,
      );
    }
    return cfg;
  });
}

function withShortcutMeta(config) {
  return withAndroidManifest(config, (cfg) => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(cfg.modResults);
    activity["meta-data"] = activity["meta-data"] ?? [];
    const exists = activity["meta-data"].some(
      (m) => m.$?.["android:name"] === SHORTCUTS_META,
    );
    if (!exists) {
      activity["meta-data"].push({
        $: { "android:name": SHORTCUTS_META, "android:resource": SHORTCUTS_RESOURCE },
      });
    }
    return cfg;
  });
}

function withShortcutResources(config) {
  return withDangerousMod(config, [
    "android",
    (cfg) => {
      const root = cfg.modRequest.platformProjectRoot;
      const xmlDir = path.join(root, "app/src/main/res/xml");
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.writeFileSync(path.join(xmlDir, "shortcuts.xml"), SHORTCUTS_XML);
      const drawableDir = path.join(root, "app/src/main/res/drawable");
      fs.mkdirSync(drawableDir, { recursive: true });
      fs.writeFileSync(path.join(drawableDir, "ic_shortcut_card.xml"), SHORTCUT_ICON);
      return cfg;
    },
  ]);
}

module.exports = (config) =>
  withShortcutResources(withShortcutMeta(withShortcutStrings(config)));

#!/usr/bin/env node

/**
 * Fix for react-native-maps marker icon caching issue
 *
 * This script applies a patch to MapMarker.java to prevent marker flickering
 * by implementing icon caching that only sets the marker icon once.
 *
 * Related to: react-native-maps marker flickering issues
 *
 * Usage: node scripts/fix-marker-icon-caching.js
 */

const fs = require("fs");
const path = require("path");

const MARKER_FILE_PATH = path.join(
  __dirname,
  "../node_modules/react-native-maps/android/src/main/java/com/rnmaps/maps/MapMarker.java"
);

function applyMarkerIconCachingFix() {
  console.log("🔧 Applying marker icon caching fix...");

  if (!fs.existsSync(MARKER_FILE_PATH)) {
    console.error("❌ MapMarker.java not found at:", MARKER_FILE_PATH);
    process.exit(1);
  }

  let content = fs.readFileSync(MARKER_FILE_PATH, "utf8");

  // Check if already patched
  if (content.includes("private BitmapDescriptor markerIcon;")) {
    console.log("✅ Marker icon caching fix already applied");
    return;
  }

  console.log("📝 Applying marker icon caching patch...");

  // Add markerIcon field
  content = content.replace(
    /private float markerHue = 0\.0f; \/\/ should be between 0 and 360\s*\n\s*private BitmapDescriptor iconBitmapDescriptor;\s*\n\s*private Bitmap iconBitmap;/,
    `private float markerHue = 0.0f; // should be between 0 and 360
    private BitmapDescriptor iconBitmapDescriptor;
    private BitmapDescriptor markerIcon;
    private Bitmap iconBitmap;`
  );

  // Update updateMarkerIcon method
  content = content.replace(
    /public void updateMarkerIcon\(\) \{[\s\S]*?if \(marker == null\) return;[\s\S]*?\}/,
    `public void updateMarkerIcon() {
        if (marker == null) return;
        if (markerIcon == null) {
            markerIcon = getIcon();
            marker.setIcon(markerIcon);
        }    
    }`
  );

  // Ensure onLayout method exists (should already be there from previous patches)
  if (
    !content.includes(
      "protected void onLayout(boolean changed, int l, int t, int r, int b)"
    )
  ) {
    // Add onLayout method before the closing brace
    content = content.replace(
      /}\s*$/,
      `
    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        super.onLayout(changed, l, t, r, b);
        this.height = b-t;
        this.width = r-l;
    }

}`
    );
  }

  fs.writeFileSync(MARKER_FILE_PATH, content);
  console.log("✅ Marker icon caching fix applied successfully");
}

function main() {
  try {
    applyMarkerIconCachingFix();
    console.log("🎉 All marker icon caching fixes applied successfully!");
  } catch (error) {
    console.error("❌ Error applying marker icon caching fix:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { applyMarkerIconCachingFix };

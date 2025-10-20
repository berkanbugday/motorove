#!/usr/bin/env node

/**
 * Fix for react-native-maps Android showsMyLocationButton bug
 * 
 * This script fixes the issue where showsMyLocationButton={false} doesn't work
 * on Android when showsUserLocation={true}
 * 
 * Bug: Google Maps automatically shows the location button when user location
 * is enabled, ignoring the showsMyLocationButton prop
 * 
 * Fix: 
 * 1. Store the desired button state
 * 2. Always apply the setting (remove permission check)
 * 3. Re-apply setting when user location is enabled
 */

const fs = require('fs');
const path = require('path');

const mapViewPath = path.join(__dirname, '../node_modules/react-native-maps/android/src/main/java/com/rnmaps/maps/MapView.java');

console.log('🔧 Fixing Android showsMyLocationButton bug...');

if (!fs.existsSync(mapViewPath)) {
  console.error('❌ MapView.java not found. Make sure react-native-maps is installed.');
  process.exit(1);
}

let content = fs.readFileSync(mapViewPath, 'utf8');

// Check if already fixed
if (content.includes('private boolean showsMyLocationButton = true;')) {
  console.log('✅ Fix already applied!');
  
  // Check for and fix any duplicate declarations
  const duplicateVarRegex = /(private boolean showsMyLocationButton = true;\s*private boolean showsMyLocationButton = false;)/g;
  if (content.match(duplicateVarRegex)) {
    console.log('🔧 Fixing duplicate variable declarations...');
    content = content.replace(duplicateVarRegex, 'private boolean showsMyLocationButton = true;');
  }
  
  // Check for and fix any duplicate method calls
  const duplicateCallRegex = /(\/\/ Re-apply location button setting after enabling user location\s*map\.getUiSettings\(\)\.setMyLocationButtonEnabled\(this\.showsMyLocationButton\);\s*\/\/ Re-apply location button setting after enabling user location\s*map\.getUiSettings\(\)\.setMyLocationButtonEnabled\(this\.showsMyLocationButton\);)/g;
  if (content.match(duplicateCallRegex)) {
    console.log('🔧 Fixing duplicate method calls...');
    content = content.replace(duplicateCallRegex, '// Re-apply location button setting after enabling user location\n            map.getUiSettings().setMyLocationButtonEnabled(this.showsMyLocationButton);');
  }
  
  // Write back if any duplicates were found and fixed
  if (content !== fs.readFileSync(mapViewPath, 'utf8')) {
    fs.writeFileSync(mapViewPath, content);
    console.log('✅ Duplicates fixed!');
  }
  
  process.exit(0);
}

// 1. Add state variable
const stateVarRegex = /(private boolean showUserLocation = false;)/;
const stateVarReplacement = `$1
    private boolean showsMyLocationButton = true;`;

// 2. Fix setShowsUserLocation method
const setShowsUserLocationRegex = /(public void setShowsUserLocation\(boolean showUserLocation\) \{[\s\S]*?if \(hasPermissions\(\) && map != null\) \{)/;
const setShowsUserLocationReplacement = `$1
            // Re-apply location button setting after enabling user location
            map.getUiSettings().setMyLocationButtonEnabled(this.showsMyLocationButton);`;

// 3. Fix setShowsMyLocationButton method
const setShowsMyLocationButtonRegex = /(public void setShowsMyLocationButton\(boolean showMyLocationButton\) \{[\s\S]*?if \(map != null\) \{[\s\S]*?if \(hasPermissions\(\) \|\| !showMyLocationButton\) \{[\s\S]*?map\.getUiSettings\(\)\.setMyLocationButtonEnabled\(showMyLocationButton\);[\s\S]*?\}[\s\S]*?\})/;
const setShowsMyLocationButtonReplacement = `public void setShowsMyLocationButton(boolean showMyLocationButton) {
        this.showsMyLocationButton = showMyLocationButton;
        if (map != null) {
            // Always apply the setting regardless of permissions
            // The button should be hidden even if user location is shown
            map.getUiSettings().setMyLocationButtonEnabled(showMyLocationButton);
        }`;

// Apply fixes
content = content.replace(stateVarRegex, stateVarReplacement);
content = content.replace(setShowsUserLocationRegex, setShowsUserLocationReplacement);
content = content.replace(setShowsMyLocationButtonRegex, setShowsMyLocationButtonReplacement);

// Write back
fs.writeFileSync(mapViewPath, content);

console.log('✅ Android showsMyLocationButton bug fixed!');
console.log('📱 Now you can use:');
console.log('   showsUserLocation={true}');
console.log('   showsMyLocationButton={false}');
console.log('🚀 Rebuild your Android app to see the changes.');

# Complete App Rebuild Guide - Step by Step

## PowerShell Commands for Complete Rebuild:

```powershell
# Navigate to your project directory
cd D:\native\meow\my-app\my-app

# Step 1: Clean Metro bundler cache
npx expo start --clear

# Press Ctrl+C to stop after it starts

# Step 2: Remove native folders completely
Remove-Item -Path android -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ios -Recurse -Force -ErrorAction SilentlyContinue

# Step 3: Clean node_modules (optional but recommended)
Remove-Item -Path node_modules -Recurse -Force
npm install

# Step 4: Clean prebuild - regenerate native folders
npx expo prebuild --clean

# Step 5: Run development build on Android
npx expo run:android

# OR for iOS (if you're on Mac)
# npx expo run:ios
```

---

## Quick Rebuild (If node_modules are fine):

```powershell
# One-liner for quick rebuild
Remove-Item android,ios -Recurse -Force; npx expo prebuild --clean; npx expo run:android
```

---

## Expected Process:

1. **Prebuild** will take 2-3 minutes
   - Generates `android/` and `ios/` folders
   - Configures native modules

2. **First build** will take 5-10 minutes
   - Downloads Gradle dependencies (Android)
   - Compiles native code
   - Installs on device/emulator

3. **Subsequent builds** will be faster (1-2 minutes)

---

## Before Running:

✅ Make sure:
- Android emulator is running OR physical device is connected
- USB debugging enabled (for physical device)
- Run `adb devices` to verify device is detected

```powershell
# Check if device is connected
adb devices
```

---

## If Build Fails:

```powershell
# Try cleaning everything
Remove-Item android,ios,node_modules,.expo -Recurse -Force
npm install
npx expo prebuild --clean
npx expo run:android
```

---

## Alternative: Use EAS Build (Cloud Build)

Agar local build mein problem ho:

```powershell
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build for development
eas build --profile development --platform android
```

---

## Notes:
- Pehli baar build karne mein time lagega
- Patience rakhna, errors normal hain pehli baar
- Build complete hone ke baad app automatically install ho jayega

Kaunsa approach use karoge - Local build ya EAS Build?

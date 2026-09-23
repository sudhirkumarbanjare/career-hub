# TECH2PLACE Android Setup & Build Guide

This guide details the complete workflow for setting up your development machine, configuring Android Studio, building native binaries, and troubleshooting Android-specific issues.

---

## 1. System Requirements

* **Operating System**: macOS (ARM/x86), Linux (Ubuntu 22.04+), or Windows 11
* **Node.js**: v18.0.0 or higher (v22+ recommended)
* **Java Development Kit (JDK)**: JDK 17 (e.g. Eclipse Temurin or Azul Zulu 17)
* **Android Studio**: Ladybug (2024.2.1) or newer
* **Android SDK**: Android 15 (API Level 35)
* **Android Build Tools**: 35.0.0
* **Android NDK**: 26.1.10909125

---

## 2. Environment Variables Configuration

Add the following to your shell profile (`~/.zshrc`, `~/.bashrc`):

```bash
# Java Development Kit
export JAVA_HOME=$(/usr/libexec/java_home -v 17) # macOS
# On Linux: export JAVA_HOME=/usr/lib/jvm/temurin-17-jdk-amd64

# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk # macOS
# On Linux: export ANDROID_HOME=$HOME/Android/Sdk

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Verify your configuration:
```bash
java -version    # Must report Java 17
adb version     # Should output Android Debug Bridge version
```

---

## 3. Firebase Configuration Files

Before running the apps on physical hardware or emulators, place the corresponding `google-services.json` in each application's `app/` folder:

```text
student/android/app/google-services.json   (Package: com.tech2place.student)
client/android/app/google-services.json    (Package: com.tech2place.client)
admin/android/app/google-services.json     (Package: com.tech2place.admin)
```

---

## 4. Keystore Generation

### Generating a Debug Keystore:
```bash
keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
```

### Generating a Production Release Keystore:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore tech2place-release.keystore -alias tech2place_key_alias -keyalg RSA -keysize 2048 -validity 10000
```

Store the keystore securely and configure environment variables in your CI/CD runner:
```bash
export KEYSTORE_PATH="/secure/path/to/tech2place-release.keystore"
export KEYSTORE_STORE_PASSWORD="your_store_password"
export KEYSTORE_KEY_ALIAS="tech2place_key_alias"
export KEYSTORE_KEY_PASSWORD="your_key_password"
```

---

## 5. Development Build Execution

Start the Metro bundler for the target application:
```bash
# In Root:
npm run student:start   # or client:start / admin:start
```

In a second terminal, install and launch the Android binary:
```bash
# Student App
cd student/android && ./gradlew installDebug

# Client App
cd client/android && ./gradlew installDebug

# Admin App
cd admin/android && ./gradlew installDebug
```

Alternatively, use the React Native CLI runner:
```bash
cd student && npx react-native run-android --appId com.tech2place.student
cd client && npx react-native run-android --appId com.tech2place.client
cd admin && npx react-native run-android --appId com.tech2place.admin
```

---

## 6. Production Release Builds

### 1. Generate Signed Universal APK:
```bash
cd student/android && ./gradlew assembleRelease
# Output: student/android/app/build/outputs/apk/release/app-release.apk
```

### 2. Generate Google Play App Bundle (AAB):
```bash
cd student/android && ./gradlew bundleRelease
# Output: student/android/app/build/outputs/bundle/release/app-release.aab
```

---

## 7. Common Troubleshooting

| Issue | Root Cause | Solution |
|:---|:---|:---|
| `SDK location not found` | Missing `local.properties` | Create `local.properties` inside `{app}/android/` containing `sdk.dir=/Users/YOUR_USER/Library/Android/sdk` |
| `Execution failed for task ':app:processDebugGoogleServices'` | Missing or mismatched `google-services.json` | Ensure `google-services.json` has `package_name` matching `com.tech2place.{app}` |
| `Unsupported class file major version 65` | Incompatible Gradle / Java | Ensure JDK 17 is active (`export JAVA_HOME=...`). JDK 21 is not yet supported by some legacy Gradle plugins |
| Metro Bundler port conflict (`8081` in use) | Another Metro or Node process running | Kill existing process: `lsof -ti:8081 | xargs kill -9` |

#!/usr/bin/env bash
set -e

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

echo "📱 Checking connected ADB devices..."
DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | awk '{print $1}')

if [ -z "$DEVICES" ]; then
  echo "⚠️ No active ADB device or emulator detected."
  echo "Please connect your Android phone via USB with USB Debugging enabled, or start an Android emulator, then re-run this script."
  echo ""
  echo "Available Built Debug APKs:"
  echo "  1. Student App : student/android/app/build/outputs/apk/debug/app-debug.apk"
  echo "  2. Client App  : client/android/app/build/outputs/apk/debug/app-debug.apk"
  echo "  3. Admin App   : admin/android/app/build/outputs/apk/debug/app-debug.apk"
  exit 0
fi

echo "✅ Found device(s):"
echo "$DEVICES"

echo ""
echo "🚀 Installing GoTechPlace Student App (com.gotechplace.student)..."
adb install -r student/android/app/build/outputs/apk/debug/app-debug.apk

echo ""
echo "🚀 Installing GoTechPlace Client App (com.gotechplace.client)..."
adb install -r client/android/app/build/outputs/apk/debug/app-debug.apk

echo ""
echo "🚀 Installing GoTechPlace Admin App (com.gotechplace.admin)..."
adb install -r admin/android/app/build/outputs/apk/debug/app-debug.apk

echo ""
echo "🎉 All 3 GoTechPlace Apps installed successfully!"

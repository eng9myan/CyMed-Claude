# CyMed Mobile (iOS + Android)

Capacitor-based mobile wrapper around the CyMed web client. Both platforms
ship from a single codebase.

## Prerequisites

| Target | Required |
|---|---|
| iOS | macOS, Xcode 15+, CocoaPods, Apple Developer account |
| Android | Android Studio Hedgehog+, JDK 17, Android SDK 34, signing keystore |

## Setup

```bash
cd mobile
npm install
npx cap add ios       # macOS only
npx cap add android
npm run resources     # generates icons + splash from cymed_logo.png
```

## Build

```bash
# iOS — opens Xcode
npm run open:ios
# In Xcode: Product → Archive → Distribute App → App Store Connect

# Android — opens Android Studio, OR command-line:
npm run open:android
# In Studio: Build → Generate Signed Bundle → AAB → upload to Play Console
# OR: cd android && ./gradlew bundleRelease
```

## Output

| Platform | Artifact | Distribution |
|---|---|---|
| iOS | `Cymed.ipa` | App Store / Enterprise |
| Android | `app-release.aab` | Google Play |
| Android | `app-release.apk` | Direct download / MDM |

## Branding

Built-in splash screen, app icons, and status bar all use Cybercom palette
(`#0F172A` background, `#E67E22` accent). No upstream framework branding.

## Connecting to a different server

Edit `capacitor.config.json` → `server.url` → your CyMed instance.
After editing run `npm run sync` and rebuild.

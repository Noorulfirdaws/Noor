# Google Maps Setup

## 1. Get an API Key
Go to https://console.cloud.google.com → APIs & Services → Credentials
Enable: Maps SDK for Android, Maps SDK for iOS

## 2. Android — AndroidManifest.xml
File: android/app/src/main/AndroidManifest.xml
Add inside <application>:

    <meta-data
        android:name="com.google.android.geo.API_KEY"
        android:value="YOUR_GOOGLE_MAPS_API_KEY"/>

Also add permissions above <application>:

    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
    <uses-permission android:name="android.permission.INTERNET"/>

## 3. iOS — AppDelegate.swift
File: ios/Runner/AppDelegate.swift

    import GoogleMaps
    // Inside application(_:didFinishLaunchingWithOptions:)
    GMSServices.provideAPIKey("YOUR_GOOGLE_MAPS_API_KEY")

Also add to ios/Runner/Info.plist:

    <key>NSLocationWhenInUseUsageDescription</key>
    <string>DjiRide needs your location to track your trip.</string>

## 4. Minimum SDK
android/app/build.gradle → minSdkVersion 21

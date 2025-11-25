# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# =============================================================================
# React Native
# =============================================================================
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
    void set*(***);
    *** get*();
}
-keepclassmembers class * {
    @com.facebook.common.internal.DoNotStrip *;
}
-keep @com.facebook.jni.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.jni.annotations.DoNotStrip *;
}
-dontwarn com.facebook.jni.**
-dontwarn com.facebook.hermes.**
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.views.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.devsupport.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.newarch.** { *; }
-keep class com.facebook.react.fabric.** { *; }

# Hermes
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native Config
-keep class com.motorove.BuildConfig { *; }

# =============================================================================
# React Navigation
# =============================================================================
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.reanimated.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }
-keep class com.reactnavigation.** { *; }

# =============================================================================
# Firebase
# =============================================================================
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Firebase Messaging
-keep class com.google.firebase.messaging.** { *; }
-keep class com.google.firebase.iid.** { *; }

# Firebase In-App Messaging
-keep class com.google.firebase.inappmessaging.** { *; }

# =============================================================================
# Sentry
# =============================================================================
-keep class io.sentry.** { *; }
-dontwarn io.sentry.**
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions

# =============================================================================
# Supabase
# =============================================================================
-keep class io.supabase.** { *; }
-dontwarn io.supabase.**

# =============================================================================
# React Native Maps
# =============================================================================
-keep class com.airbnb.android.react.maps.** { *; }
-keep class com.google.android.gms.maps.** { *; }
-dontwarn com.google.android.gms.maps.**

# =============================================================================
# React Native Image Picker
# =============================================================================
-keep class com.imagepicker.** { *; }

# =============================================================================
# React Native Reanimated
# =============================================================================
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# =============================================================================
# React Native Gesture Handler
# =============================================================================
-keep class com.swmansion.gesturehandler.** { *; }

# =============================================================================
# React Native Safe Area Context
# =============================================================================
-keep class com.th3rdwave.safeareacontext.** { *; }

# =============================================================================
# React Native Screens
# =============================================================================
-keep class com.swmansion.rnscreens.** { *; }

# =============================================================================
# React Native SVG
# =============================================================================
-keep class com.horcrux.svg.** { *; }

# =============================================================================
# React Native WebView
# =============================================================================
-keep class com.reactnativecommunity.webview.** { *; }

# =============================================================================
# React Native FS
# =============================================================================
-keep class com.rnfs.** { *; }

# =============================================================================
# React Native Encrypted Storage
# =============================================================================
-keep class com.emeraldsanto.encryptedstorage.** { *; }

# =============================================================================
# React Native Device Info
# =============================================================================
-keep class com.learnium.RNDeviceInfo.** { *; }

# =============================================================================
# React Native Date Picker
# =============================================================================
-keep class com.henninghall.date_picker.** { *; }

# =============================================================================
# React Native Localize
# =============================================================================
-keep class com.reactcommunity.rnlocalize.** { *; }

# =============================================================================
# React Native NetInfo
# =============================================================================
-keep class com.reactnativecommunity.netinfo.** { *; }

# =============================================================================
# React Native Geolocation
# =============================================================================
-keep class com.reactnativecommunity.geolocation.** { *; }

# =============================================================================
# React Native Blur
# =============================================================================
-keep class com.reactnativecommunity.blur.** { *; }

# =============================================================================
# React Native Snap Carousel
# =============================================================================
-keep class com.react_native_snap_carousel.** { *; }

# =============================================================================
# Lottie
# =============================================================================
-keep class com.airbnb.lottie.** { *; }

# =============================================================================
# Async Storage
# =============================================================================
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# =============================================================================
# Apollo Client / GraphQL
# =============================================================================
-keep class com.apollographql.** { *; }
-keep class okhttp3.** { *; }
-keep class okio.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# =============================================================================
# OkHttp
# =============================================================================
-dontwarn okhttp3.**
-dontwarn okio.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# =============================================================================
# Kotlin
# =============================================================================
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings {
    <fields>;
}
-keepclassmembers class kotlin.Metadata {
    public <methods>;
}
-assumenosideeffects class kotlin.jvm.internal.Intrinsics {
    static void throwNpe();
    static void checkNotNullParameter(java.lang.Object, java.lang.String);
}

# =============================================================================
# General Android
# =============================================================================
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Parcelables
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep R class
-keepclassmembers class **.R$* {
    public static <fields>;
}

# Keep BuildConfig
-keep class **.BuildConfig { *; }

# Keep application class
-keep public class * extends android.app.Application {
    public <init>();
}

# Keep Activity classes
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Fragment
-keep public class * extends android.support.v4.app.Fragment
-keep public class * extends androidx.fragment.app.Fragment

# Keep View constructors
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet);
}
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# =============================================================================
# Keep JavaScript interface methods
# =============================================================================
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# =============================================================================
# Keep WebView related classes
# =============================================================================
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public void *(android.webkit.WebView, java.lang.String);
}

# =============================================================================
# Keep reflection-based code (for libraries that use reflection)
# =============================================================================
-keepattributes RuntimeVisibleAnnotations
-keepattributes RuntimeVisibleParameterAnnotations
-keepattributes AnnotationDefault

# =============================================================================
# Add any project specific keep options here:
# =============================================================================

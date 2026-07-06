# Keep Firebase model classes (reflected during (de)serialization).
-keepclassmembers class com.family.guardian.data.** { *; }
-keep class com.family.guardian.data.** { *; }

# Firebase Firestore/Auth/Messaging keep rules are bundled with the SDKs.
-keepattributes Signature
-keepattributes *Annotation*

# ML Kit barcode
-keep class com.google.mlkit.** { *; }

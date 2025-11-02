import com.android.build.api.dsl.ApplicationExtension
import org.gradle.kotlin.dsl.getByType

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.vitrinedecraques.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.vitrinedecraques.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField("String", "API_BASE_URL", "\"https://vitrinedecraques.com\"")
    }

    signingConfigs {
        create("release") {
            // Lê do gradle.properties (local ou do usuário)
            val storeFilePath = providers.gradleProperty("VC_STORE_FILE").orNull
            val storePasswordProp = providers.gradleProperty("VC_STORE_PASSWORD").orNull
            val keyAliasProp = providers.gradleProperty("VC_KEY_ALIAS").orNull
            val keyPasswordProp = providers.gradleProperty("VC_KEY_PASSWORD").orNull

            // Se preferir permitir override por variável de ambiente:
            val envStoreFile = System.getenv("VC_STORE_FILE")
            val envStorePass = System.getenv("VC_STORE_PASSWORD")
            val envKeyAlias = System.getenv("VC_KEY_ALIAS")
            val envKeyPass = System.getenv("VC_KEY_PASSWORD")

            storeFile = file((envStoreFile ?: storeFilePath) ?: error("VC_STORE_FILE não definido"))
            storePassword = (envStorePass ?: storePasswordProp) ?: error("VC_STORE_PASSWORD não definido")
            keyAlias = (envKeyAlias ?: keyAliasProp) ?: error("VC_KEY_ALIAS não definido")
            keyPassword = (envKeyPass ?: keyPasswordProp) ?: error("VC_KEY_PASSWORD não definido")

            // Muito importante: tipo PKCS12 para .p12
            storeType = "PKCS12"

            // Assinaturas habilitadas (recomendado para compatibilidade)
            enableV1Signing = true   // JAR Signature (Android 4.x)
            enableV2Signing = true   // APK Signature Scheme v2 (Android 7+)
            enableV3Signing = true   // v3 (Android 9+)
            enableV4Signing = true   // v4 (incremental install - opcional)
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            isDebuggable = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfigs.findByName("release")?.let {
                signingConfig = it
            }   
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.foundation)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.google.material)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.okhttp)
    implementation(libs.okhttp.urlconnection)
    implementation(libs.coil.compose)
    implementation(libs.androidx.media3.exoplayer)
    implementation(libs.androidx.media3.ui)
    implementation(libs.androidx.datastore.preferences)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}
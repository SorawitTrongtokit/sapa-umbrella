import { getEnvConfig, validateEnvConfig } from '@/lib/env-config';

/**
 * Environment Testing Utility
 * 
 * ใช้สำหรับทดสอบ environment configuration ใน development mode
 */

export function testEnvironmentSetup() {
  console.group('🧪 Environment Configuration Test');
  
  const startTime = performance.now();
  
  try {
    // 1. Test Configuration Loading
    console.log('1️⃣ Testing configuration loading...');
    const config = getEnvConfig();
    console.log('✅ Configuration loaded successfully');
    console.table({
      'Environment': config.environment,
      'Project ID': config.firebase.projectId || 'NOT SET',
      'Database URL': config.firebase.databaseURL ? 'SET' : 'NOT SET',
      'API Key': config.firebase.apiKey ? 'SET' : 'NOT SET',
      'Encryption Key': config.encryption.key ? 'SET' : 'NOT SET'
    });

    // 2. Test Validation
    console.log('\n2️⃣ Testing validation...');
    const validation = validateEnvConfig();
    
    if (validation.valid) {
      console.log('✅ Validation passed');
      if (validation.warnings.length > 0) {
        console.warn('⚠️ Warnings found:');
        validation.warnings.forEach((warning, index) => {
          console.warn(`   ${index + 1}. ${warning}`);
        });
      }
    } else {
      console.error('❌ Validation failed');
      console.error('Missing variables:');
      validation.missing.forEach((missing, index) => {
        console.error(`   ${index + 1}. ${missing}`);
      });
    }

    // 3. Test Firebase Connection (basic check)
    console.log('\n3️⃣ Testing Firebase configuration...');
    const hasRequiredFirebaseConfig = !!(
      config.firebase.projectId &&
      config.firebase.authDomain &&
      config.firebase.databaseURL &&
      config.firebase.apiKey
    );
    
    if (hasRequiredFirebaseConfig) {
      console.log('✅ Firebase configuration complete');
    } else {
      console.warn('⚠️ Firebase configuration incomplete');
    }

    // 4. Test Security Configuration
    console.log('\n4️⃣ Testing security configuration...');
    if (config.encryption.key && config.encryption.key.length >= 32) {
      console.log('✅ Encryption key configured properly');
    } else {
      console.warn('⚠️ Encryption key missing or too short');
    }

    // 5. Performance Test
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    console.log(`\n⏱️ Configuration load time: ${loadTime.toFixed(2)}ms`);

    // 6. Summary
    console.log('\n📊 Test Summary:');
    const summary = {
      'Overall Status': validation.valid ? '✅ Ready' : '❌ Not Ready',
      'Configuration Load': '✅ Success',
      'Firebase Setup': hasRequiredFirebaseConfig ? '✅ Complete' : '⚠️ Incomplete',
      'Security Setup': config.encryption.key ? '✅ Configured' : '❌ Missing',
      'Performance': loadTime < 10 ? '✅ Fast' : '⚠️ Slow'
    };
    
    console.table(summary);

    return {
      success: true,
      validation,
      config,
      performance: {
        loadTime,
        status: loadTime < 10 ? 'good' : 'slow'
      }
    };

  } catch (error) {
    console.error('❌ Environment test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    console.groupEnd();
  }
}

/**
 * Quick environment status check
 */
export function quickEnvCheck() {
  const validation = validateEnvConfig();
  const config = getEnvConfig();
  
  return {
    ready: validation.valid,
    environment: config.environment,
    warnings: validation.warnings.length,
    errors: validation.missing.length,
    firebaseConnected: !!(config.firebase.projectId && config.firebase.databaseURL),
    encryptionReady: !!config.encryption.key
  };
}

/**
 * Environment debugging information
 */
export function getEnvDebugInfo() {
  if (import.meta.env.PROD) {
    return { message: 'Debug info not available in production' };
  }

  return {
    // Environment variables (safe to show in development)
    nodeEnv: import.meta.env.MODE,
    viteEnv: {
      mode: import.meta.env.MODE,
      prod: import.meta.env.PROD,
      dev: import.meta.env.DEV,
      baseUrl: import.meta.env.BASE_URL
    },
    // Available env vars (without values for security)
    availableVars: Object.keys(import.meta.env).filter(key => 
      key.startsWith('VITE_')
    ),
    // Validation status
    validation: validateEnvConfig(),
    // Browser info
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled
    },
    // Firebase SDK info
    firebase: {
      authSupported: typeof window !== 'undefined' && 'indexedDB' in window,
      localStorageSupported: typeof Storage !== 'undefined'
    }
  };
}

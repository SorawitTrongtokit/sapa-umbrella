// Environment variables validation utility
// Use this to check if all environment variables are loaded correctly

export interface EnvConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  encryption: {
    key: string;
  };
  environment: string;
}

export const getEnvConfig = (): EnvConfig => {
  return {
    firebase: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
    },
    encryption: {
      key: import.meta.env.VITE_ENCRYPTION_KEY || '',
    },
    environment: import.meta.env.NODE_ENV || 'development',
  };
};

export const validateEnvConfig = (): { valid: boolean; missing: string[]; warnings: string[] } => {
  const config = getEnvConfig();
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check Firebase config with correct environment variable names
  const firebaseEnvMapping = {
    apiKey: 'VITE_FIREBASE_API_KEY',
    authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
    databaseURL: 'VITE_FIREBASE_DATABASE_URL',
    projectId: 'VITE_FIREBASE_PROJECT_ID',
    storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'VITE_FIREBASE_APP_ID',
    measurementId: 'VITE_FIREBASE_MEASUREMENT_ID'
  };

  Object.entries(config.firebase).forEach(([key, value]) => {
    if (!value) {
      missing.push(firebaseEnvMapping[key as keyof typeof firebaseEnvMapping]);
    }
  });

  // Check encryption key
  if (!config.encryption.key) {
    missing.push('VITE_ENCRYPTION_KEY');
  }

  // Check environment
  if (!config.environment) {
    warnings.push('NODE_ENV not set, defaulting to development');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
};

export const logEnvStatus = (): void => {
  const validation = validateEnvConfig();
  const config = getEnvConfig();

  console.log('🔧 Environment Configuration Status:');
  console.log('═══════════════════════════════════════');
  
  if (validation.valid) {
    console.log('✅ All environment variables loaded successfully!');
  } else {
    console.error('❌ Missing environment variables:', validation.missing);
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Warnings:', validation.warnings);
  }

  console.log('\n📊 Current Configuration:');
  console.log('Environment:', config.environment);
  console.log('Firebase Project:', config.firebase.projectId);
  console.log('Firebase Database:', config.firebase.databaseURL ? '✅ Configured' : '❌ Missing');
  console.log('Encryption Key:', config.encryption.key ? '✅ Set' : '❌ Missing');
  
  if (config.environment === 'development') {
    console.log('\n🔐 Firebase Config (Development Mode):');
    console.table({
      'API Key': config.firebase.apiKey ? `${config.firebase.apiKey.substring(0, 20)}...` : 'Missing',
      'Auth Domain': config.firebase.authDomain,
      'Project ID': config.firebase.projectId,
      'Database URL': config.firebase.databaseURL,
    });
  }

  console.log('═══════════════════════════════════════');
};

// Auto-run validation in development
if (import.meta.env.DEV) {
  logEnvStatus();
}

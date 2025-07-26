import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Environment Configuration and Testing
import { validateEnvConfig } from './lib/env-config';
import { testEnvironmentSetup, quickEnvCheck } from './lib/env-test';

// Development console commands (only in development)
if (import.meta.env.DEV) {
  import('./lib/dev-console');
}

// Initialize environment validation and testing
console.log('🔧 Initializing PCSHSPL Umbrella System...');

const envValidation = validateEnvConfig();
if (!envValidation.valid) {
  console.error('❌ Environment configuration invalid:', envValidation.missing);
  
  // Show user-friendly error in development
  if (import.meta.env.DEV) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background: #fee; 
        color: #c53030; 
        padding: 2rem; 
        font-family: monospace;
        z-index: 9999;
        overflow: auto;
      ">
        <h1>⚠️ Environment Configuration Error</h1>
        <p>Missing required environment variables:</p>
        <ul>
          ${envValidation.missing.map(missing => `<li>${missing}</li>`).join('')}
        </ul>
        <p>Please check your .env file and restart the development server.</p>
        <button onclick="this.parentElement.style.display='none'" style="
          background: #c53030; 
          color: white; 
          border: none; 
          padding: 0.5rem 1rem; 
          cursor: pointer; 
          margin-top: 1rem;
        ">Continue Anyway</button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
} else {
  console.log('✅ Environment configuration valid');
  
  // Run comprehensive test in development
  if (import.meta.env.DEV) {
    // Quick status check
    const quickStatus = quickEnvCheck();
    console.log('📊 Quick Environment Status:', quickStatus);
    
    // Run detailed environment test after a delay
    setTimeout(() => {
      testEnvironmentSetup();
    }, 1000);
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);

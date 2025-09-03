// Script de test pour vérifier l'exclusion d'IP dans Google Analytics

import { shouldExcludeFromTracking } from '../config/analytics.js';

// Fonction de test pour vérifier l'exclusion
export const testAnalyticsExclusion = () => {
  console.log('🧪 Test d\'exclusion Google Analytics');
  console.log('=====================================');
  
  const hostname = window.location.hostname;
  const isExcluded = shouldExcludeFromTracking();
  
  console.log(`📍 Hostname actuel: ${hostname}`);
  console.log(`🚫 Exclusion activée: ${isExcluded ? 'OUI' : 'NON'}`);
  
  if (isExcluded) {
    console.log('✅ Votre trafic sera exclu de Google Analytics');
    console.log('📊 Les événements seront loggés dans la console mais pas envoyés à GA');
  } else {
    console.log('⚠️  Votre trafic sera inclus dans Google Analytics');
    console.log('📈 Les événements seront envoyés normalement à GA');
  }
  
  console.log('=====================================');
  
  return isExcluded;
};

// Fonction pour simuler un événement de test
export const testEvent = () => {
  const isExcluded = shouldExcludeFromTracking();
  
  if (isExcluded) {
    console.log('🧪 [TEST] Événement simulé - exclu du tracking');
  } else {
    console.log('🧪 [TEST] Événement simulé - envoyé à Google Analytics');
  }
  
  return isExcluded;
};

// Auto-test au chargement du module
if (typeof window !== 'undefined') {
  console.log('🔍 Vérification automatique de l\'exclusion d\'IP...');
  testAnalyticsExclusion();
}

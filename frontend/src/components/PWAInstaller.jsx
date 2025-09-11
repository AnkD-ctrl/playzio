import React, { useState, useEffect } from 'react';

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      // Empêcher l'affichage automatique du prompt
      e.preventDefault();
      // Sauvegarder l'événement pour l'utiliser plus tard
      setDeferredPrompt(e);
      // Afficher notre bouton d'installation
      setShowInstallButton(true);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      console.log('PWA installée avec succès');
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Afficher le prompt d'installation
    deferredPrompt.prompt();
    
    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Utilisateur a accepté l\'installation');
    } else {
      console.log('Utilisateur a refusé l\'installation');
    }
    
    // Nettoyer
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (!showInstallButton) return null;

  return (
    <div className="pwa-installer">
      <button 
        onClick={handleInstallClick}
        className="install-button"
        title="Installer Playzio sur votre appareil"
      >
        📱 Installer l'app
      </button>
    </div>
  );
};

export default PWAInstaller;

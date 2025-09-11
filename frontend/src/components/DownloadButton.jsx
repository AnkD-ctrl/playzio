import React, { useState, useEffect } from 'react';
import './DownloadButton.css';

const DownloadButton = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Détecter si l'installation PWA est supportée
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Détecter si l'app est déjà installée
    const handleAppInstalled = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    // Vérifier si on est sur iOS (Safari)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
      setCanInstall(true); // iOS Safari supporte l'installation via "Ajouter à l'écran d'accueil"
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDownload = async () => {
    if (canInstall && deferredPrompt) {
      // Installation PWA directe
      setIsInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('App installée avec succès');
        } else {
          console.log('Installation refusée');
        }
      } catch (error) {
        console.error('Erreur lors de l\'installation:', error);
      } finally {
        setIsInstalling(false);
        setDeferredPrompt(null);
        setCanInstall(false);
      }
    } else {
      // Redirection vers page explicative
      window.open('/install-guide', '_blank');
    }
  };

  const getButtonText = () => {
    if (isInstalling) return 'Installation...';
    if (canInstall) return '📱 Télécharger l\'app';
    return '📱 Télécharger l\'app';
  };

  return (
    <button 
      className="download-button"
      onClick={handleDownload}
      disabled={isInstalling}
    >
      {getButtonText()}
    </button>
  );
};

export default DownloadButton;

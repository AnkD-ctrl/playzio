import React from 'react';
import './InstallGuide.css';

const InstallGuide = () => {
  return (
    <div className="install-guide">
      <div className="install-guide-container">
        <h1>📱 Comment installer Playzio</h1>
        
        <div className="install-steps">
          <div className="install-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Sur Android</h3>
              <p>Ouvrez Playzio dans votre navigateur, puis appuyez sur "Ajouter à l'écran d'accueil" qui apparaît en bas de l'écran.</p>
            </div>
          </div>

          <div className="install-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Sur iPhone</h3>
              <p>Ouvrez Playzio dans Safari, appuyez sur le bouton "Partager" (carré avec flèche), puis sélectionnez "Sur l'écran d'accueil".</p>
            </div>
          </div>

          <div className="install-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Sur ordinateur</h3>
              <p>Ouvrez Playzio dans votre navigateur, puis cliquez sur l'icône "Installer" dans la barre d'adresse.</p>
            </div>
          </div>
        </div>

        <div className="install-benefits">
          <h3>✨ Avantages de l'installation :</h3>
          <ul>
            <li>Accès rapide depuis l'écran d'accueil</li>
            <li>Chargement plus rapide</li>
            <li>Expérience comme une vraie app</li>
            <li>Notifications push (bientôt)</li>
          </ul>
        </div>

        <div className="install-actions">
          <button 
            className="back-button"
            onClick={() => window.location.href = '/'}
          >
            ← Retour
          </button>
          <button 
            className="try-again-button"
            onClick={() => window.location.href = '/'}
          >
            Réessayer l'installation
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallGuide;

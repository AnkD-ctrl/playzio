import React from 'react'
import './LegalPages.css'

export const MentionsLegales = ({ onBack }) => {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <button onClick={onBack} className="back-btn">
          ← Retour
        </button>
        <h1>Mentions légales</h1>
      </div>
      
      <div className="legal-content">
        <section>
          <h2>1. Éditeur du site</h2>
          <p>
            <strong>Nom du site :</strong> Playzio<br/>
            <strong>URL :</strong> https://www.playzio.fr<br/>
            <strong>Description :</strong> Plateforme de partage de disponibilités entre amis
          </p>
          <p>
            <strong>Éditeur :</strong> TBD<br/>
            <strong>Forme juridique :</strong> TBD<br/>
            <strong>Capital social :</strong> TBD<br/>
            <strong>RCS :</strong> TBD<br/>
            <strong>SIRET :</strong> TBD<br/>
            <strong>Adresse :</strong> TBD
          </p>
          <p>
            <strong>Directeur de publication :</strong> TBD
          </p>
        </section>

        <section>
          <h2>2. Hébergement</h2>
          <p>
            <strong>Hébergeur :</strong> Vercel Inc.<br/>
            <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA<br/>
            <strong>Site web :</strong> https://vercel.com
          </p>
        </section>

        <section>
          <h2>3. Propriété intellectuelle</h2>
          <p>
            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
            Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
          </p>
          <p>
            La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
          </p>
        </section>

        <section>
          <h2>4. Responsabilité</h2>
          <p>
            Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l'année, 
            mais peut toutefois contenir des inexactitudes ou des omissions.
          </p>
          <p>
            Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien vouloir le signaler par email, 
            à l'adresse [À compléter - email de contact], en décrivant le problème de la manière la plus précise possible.
          </p>
        </section>

        <section>
          <h2>5. Liens hypertextes</h2>
          <p>
            Des liens hypertextes peuvent être présents sur le site. L'utilisateur est informé qu'en cliquant sur ces liens, 
            il sortira du site playzio.fr. Ce dernier n'a pas de contrôle sur les pages web sur lesquelles aboutissent ces liens 
            et ne saurait en aucun cas être responsable de leur contenu.
          </p>
        </section>

        <section>
          <h2>6. Droit applicable</h2>
          <p>
            Tout litige en relation avec l'utilisation du site playzio.fr est soumis au droit français. 
            Il est fait attribution exclusive de juridiction aux tribunaux compétents de [À compléter - ville].
          </p>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>
            <strong>Email :</strong> contact@playzio.fr<br/>
            <strong>Adresse :</strong> TBD
          </p>
        </section>
      </div>
    </div>
  )
}

export const PolitiqueConfidentialite = ({ onBack }) => {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <button onClick={onBack} className="back-btn">
          ← Retour
        </button>
        <h1>Politique de confidentialité</h1>
        <p className="last-updated">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
      </div>
      
      <div className="legal-content">
        <section>
          <h2>1. Collecte des données personnelles</h2>
          <p>
            Playzio collecte les données personnelles suivantes :
          </p>
          <ul>
            <li><strong>Données d'inscription :</strong> Prénom, email, mot de passe (haché)</li>
            <li><strong>Données d'activité :</strong> Disponibilités créées, participations aux créneaux</li>
            <li><strong>Données de navigation :</strong> Cookies de session, préférences utilisateur</li>
            <li><strong>Données de groupes :</strong> Groupes créés, membres des groupes</li>
            <li><strong>Données d'amis :</strong> Liste d'amis, demandes d'amitié</li>
          </ul>
        </section>

        <section>
          <h2>2. Finalités du traitement</h2>
          <p>Les données collectées sont utilisées pour :</p>
          <ul>
            <li>Fournir le service de partage de disponibilités</li>
            <li>Gérer les comptes utilisateurs et l'authentification</li>
            <li>Permettre la création et participation aux créneaux</li>
            <li>Faciliter les interactions entre amis et groupes</li>
            <li>Améliorer l'expérience utilisateur</li>
            <li>Assurer la sécurité du service</li>
          </ul>
        </section>

        <section>
          <h2>3. Base légale du traitement</h2>
          <p>
            Le traitement des données est basé sur :
          </p>
          <ul>
            <li><strong>Consentement :</strong> Pour les cookies non essentiels</li>
            <li><strong>Exécution du contrat :</strong> Pour la fourniture du service</li>
            <li><strong>Intérêt légitime :</strong> Pour la sécurité et l'amélioration du service</li>
          </ul>
        </section>

        <section>
          <h2>4. Conservation des données</h2>
          <ul>
            <li><strong>Données de compte :</strong> Jusqu'à suppression du compte par l'utilisateur</li>
            <li><strong>Données d'activité :</strong> 3 ans après la dernière activité</li>
            <li><strong>Cookies :</strong> 13 mois maximum</li>
            <li><strong>Logs de connexion :</strong> 12 mois</li>
          </ul>
        </section>

        <section>
          <h2>5. Partage des données</h2>
          <p>
            Playzio ne partage pas vos données personnelles avec des tiers, sauf :
          </p>
          <ul>
            <li>Avec votre consentement explicite</li>
            <li>Pour respecter une obligation légale</li>
            <li>Pour protéger nos droits ou ceux des utilisateurs</li>
          </ul>
          <p>
            <strong>Note :</strong> Les disponibilités que vous rendez publiques sont visibles par tous les utilisateurs du service.
          </p>
        </section>

        <section>
          <h2>6. Vos droits (RGPD)</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès :</strong> Connaître les données que nous détenons sur vous</li>
            <li><strong>Droit de rectification :</strong> Corriger des données inexactes</li>
            <li><strong>Droit d'effacement :</strong> Supprimer vos données</li>
            <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
            <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
            <li><strong>Droit de limitation :</strong> Limiter le traitement de vos données</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à : <strong>contact@playzio.fr</strong>
          </p>
        </section>

        <section>
          <h2>7. Cookies</h2>
          <p>
            Playzio utilise des cookies pour :
          </p>
          <ul>
            <li><strong>Cookies essentiels :</strong> Authentification, préférences de session</li>
            <li><strong>Cookies de performance :</strong> Analyse d'usage (avec votre consentement)</li>
          </ul>
          <p>
            Vous pouvez gérer vos préférences de cookies via la bannière qui apparaît lors de votre première visite.
          </p>
        </section>

        <section>
          <h2>8. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
          </p>
          <ul>
            <li>Chiffrement des mots de passe (SHA256)</li>
            <li>Connexions sécurisées (HTTPS)</li>
            <li>Accès limité aux données personnelles</li>
            <li>Surveillance des accès</li>
          </ul>
        </section>

        <section>
          <h2>9. Modifications</h2>
          <p>
            Cette politique peut être modifiée à tout moment. Les modifications importantes vous seront notifiées 
            par email ou via une notification sur le site.
          </p>
        </section>

        <section>
          <h2>10. Contact et réclamations</h2>
          <p>
            <strong>Responsable du traitement :</strong> TBD<br/>
            <strong>Email :</strong> contact@playzio.fr<br/>
            <strong>Adresse :</strong> TBD
          </p>
          <p>
            Vous avez le droit d'introduire une réclamation auprès de la CNIL si vous estimez que vos droits ne sont pas respectés :
            <br/>
            <strong>CNIL :</strong> https://www.cnil.fr
          </p>
        </section>
      </div>
    </div>
  )
}

export const ConditionsUtilisation = ({ onBack }) => {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <button onClick={onBack} className="back-btn">
          ← Retour
        </button>
        <h1>Conditions d'utilisation</h1>
        <p className="last-updated">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
      </div>
      
      <div className="legal-content">
        <section>
          <h2>1. Objet</h2>
          <p>
            Les présentes conditions générales d'utilisation (CGU) ont pour objet de définir les modalités et conditions 
            d'utilisation du service Playzio, plateforme de partage de disponibilités entre amis.
          </p>
        </section>

        <section>
          <h2>2. Acceptation des conditions</h2>
          <p>
            L'utilisation du service Playzio implique l'acceptation pleine et entière des présentes CGU. 
            Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.
          </p>
        </section>

        <section>
          <h2>3. Description du service</h2>
          <p>
            Playzio est un service gratuit qui permet aux utilisateurs de :
          </p>
          <ul>
            <li>Créer et partager leurs disponibilités</li>
            <li>Rejoindre les disponibilités d'autres utilisateurs</li>
            <li>Créer des groupes d'amis</li>
            <li>Gérer leur liste d'amis</li>
            <li>Participer à des activités (tennis, padel, soirées, etc.)</li>
          </ul>
        </section>

        <section>
          <h2>4. Inscription et compte utilisateur</h2>
          <ul>
            <li>L'inscription est gratuite et nécessite un prénom, un email et un mot de passe</li>
            <li>Vous vous engagez à fournir des informations exactes et à jour</li>
            <li>Vous êtes responsable de la confidentialité de votre compte</li>
            <li>Vous devez nous notifier immédiatement toute utilisation non autorisée</li>
          </ul>
        </section>

        <section>
          <h2>5. Utilisation du service</h2>
          <p><strong>Vous vous engagez à :</strong></p>
          <ul>
            <li>Utiliser le service conformément à sa destination</li>
            <li>Respecter les autres utilisateurs</li>
            <li>Ne pas diffuser de contenu illégal, offensant ou inapproprié</li>
            <li>Ne pas tenter de contourner les mesures de sécurité</li>
            <li>Ne pas utiliser le service pour des activités commerciales sans autorisation</li>
          </ul>
        </section>

        <section>
          <h2>6. Contenu des utilisateurs</h2>
          <p>
            Vous conservez la propriété de vos contenus, mais vous accordez à Playzio une licence 
            non exclusive pour les utiliser dans le cadre du service.
          </p>
          <p>
            Vous vous engagez à ne pas publier de contenu qui :
          </p>
          <ul>
            <li>Violet les droits d'autrui</li>
            <li>Est illégal ou contraire à l'ordre public</li>
            <li>Est offensant, diffamatoire ou discriminatoire</li>
            <li>Contient des informations personnelles d'autres personnes sans leur accord</li>
          </ul>
        </section>

        <section>
          <h2>7. Responsabilité et limitation</h2>
          <p>
            Playzio s'efforce de maintenir un service fiable, mais ne peut garantir :
          </p>
          <ul>
            <li>Une disponibilité continue du service</li>
            <li>L'absence d'erreurs ou d'interruptions</li>
            <li>La sécurité absolue des données</li>
          </ul>
          <p>
            <strong>Votre responsabilité :</strong> Vous utilisez le service à vos propres risques. 
            Playzio ne saurait être responsable des dommages résultant de l'utilisation du service.
          </p>
        </section>

        <section>
          <h2>8. Propriété intellectuelle</h2>
          <p>
            Le service Playzio, son contenu et sa technologie sont protégés par le droit de la propriété intellectuelle. 
            Vous ne pouvez pas copier, modifier ou distribuer le service sans autorisation.
          </p>
        </section>

        <section>
          <h2>9. Suspension et résiliation</h2>
          <p>
            Nous nous réservons le droit de :
          </p>
          <ul>
            <li>Suspender temporairement votre accès en cas de violation des CGU</li>
            <li>Résilier définitivement votre compte après avertissement</li>
            <li>Supprimer tout contenu inapproprié</li>
          </ul>
        </section>

        <section>
          <h2>10. Modification des CGU</h2>
          <p>
            Nous nous réservons le droit de modifier ces CGU à tout moment. 
            Les modifications importantes vous seront notifiées via le service ou par email.
          </p>
        </section>

        <section>
          <h2>11. Droit applicable et juridiction</h2>
          <p>
            Les présentes CGU sont soumises au droit français. 
            En cas de litige, les tribunaux français seront seuls compétents.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            Pour toute question concernant ces conditions d'utilisation :
            <br/>
            <strong>Email :</strong> contact@playzio.fr
          </p>
        </section>
      </div>
    </div>
  )
}

export const ContactPage = ({ onBack }) => {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <button onClick={onBack} className="back-btn">
          ← Retour
        </button>
        <h1>Contact</h1>
      </div>
      
      <div className="legal-content">
        <section>
          <h2>Nous contacter</h2>
          <p>
            Pour toute question concernant Playzio, n'hésitez pas à nous contacter :
          </p>
          
          <div className="contact-info">
            <div className="contact-item">
              <strong>📧 Email :</strong> contact@playzio.fr
            </div>
            <div className="contact-item">
              <strong>🌐 Site web :</strong> https://www.playzio.fr
            </div>
            <div className="contact-item">
              <strong>📍 Adresse :</strong> TBD
            </div>
          </div>
        </section>

        <section>
          <h2>Support technique</h2>
          <p>
            Pour les problèmes techniques ou les questions sur l'utilisation du service, 
            envoyez-nous un email décrivant votre problème.
          </p>
        </section>

        <section>
          <h2>Questions légales</h2>
          <p>
            Pour toute question concernant :
          </p>
          <ul>
            <li>Vos données personnelles (RGPD)</li>
            <li>Les mentions légales</li>
            <li>Les conditions d'utilisation</li>
          </ul>
          <p>
            Contactez-nous à l'adresse : <strong>contact@playzio.fr</strong>
          </p>
        </section>

        <section>
          <h2>Délais de réponse</h2>
          <p>
            Nous nous efforçons de répondre à tous les messages dans un délai de 48h ouvrées.
          </p>
        </section>
      </div>
    </div>
  )
}

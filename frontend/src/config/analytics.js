// Configuration Google Analytics

// ID de votre propriété Google Analytics
export const GA_TRACKING_ID = 'G-08BY31MESY';

// IPs et domaines à exclure du tracking
export const EXCLUDED_IPS = [
  '88.174.10.112', // Votre IP actuelle
  '127.0.0.1',     // Localhost IPv4
  '::1',           // Localhost IPv6
];

export const EXCLUDED_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0'
];

// Domaines de développement à exclure
export const EXCLUDED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'vercel.app',    // Si vous testez sur Vercel preview
  'netlify.app'    // Si vous testez sur Netlify preview
];

// Fonction pour vérifier si le tracking doit être exclu
export const shouldExcludeFromTracking = () => {
  const hostname = window.location.hostname;
  
  // Vérifier les hostnames exclus
  if (EXCLUDED_HOSTNAMES.includes(hostname) || 
      hostname.includes('localhost')) {
    return true;
  }
  
  // Vérifier les domaines exclus
  for (const domain of EXCLUDED_DOMAINS) {
    if (hostname.includes(domain)) {
      return true;
    }
  }
  
  return false;
};

// Configuration Google Analytics
export const GA_CONFIG = {
  tracking_id: GA_TRACKING_ID,
  anonymize_ip: true,
  send_page_view: true,
  custom_map: {
    'custom_parameter_1': 'exclude_development'
  }
};

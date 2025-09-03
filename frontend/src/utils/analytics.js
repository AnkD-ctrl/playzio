// Google Analytics utility functions
import { shouldExcludeFromTracking } from '../config/analytics.js';

// Fonction wrapper pour tous les événements de tracking
const trackEvent = (eventName, parameters = {}) => {
  if (shouldExcludeFromTracking()) {
    console.log(`[Analytics] Événement exclu: ${eventName}`, parameters);
    return;
  }
  
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, parameters);
  }
};

// Track page views
export const trackPageView = (pageName) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href
  });
};

// Track user login
export const trackLogin = (userRole) => {
  trackEvent('login', {
    method: 'email',
    user_role: userRole
  });
};

// Track user logout
export const trackLogout = () => {
  trackEvent('logout');
};

// Track activity selection
export const trackActivitySelect = (activity) => {
  trackEvent('activity_select', {
    activity_name: activity
  });
};

// Track slot creation
export const trackSlotCreate = (activity, hasGroups) => {
  trackEvent('slot_create', {
    activity_name: activity,
    has_groups: hasGroups,
    event_category: 'engagement'
  });
};

// Track slot join
export const trackSlotJoin = (activity) => {
  trackEvent('slot_join', {
    activity_name: activity,
    event_category: 'engagement'
  });
};

// Track slot leave
export const trackSlotLeave = (activity) => {
  trackEvent('slot_leave', {
    activity_name: activity,
    event_category: 'engagement'
  });
};

// Track group creation
export const trackGroupCreate = () => {
  trackEvent('group_create', {
    event_category: 'social'
  });
};

// Track group member add
export const trackGroupMemberAdd = () => {
  trackEvent('group_member_add', {
    event_category: 'social'
  });
};

// Track group member remove
export const trackGroupMemberRemove = () => {
  trackEvent('group_member_remove', {
    event_category: 'social'
  });
};

// Track group leave
export const trackGroupLeave = () => {
  trackEvent('group_leave', {
    event_category: 'social'
  });
};

// Track group delete
export const trackGroupDelete = () => {
  trackEvent('group_delete', {
    event_category: 'social'
  });
};

// Track navigation
export const trackNavigation = (from, to) => {
  trackEvent('navigation', {
    from_page: from,
    to_page: to,
    event_category: 'navigation'
  });
};

// Track error
export const trackError = (errorType, errorMessage) => {
  trackEvent('exception', {
    description: errorMessage,
    fatal: false,
    error_type: errorType
  });
};
// Google Analytics utility functions

// Track page views
export const trackPageView = (pageName) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: pageName,
      page_location: window.location.href
    });
  }
};

// Track user login
export const trackLogin = (userRole) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'login', {
      method: 'email',
      user_role: userRole
    });
  }
};

// Track user logout
export const trackLogout = () => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'logout');
  }
};

// Track activity selection
export const trackActivitySelect = (activity) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'activity_select', {
      activity_name: activity
    });
  }
};

// Track slot creation
export const trackSlotCreate = (activity, hasGroups) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'slot_create', {
      activity_name: activity,
      has_groups: hasGroups,
      event_category: 'engagement'
    });
  }
};

// Track slot join
export const trackSlotJoin = (activity) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'slot_join', {
      activity_name: activity,
      event_category: 'engagement'
    });
  }
};

// Track slot leave
export const trackSlotLeave = (activity) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'slot_leave', {
      activity_name: activity,
      event_category: 'engagement'
    });
  }
};

// Track group creation
export const trackGroupCreate = () => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'group_create', {
      event_category: 'social'
    });
  }
};

// Track group member add
export const trackGroupMemberAdd = () => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'group_member_add', {
      event_category: 'social'
    });
  }
};

// Track group member remove
export const trackGroupMemberRemove = () => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'group_member_remove', {
      event_category: 'social'
    });
  }
};

// Track group leave
export const trackGroupLeave = () => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'group_leave', {
      event_category: 'social'
    });
  }
};

// Track group delete
export const trackGroupDelete = () => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'group_delete', {
      event_category: 'social'
    });
  }
};

// Track navigation
export const trackNavigation = (from, to) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'navigation', {
      from_page: from,
      to_page: to,
      event_category: 'navigation'
    });
  }
};

// Track error
export const trackError = (errorType, errorMessage) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'exception', {
      description: errorMessage,
      fatal: false,
      error_type: errorType
    });
  }
};

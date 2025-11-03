export const enTranslations = {
  notifications: {
    system: {
      title: 'System Notification',
      body: 'System update available',
    },
    post: {
      shared_in_group: {
        title: 'New Post in {{groupName}}',
        body: '{{userName}} shared a new post in {{groupName}}',
      },
      like: {
        title: 'Post Liked',
        body: '{{userName}} liked your post',
      },
      comment: {
        title: 'New Comment',
        body: '{{userName}} commented on your post: "{{comment}}"',
      },
      save: {
        title: 'Post Saved',
        body: '{{userName}} saved your post',
      },
    },
    user: {
      follow_request: {
        title: 'Follow Request',
        body: '{{userName}} wants to follow you',
      },
      follow_request_accepted: {
        title: 'Follow Request Accepted',
        body: '{{userName}} accepted your follow request',
      },
      new_follower: {
        title: 'New Follower',
        body: '{{userName}} started following you',
      },
    },
    group: {
      info_changed: {
        title: 'Group Updated',
        body: '{{groupName}} information has been updated',
      },
      join_request: {
        title: 'Group Join Request',
        body: '{{userName}} wants to join {{groupName}}',
      },
      join_request_accepted: {
        title: 'Join Request Accepted',
        body: 'Your request to join {{groupName}} has been accepted',
      },
      user_joined: {
        title: 'New Member',
        body: '{{userName}} joined {{groupName}}',
      },
      user_left: {
        title: 'Member Left',
        body: '{{userName}} left {{groupName}}',
      },
      member_removed: {
        title: 'Member Removed',
        body: '{{userName}} was removed from {{groupName}}',
      },
      role_changed: {
        title: 'Role Changed',
        body: "{{userName}}'s role in {{groupName}} has been changed to {{role}}",
      },
    },
    event: {
      invitation: {
        title: 'Event Invitation',
        body: "You're invited to {{eventName}} event on {{eventDate}}",
      },
      invitation_reminder: {
        title: 'Event Invitation Reminder',
        body: "Don't forget to respond to the event invitation for {{eventName}} on {{eventDate}} ",
      },
      reminder: {
        title: 'Event Reminder',
        body: '{{eventName}} event will start {{timeUntil}}',
      },
      cancelled: {
        title: 'Event Cancelled',
        body: '{{eventName}} event has been cancelled',
      },
      updated: {
        title: 'Event Updated',
        body: '{{eventName}} details have been updated',
      },
    },
    route: {
      shared: {
        title: 'New Route Shared',
        body: '{{userName}} shared a new route: {{routeName}}',
      },
      liked: {
        title: 'Route Liked',
        body: '{{userName}} liked your route: {{routeName}}',
      },
    },
    emergency: {
      title: 'Emergency',
      body: '{{fullName}} reported an {{emergencyType}} emergency',
    },
    common: {
      view_details: 'View Details',
      dismiss: 'Dismiss',
      accept: 'Accept',
      reject: 'Reject',
    },
  },
  enums: {
    warningType: {
      radar: 'Speed Radar',
      police_checkpoint: 'Police Checkpoint',
      accident: 'Accident',
      road_construction: 'Road Construction',
      road_closure: 'Road Closure',
      dangerous_curve: 'Dangerous Curve',
      slippery_road: 'Slippery Road',
      parking_prohibited: 'Parking Prohibited',
      other: 'Other',
    },
    emergencyType: {
      accident: 'Accident',
      breakdown: 'Breakdown',
      medical: 'Medical Emergency',
      fuel_shortage: 'Fuel Shortage',
      tire_problem: 'Tire Problem',
      battery_dead: 'Battery Dead',
      lost: 'Lost/Stranded',
      other: 'Other',
    },
  },
};

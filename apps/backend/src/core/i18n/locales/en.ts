export const enTranslations = {
  notifications: {
    system: {
      title: 'System Notification',
      body: 'System update available',
    },
    post: {
      shared_in_group: {
        title: 'New Post in {{groupName}}',
        body: '{{userFullName}} shared a new post in {{groupName}}',
      },
      like: {
        title: 'Post Liked',
        body: '{{userFullName}} liked your post',
      },
      comment: {
        title: 'New Comment',
        body: '{{userFullName}} commented on your post: "{{comment}}"',
      },
      save: {
        title: 'Post Saved',
        body: '{{userFullName}} saved your post',
      },
    },
    user: {
      follow_request: {
        title: 'Follow Request',
        body: '{{userFullName}} wants to follow you',
      },
      follow_request_accepted: {
        title: 'Follow Request Accepted',
        body: '{{userFullName}} accepted your follow request',
      },
      new_follower: {
        title: 'New Follower',
        body: '{{userFullName}} started following you',
      },
    },
    group: {
      info_changed: {
        title: 'Group Updated',
        body: '{{groupName}} information has been updated',
      },
      join_request: {
        title: 'Group Join Request',
        body: '{{userFullName}} wants to join {{groupName}}',
      },
      join_request_accepted: {
        title: 'Join Request Accepted',
        body: 'Your request to join {{groupName}} has been accepted',
      },
      user_joined: {
        title: 'New Member',
        body: '{{userFullName}} joined {{groupName}}',
      },
      user_left: {
        title: 'Member Left',
        body: '{{userFullName}} left {{groupName}}',
      },
      member_removed: {
        title: 'Member Removed',
        body: '{{userFullName}} was removed from {{groupName}} by {{adminFullName}}',
      },
      role_changed: {
        title: 'Role Changed',
        body: 'Your role in {{groupName}} has been changed to {{role}}',
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
    emergency: {
      title: 'Emergency',
      body: '{{userFullName}} reported an {{emergencyType}} emergency',
    },
    warning: {
      title: 'Warning',
      body: '{{userFullName}} reported a {{warningType}} warning nearby',
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
  errors: {
    // Authentication errors
    auth: {
      invalid_authorization_header: 'Invalid authorization header',
      invalid_token: 'Invalid token',
      token_expired: 'Token has expired',
      invalid_jwt_token: 'Invalid JWT token',
      user_not_found_during_refresh: 'User not found during token refresh',
      invalid_credentials: 'Invalid credentials',
      email_already_in_use: 'Email already in use',
      user_not_created: 'User not created',
      failed_to_send_password_reset_email:
        'Failed to send password reset email',
      failed_to_update_email: 'Failed to update email',
      failed_to_update_password: 'Failed to update password',
      failed_to_resend_email: 'Failed to resend email',
      token_and_password_required: 'Token and password are required',
      password_updated_successfully: 'Password updated successfully',
      invalid_or_expired_token: 'Invalid or expired token',
    },
    // Common errors
    common: {
      not_found: '{{resource}} not found',
      not_found_with_id: '{{resource}} with ID {{id}} not found',
      forbidden: 'You do not have permission to perform this action',
      cannot_perform_action: 'You cannot {{resource}}',
      failed_to_create: 'Failed to create {{resource}}',
      failed_to_update: 'Failed to update {{resource}}',
      failed_to_delete: 'Failed to delete {{resource}}',
      failed_to_upload: 'Failed to upload {{resource}}',
      failed_to_upload_with_error: 'Failed to upload {{resource}}: {{error}}',
      already_exists: '{{resource}} already exists',
      cannot_follow_yourself: 'Cannot follow yourself',
      already_following: 'Already following this user',
      not_following: 'Not following this user',
      internal_server_error: 'Internal server error',
      invalid_authentication: 'Invalid authentication',
      invalid_token: 'Invalid token',
    },
    // Post errors
    post: {
      cannot_delete: 'You can only delete your own posts',
      cannot_update: 'You can only update your own posts',
    },
    // Post comment errors
    post_comment: {
      cannot_delete: 'You can only delete your own comments',
      cannot_update: 'You can only update your own comments',
    },
    // Group errors
    group: {
      already_member: 'User is already a member of this group',
      cannot_delete: 'You can only delete groups you own',
      cannot_update: 'You can only update groups you own',
    },
    // Group membership errors
    group_membership: {
      cannot_remove_yourself: 'You cannot remove yourself from the group',
      cannot_remove: 'You cannot remove this member',
      cannot_leave: 'You cannot leave this group',
    },
    // Event errors
    event: {
      cannot_remove: 'You cannot remove this event',
      cannot_leave: 'You cannot leave your own event',
      cannot_cancel: 'You cannot cancel this event',
      failed_to_fetch_invitations: 'Failed to fetch invitations',
      failed_to_reject_invitation: 'Failed to reject invitation',
      failed_to_accept_invitation: 'Failed to accept invitation',
    },
    // Warning errors
    warning: {
      cannot_delete: 'You can only delete your own warnings',
    },
    // Emergency errors
    emergency: {
      cannot_delete: 'You can only delete your own emergencies',
    },
    // Business comment errors
    business_comment: {
      rating_invalid: 'Rating must be between 1 and 5',
      cannot_delete: 'You can only delete your own comments',
      cannot_update: 'You can only update your own comments',
    },
  },
  // Resource names for translation
  resources: {
    email: 'Email',
    supabase_credentials: 'Supabase Credentials',
    authorization_header: 'Authorization Header',
    user: 'User',
    user_following: 'User Following',
    user_setting: 'User Setting',
    post: 'Post',
    create_post: 'Create Post',
    post_comment: 'Post Comment',
    create_post_comment: 'Create Post Comment',
    update_post: 'Update Post',
    group: 'Group',
    group_membership: 'Group Membership',
    event: 'Event',
    event_participant: 'Event Participant',
    event_invitation: 'Event Invitation',
    warning: 'Warning',
    emergency: 'Emergency',
    business: 'Business',
    business_comment: 'Business Comment',
    city: 'City',
    file: 'File',
    image: 'Image',
    invitation: 'Invitation',
    participant: 'Participant',
    membership: 'Membership',
    like: 'Like',
    save: 'Save',
  },
};

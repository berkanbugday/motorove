# Authentication Configuration Guide

## Supabase Refresh Token Expiration Settings

This guide explains how to configure the recommended refresh token expiration settings for the mobile app using Supabase.

### Recommended Settings for Mobile Apps

For mobile applications, the recommended refresh token expiration time is **30-90 days**. This balances security with user experience, as mobile apps typically expect longer session durations than web applications.

### How to Configure Session Settings in Supabase Dashboard

1. Login to your [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Navigate to **Authentication** > **Providers** > **Advanced Settings**
4. Configure the following settings:

   #### Session Settings

   - **JWT Expiry**: Set to 1 hour (3600 seconds) - This is the access token lifetime
   - **Time-box user sessions**: Enable and set to 60 days for mobile applications
   - **Inactivity timeout**: Enable and set to 14 days (recommended for mobile)
   - **Single session per user**: Disable this for mobile apps as they typically need multiple sessions

   ![Supabase Auth Settings](https://raw.githubusercontent.com/supabase/supabase/master/apps/reference/static/img/auth-session-expiry-configuration.png)

### Implementation in Our Codebase

Our authentication system utilizes these Supabase settings automatically:

1. Our backend (`apps/backend/src/auth/supabase.service.ts`) handles token refresh operations through the Supabase client.
2. The mobile app (`apps/mobile/src/services/auth.service.ts`) implements token refresh logic that automatically refreshes expired tokens.

### Testing Your Configuration

To verify your settings are applied correctly:

1. Sign in to the mobile app
2. Check the token expiration by inspecting the `session.expires_at` value
3. Ensure the app can successfully refresh tokens after the JWT expiry time (1 hour)
4. Verify that sessions expire after the configured time-box duration (60 days) or inactivity timeout

### Security Considerations

- Token rotation: Our implementation already handles refresh token rotation on each use
- Token storage: The mobile app securely stores tokens using `EncryptedStorage`
- Revocation: Users can sign out to immediately invalidate their sessions

### Troubleshooting

If you encounter authentication issues:

1. Check that the Supabase configuration in your environment matches the production settings
2. Verify the token refresh logic in the mobile app is working correctly
3. Look for errors in the `refreshToken()` method of both the backend and mobile app services

For additional questions, refer to the [Supabase Auth documentation](https://supabase.com/docs/guides/auth/sessions).

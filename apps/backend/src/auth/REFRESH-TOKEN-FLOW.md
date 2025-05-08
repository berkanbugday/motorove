# Refresh Token Flow

This document illustrates how refresh tokens work in our application architecture.

## Token Lifecycle Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │         │              │         │              │
│  Mobile App  │◀────────▶    Backend   │◀────────▶   Supabase   │
│              │         │              │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       │                        │                        │
       │  1. User Login         │                        │
       │───────────────────────▶│                        │
       │                        │  2. Auth Request       │
       │                        │───────────────────────▶│
       │                        │                        │
       │                        │  3. Return Tokens      │
       │                        │◀───────────────────────│
       │  4. Return Tokens      │                        │
       │◀───────────────────────│                        │
       │                        │                        │
       │  Store tokens:         │                        │
       │  - access_token        │                        │
       │  - refresh_token       │                        │
       │  - expires_at          │                        │
       │                        │                        │
       │                        │                        │
       │  5. API Request with   │                        │
       │     Access Token       │                        │
       │───────────────────────▶│                        │
       │                        │  6. Validate Token     │
       │                        │───────────────────────▶│
       │                        │                        │
       │                        │  7. Token Valid        │
       │                        │◀───────────────────────│
       │  8. API Response       │                        │
       │◀───────────────────────│                        │
       │                        │                        │
       │           ...Time passes...                     │
       │                        │                        │
       │  9. Before token       │                        │
       │     expires, refresh   │                        │
       │───────────────────────▶│                        │
       │                        │  10. Refresh Request   │
       │                        │───────────────────────▶│
       │                        │                        │
       │                        │  11. New Tokens        │
       │                        │◀───────────────────────│
       │  12. New Tokens        │                        │
       │◀───────────────────────│                        │
       │                        │                        │
       │  Update stored tokens: │                        │
       │  - new access_token    │                        │
       │  - new refresh_token   │                        │
       │  - new expires_at      │                        │
       │                        │                        │
       │                        │                        │
       │                        │                        │
```

## Token Expiration Configuration

Our recommended settings for mobile applications:

1. **Access Token (JWT) Expiration:** 1 hour

   - Short-lived for security
   - JWT contains user claims needed for authentication

2. **Refresh Token Settings:**
   - **Maximum Session Duration:** 60 days
   - **Inactivity Timeout:** 14 days
   - **Token Rotation:** Enabled (each refresh generates a new token pair)

## Token Storage

1. **Mobile App:**

   - Access Token: Stored in `EncryptedStorage`
   - Refresh Token: Stored in `EncryptedStorage`
   - Expiration Time: Stored alongside tokens

2. **Backend:**
   - No token storage (stateless JWT verification)
   - Relies on Supabase for token validation and management

## Refresh Token Flow Steps

1. User logs in with email/password
2. Backend authenticates with Supabase
3. Supabase returns access and refresh tokens
4. Tokens are stored securely in the mobile app
5. App uses access token for API requests
6. Before access token expires, app proactively refreshes
7. New token pair is received and stored
8. Old refresh token becomes invalid

## Security Considerations

- Refresh tokens are used only once (token rotation)
- Tokens are stored in encrypted storage on mobile
- Inactivity timeout ensures unused sessions expire
- Maximum session duration provides absolute time limit
- Backend validates tokens with Supabase on every request

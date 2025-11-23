# Authentication Module

## Overview

This module provides minimal authentication functionality for the Motorove backend. The authentication process is primarily handled by Supabase on the client side (mobile app), and this module only provides:

1. **Password Update** - Allows users to update their password
2. **User Validation** - Validates JWT tokens and returns user IDs (used by guards)

## Architecture

### Services

#### AuthService

- `validateUser(token: string): Promise<string>` - Validates a Supabase JWT token and returns the user ID
- `updatePassword(token: string, newPassword: string): Promise<boolean>` - Updates user password using Supabase

#### SupabaseService

Minimal Supabase client wrapper with only essential methods:

- `getClient(): SupabaseClient` - Returns the Supabase client instance
- `getUser(jwt: string)` - Validates JWT token and returns user data
- `updatePassword(token: string, newPassword: string)` - Updates user password (supports both JWT and reset tokens)

### Controllers

#### AuthController

REST endpoint for password updates:

- `POST /auth/update-password` - Updates user password

### Guards

#### JwtGuard

Protects routes by validating Supabase JWT tokens using `AuthService.validateUser()`

## Authentication Flow

### Client-Side Authentication (Mobile App)

1. User signs up/signs in directly with Supabase client
2. Supabase returns JWT access token and refresh token
3. Mobile app stores tokens securely
4. Mobile app includes access token in GraphQL/REST requests

### Backend Token Validation

1. JwtGuard intercepts protected requests
2. Extracts JWT token from Authorization header
3. Calls `AuthService.validateUser(token)`
4. Returns user ID if valid, throws UnauthorizedException if invalid

### Password Update Flow

1. User requests password update (authenticated or via reset email)
2. Client calls `POST /auth/update-password` with token and new password
3. Token can be either:
   - JWT access token (for authenticated users)
   - Password reset token hash (from reset email)
4. Supabase updates the password
5. Returns success/failure response

## Environment Variables

Required environment variables:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for admin operations

## Security

- All authentication is handled by Supabase's battle-tested auth system
- JWT tokens are validated on every protected request
- Password updates require valid tokens (access token or reset token)
- Service role key is used only for server-side operations

## Notes

- This module does NOT handle sign up, sign in, or token refresh - those are handled client-side with Supabase
- The mobile app manages its own authentication state and token refresh
- Backend only validates tokens and provides password update functionality
- All user management (creation, updates, etc.) is handled by other modules (users, user-settings, etc.)

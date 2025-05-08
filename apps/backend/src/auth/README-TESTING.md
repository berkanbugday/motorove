# Testing Authentication Token Expiration

This guide provides instructions for testing the Supabase refresh token configuration in development.

## Prerequisites

- Access to the Supabase dashboard for your project
- Mobile app running on a device or simulator
- Backend API running locally or deployed

## 1. Verify Supabase Configuration

First, ensure your Supabase project has the correct settings:

```bash
# You can use the Supabase CLI to verify settings (install if needed)
npm install -g supabase

# Login to Supabase
supabase login

# Check auth configuration (replace PROJECT_ID with your actual project ID)
supabase projects inspect PROJECT_ID --auth
```

Alternatively, verify through the dashboard that these settings match our recommendations:

- JWT Expiry: 3600 seconds (1 hour)
- Session timeboxing: 60 days
- Inactivity timeout: 14 days

## 2. Test Token Refresh Flow

### Simulate Access Token Expiration

To test the token refresh mechanism without waiting for actual expiration, you can:

1. Add a temporary test endpoint to the backend:

```typescript
// In apps/backend/src/auth/auth.controller.ts
@Get('test-token-refresh')
async testTokenRefresh(@Headers('authorization') authHeader: string) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Invalid authentication');
  }

  // Extract token and force a refresh
  const token = authHeader.split(' ')[1];

  // Get current token from request and test refresh
  try {
    const refreshToken = await this.prismaService.refreshToken.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!refreshToken) {
      return { status: 'error', message: 'No refresh token found' };
    }

    const result = await this.authService.refreshToken(refreshToken.token);
    return {
      status: 'success',
      message: 'Token refreshed successfully',
      oldTokenExpiry: refreshToken.expiresAt,
      newTokenExpiry: result.session.expires_at
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Token refresh failed: ${error.message}`
    };
  }
}
```

2. Add a test button in the mobile app to trigger the flow:

```typescript
// In a development screen of the mobile app
const testTokenRefresh = async () => {
  try {
    const currentToken = await authService.getAccessToken();

    // Call the test endpoint
    const response = await fetch('http://your-api/auth/test-token-refresh', {
      headers: {
        Authorization: `Bearer ${currentToken}`
      }
    });

    const result = await response.json();
    console.log('Token refresh test:', result);

    // Verify the session was updated
    const currentState = await authService.getAuthState();
    console.log('Current session expiry:', new Date(currentState.expiresAt));
  } catch (error) {
    console.error('Token refresh test failed:', error);
  }
};

// Add a button to the UI
<Button title="Test Token Refresh" onPress={testTokenRefresh} />
```

## 3. Verify Session Expiration

To test that sessions expire after the configured timeout:

1. Sign in on the mobile app
2. Note the current time
3. Keep the app unused for longer than the inactivity timeout (14 days)
4. Try to perform an authenticated action
5. Verify that the app attempts to refresh the token but fails
6. Confirm the user is redirected to sign in again

## 4. Use Session Debug Tools

For easier development testing, create a debug screen:

```typescript
// In a development screen
const SessionDebugScreen = () => {
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const loadSessionInfo = async () => {
    const token = await authService.getAccessToken();
    const refreshToken = await EncryptedStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const authState = await authService.getAuthState();

    setSessionInfo({
      accessToken: token ? `${token.substring(0, 10)}...` : 'None',
      refreshToken: refreshToken ? 'Present' : 'None',
      expiresAt: authState.expiresAt ? new Date(authState.expiresAt).toLocaleString() : 'Unknown',
      timeUntilExpiry: authState.expiresAt ?
        Math.floor((authState.expiresAt - Date.now()) / 1000 / 60) + ' minutes' :
        'Unknown'
    });
  };

  return (
    <View>
      <Button title="Load Session Info" onPress={loadSessionInfo} />
      {sessionInfo && (
        <View>
          <Text>Access Token: {sessionInfo.accessToken}</Text>
          <Text>Refresh Token: {sessionInfo.refreshToken}</Text>
          <Text>Expires At: {sessionInfo.expiresAt}</Text>
          <Text>Time Until Expiry: {sessionInfo.timeUntilExpiry}</Text>
        </View>
      )}
      <Button title="Force Token Refresh" onPress={() => authService.refreshToken()} />
    </View>
  );
};
```

## 5. Monitor Token Usage in Production

For production environments, consider implementing:

1. Logging of token refresh operations (success/failure)
2. Monitoring of session durations
3. Alerts for unusual token refresh patterns that might indicate security issues

## Conclusion

By following these testing procedures, you can verify that your Supabase authentication configuration is working correctly with the recommended 60-day session expiration and 14-day inactivity timeout for mobile applications.

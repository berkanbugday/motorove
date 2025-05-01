# Authentication System

This directory contains the authentication services for the mobile app.

## Setup

1. Install dependencies:

   ```bash
   pnpm add @react-native-async-storage/async-storage axios @apollo/client graphql
   ```

2. Create a `.env` file in the root directory with the following variables:

   ```
   # API Configuration
   API_URL=http://localhost:3000
   ```

3. Set up environment variables in your project by following the React Native setup for environment variables (using react-native-dotenv or similar).

## Usage

The authentication system is integrated with the app via the `AuthProvider` in `src/contexts/AuthContext.tsx`.

```tsx
import {useAuth} from '@contexts/AuthContext';

function MyComponent() {
  const {user, signIn, signUp, signOut, accessToken, isLoading} = useAuth();

  // Use authentication functions as needed
}
```

## Available Methods

- `signIn(email, password)`: Sign in with email and password
- `signUp(email, password, firstName, lastName)`: Register a new user
- `signOut()`: Sign out the current user
- `isAuthenticated()`: Check if the user is authenticated
- `getAuthState()`: Get the current authentication state
- `getCurrentUser()`: Get the currently authenticated user
- `refreshToken()`: Refresh the authentication token

## Authentication Flow

1. User signs up or logs in using the provided forms
2. Authentication state is stored in secure storage (AsyncStorage)
3. API requests automatically include the authentication token
4. Token is refreshed automatically when needed (60 seconds before expiration)
5. On logout, all authentication data is cleared

## GraphQL Integration

The authentication service uses Apollo Client to communicate with the GraphQL backend. The GraphQL operations are defined in `src/services/graphql/auth.graphql.ts`.

### GraphQL Operations

- `SIGN_UP`: Mutation to register a new user
- `SIGN_IN`: Mutation to authenticate a user
- `REFRESH_TOKEN`: Mutation to refresh an authentication token
- `GET_CURRENT_USER`: Query to get the current user's profile

### Apollo Client Configuration

Apollo Client is configured in `src/configs/apollo.ts` and includes:

- HTTP link pointing to the GraphQL endpoint
- Authentication link to add the token to requests
- Error handling for GraphQL and network errors

## Integration with Backend

The authentication service connects to our NestJS GraphQL backend for all authentication operations. The mobile app uses Apollo Client to communicate with the backend.

### Required Backend GraphQL Mutations

The backend should provide the following GraphQL mutations:

- `signUp(signUpInput: SignUpInput!)`: Register a new user
- `signIn(signInInput: SignInInput!)`: Authenticate a user
- `refreshToken(token: String!)`: Refresh an authentication token

### Security Considerations

- All sensitive data is only stored temporarily in the mobile app
- Tokens are automatically refreshed to maintain session security
- Tokens are stored in AsyncStorage which is not secure for highly sensitive applications
  - For higher security, consider using a keychain-based storage solution

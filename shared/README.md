# Motorove Shared

This package contains shared types, interfaces, DTOs, and enums for the Motorove application. These types are used by both the backend (NestJS) and mobile (React Native) applications to ensure type consistency across the stack.

## Structure

- `/interfaces` - Contains TypeScript interfaces for data models
- `/dto` - Contains Data Transfer Objects (DTOs) that implement the interfaces
- `/enums` - Contains shared enums used across the application

## Usage

### Backend (NestJS)

To use these shared types in the backend application:

```typescript
import { IUser, UserDto, GroupPrivacy } from "@motorove/shared";

// Use interfaces for type definitions
const user: IUser = {
  // ...properties
};

// Use DTOs for data transformation
const userDto = new UserDto(user);

// Use enums for type-safe values
if (group.privacy === GroupPrivacy.PUBLIC) {
  // ...
}
```

### Mobile (React Native)

To use these shared types in the mobile application:

```typescript
import { IUser, UserDto, GroupPrivacy } from "@motorove/shared";

// Use interfaces for type definitions
const user: IUser = {
  // ...properties
};

// Use DTOs for data transformation
const userDto = new UserDto(user);

// Use enums in conditions
if (group.privacy === GroupPrivacy.PUBLIC) {
  // ...
}
```

## Development

To add new types:

1. Create the interface in `/interfaces`
2. Create the DTO in `/dto` that implements the interface
3. Update the respective `index.ts` file to export the new types

For enums:

1. Create the enum in `/enums`
2. Update `enums/index.ts` to export the new enum

## Build

To build the package:

```
cd shared
pnpm install
pnpm build
```

# Motorove Shared

Shared TypeScript types, interfaces, and enums for the Motorove monorepo. Used by backend, mobile, and landing page applications.

## 🚀 Quick Start

```bash
# From monorepo root
pnpm build:shared

# Or from shared directory
cd shared
pnpm build
```

## 🏗️ Structure

```
shared/
├── enums/           # Shared enums (33 files)
├── interfaces/      # TypeScript interfaces (20+ domains)
├── utils/           # Utility functions
├── index.ts         # Main exports
└── package.json
```

## 📦 Available Enums

### User & Social

| Enum              | Values                                                              |
| ----------------- | ------------------------------------------------------------------- |
| `Gender`          | MALE, FEMALE, OTHER                                                 |
| `Language`        | EN, TR                                                              |
| `ExperienceLevel` | BEGINNER, INTERMEDIATE, ADVANCED, EXPERT                            |
| `RidingStyle`     | CRUISER, SPORT, TOURING, ADVENTURE, COMMUTER, OFF_ROAD              |
| `Interest`        | TOURING, RACING, CUSTOMIZATION, RESTORATION, MECHANICS, PHOTOGRAPHY |
| `ApprovalStatus`  | PENDING, ACCEPTED, REJECTED                                         |

### Groups & Events

| Enum                     | Values                                                                |
| ------------------------ | --------------------------------------------------------------------- |
| `GroupPrivacy`           | PUBLIC, PRIVATE, SECRET                                               |
| `GroupMemberRole`        | OWNER, ADMIN, MODERATOR, MEMBER                                       |
| `GroupTag`               | SPORT, CRUISER, TOURING, ADVENTURE, VINTAGE, CUSTOM, CAFE_RACER, etc. |
| `EventStatus`            | UPCOMING, ONGOING, COMPLETED, CANCELLED                               |
| `EventType`              | RIDE, MEETUP, WORKSHOP, CHARITY, RALLY, TOUR, RACE, EXHIBITION        |
| `EventParticipantStatus` | JOINED, LEFT, KICKED                                                  |
| `DifficultyLevel`        | EASY, MODERATE, HARD                                                  |
| `RoadType`               | HIGHWAY, CITY, MOUNTAIN, COASTAL                                      |

### Business

| Enum               | Values                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| `BusinessCategory` | SALES, DEALERSHIP, REPAIR, MAINTENANCE, PARTS_STORE, ACCESSORIES, RENTAL, TOWING, etc. (32 categories) |
| `BusinessStatus`   | OPEN, CLOSED, TEMPORARILY_CLOSED                                                                       |
| `DayOfWeek`        | MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY                                         |
| `Currency`         | USD, EUR, TRY, GBP, etc.                                                                               |

### Safety & Location

| Enum               | Values                                                      |
| ------------------ | ----------------------------------------------------------- |
| `WarningType`      | ROAD_HAZARD, ACCIDENT, WEATHER, POLICE, CONSTRUCTION, OTHER |
| `EmergencyType`    | ACCIDENT, BREAKDOWN, MEDICAL, THEFT, OTHER                  |
| `AddressType`      | HOME, WORK, EVENT_MEETING_LOCATION, BUSINESS_LOCATION       |
| `WeatherCondition` | CLEAR, CLOUDY, RAIN, SNOW, FOG, STORM, etc.                 |

### Notifications & Moderation

| Enum                  | Values                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `NotificationType`    | FOLLOW_REQUEST, FOLLOW_ACCEPTED, POST_LIKE, POST_COMMENT, GROUP_INVITE, EVENT_INVITE, WARNING, EMERGENCY, etc. |
| `NotificationChannel` | PUSH, EMAIL, SMS, IN_APP                                                                                       |
| `NotificationStatus`  | SENT, DELIVERED, READ, FAILED                                                                                  |
| `ReportReason`        | SPAM, HARASSMENT, INAPPROPRIATE, VIOLENCE, MISINFORMATION, OTHER                                               |
| `ReportStatus`        | PENDING, REVIEWED, RESOLVED                                                                                    |
| `ModerationAction`    | WARN, MUTE, BAN, DELETE                                                                                        |

### Content & Equipment

| Enum                  | Values                                                  |
| --------------------- | ------------------------------------------------------- |
| `ContentType`         | POST, COMMENT, GROUP, EVENT, USER, BUSINESS             |
| `EquipmentType`       | HELMET, JACKET, GLOVES, BOOTS, PANTS, SUIT, ARMOR, etc. |
| `SocialMediaPlatform` | FACEBOOK, INSTAGRAM, TWITTER, YOUTUBE, TIKTOK           |
| `SupportCategory`     | TECHNICAL, ACCOUNT, BILLING, FEEDBACK, OTHER            |

## 📋 Available Interfaces

### Core Entities

| Interface           | Description                       |
| ------------------- | --------------------------------- |
| `IUser`             | User profile with motorcycle info |
| `IPost`             | Social posts with media           |
| `IPostComment`      | Post comments                     |
| `IGroup`            | Riding groups                     |
| `IGroupMembership`  | Group membership                  |
| `IEvent`            | Events and group rides            |
| `IEventInvitation`  | Event invitations                 |
| `IEventParticipant` | Event participants                |

### Location & Business

| Interface          | Description           |
| ------------------ | --------------------- |
| `IBusiness`        | Motorcycle businesses |
| `IBusinessComment` | Business reviews      |
| `IWarning`         | Road hazard warnings  |
| `IEmergency`       | Emergency reports     |
| `ICity`            | City data             |
| `IAddress`         | Address information   |

### Social & Settings

| Interface        | Description          |
| ---------------- | -------------------- |
| `IUserFollowing` | Follow relationships |
| `IUserBlock`     | User blocks          |
| `IUserSetting`   | User preferences     |
| `INotification`  | Push notifications   |
| `IContentReport` | Content reports      |
| `ISupport`       | Support tickets      |

### Common

| Interface            | Description                              |
| -------------------- | ---------------------------------------- |
| `IBaseModel`         | Base model with id, createdAt, updatedAt |
| `IPaginatedResponse` | Paginated API responses                  |
| `ICoordinates`       | Latitude/longitude                       |
| `IDateRange`         | Start/end dates                          |

## 💡 Usage

### Backend (NestJS)

```typescript
import { IUser, GroupPrivacy, NotificationType } from "@motorove/shared";

// Type-safe user
const user: IUser = {
  id: "123",
  email: "rider@motorove.com",
  fullName: "John Rider",
  // ...
};

// Type-safe enum usage
if (group.privacy === GroupPrivacy.PUBLIC) {
  // ...
}
```

### Mobile (React Native)

```typescript
import { IPost, EventStatus, WarningType } from "@motorove/shared";

// Type-safe post
const post: IPost = {
  id: "456",
  content: "Great ride today!",
  // ...
};

// Type-safe enum usage
if (event.status === EventStatus.UPCOMING) {
  // ...
}
```

### Landing (Next.js)

```typescript
import { Language, RidingStyle } from "@motorove/shared";

// Type-safe language
const currentLang: Language = Language.EN;
```

## 🔧 Development

### Adding New Enums

1. Create file in `/enums` (e.g., `my-enum.enum.ts`)
2. Export from `/enums/index.ts`

```typescript
// enums/my-enum.enum.ts
export enum MyEnum {
  VALUE_ONE = "VALUE_ONE",
  VALUE_TWO = "VALUE_TWO",
}

// enums/index.ts
export * from "./my-enum.enum";
```

### Adding New Interfaces

1. Create directory in `/interfaces` (e.g., `/interfaces/my-entity/`)
2. Create interface file (e.g., `my-entity.interface.ts`)
3. Create index file to export
4. Export from `/interfaces/index.ts`

```typescript
// interfaces/my-entity/my-entity.interface.ts
import { IBaseModel } from "../common";

export interface IMyEntity extends IBaseModel {
  name: string;
  // ...
}

// interfaces/my-entity/index.ts
export * from "./my-entity.interface";

// interfaces/index.ts
export * from "./my-entity";
```

## 📦 Build

```bash
# Build package
pnpm build

# Watch mode
pnpm dev

# Clean
pnpm clean
```

## 📦 Monorepo Integration

This package is consumed by:

```
motorove/
├── apps/
│   ├── backend/          # @motorove/shared
│   ├── mobile/           # @motorove/shared
│   └── landing/          # @motorove/shared
└── shared/               # This package
```

All apps import from `@motorove/shared` via workspace linking.

---

**Made with ❤️ for the motorcycle community**

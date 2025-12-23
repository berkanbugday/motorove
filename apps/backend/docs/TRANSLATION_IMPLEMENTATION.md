# Error Message Translation Implementation

This document describes the implementation of error message translation based on user's preferred language in the backend.

## Overview

All hardcoded error messages have been replaced with translation keys that are automatically translated based on the user's preferred language setting. The system uses i18next for translation management and a custom exception filter to handle translations.

### Key Features

- **Automatic Translation**: Error messages are translated based on user's `preferredLanguage` setting
- **Resource Translation**: Resource parameters (e.g., `resource: 'warning'`) are automatically translated
- **Interpolation Support**: Dynamic values can be interpolated into translated messages
- **Fallback Handling**: Falls back to Turkish (TR) if user language is unavailable
- **Backward Compatible**: Existing HttpException instances still work

## Architecture

### Components

1. **TranslatedException** (`apps/backend/src/core/exceptions/translated-exception.ts`)

   - Custom exception class that extends `HttpException`
   - Supports translation keys and interpolation values
   - Used for all user-facing errors

2. **ExceptionHelper** (`apps/backend/src/core/exceptions/exception-helper.service.ts`)

   - Helper service with convenient static methods for throwing translated exceptions
   - Methods: `badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `conflict()`

3. **GraphqlExceptionFilter** (`apps/backend/src/core/filters/graphql-exception.filter.ts`)

   - Modified to automatically translate error messages based on user's preferred language
   - Extracts user's preferred language from the request context
   - Falls back to Turkish (TR) if no user is available
   - Automatically translates resource parameters before message interpolation
   - Includes `translateResourceValues()` method to handle resource translation

4. **Translation Files** (`apps/backend/src/core/i18n/locales/`)
   - `en.ts` - English translations
   - `tr.ts` - Turkish translations
   - All error messages are organized under the `errors` namespace
   - Resource names are organized under the `resources` namespace for automatic translation

## Usage

### Throwing Translated Exceptions

Instead of:

```typescript
throw new NotFoundException('User not found');
```

Use:

```typescript
ExceptionHelper.notFound('errors.user.not_found');
```

### With Interpolation Values

```typescript
ExceptionHelper.notFound('errors.post.not_found', { id: postId });
```

### With Resource Translation

Resource parameters are automatically translated based on user's preferred language:

```typescript
// English: "Failed to create Warning"
// Turkish: "Uyarı oluşturulamadı"
ExceptionHelper.badRequest('errors.common.failed_to_create', {
  resource: 'warning',
});

// English: "Comment already exists"
// Turkish: "Yorum zaten mevcut"
ExceptionHelper.conflict('errors.common.already_exists', {
  resource: 'comment',
});
```

The `resource` parameter will be automatically translated using the `resources` namespace in translation files.

### Custom Status Code

```typescript
ExceptionHelper.throw('errors.custom.error_key', HttpStatus.BAD_REQUEST, {
  value: 'test',
});
```

## Translation Keys Structure

All error translation keys follow this structure:

```
errors.{category}.{error_name}
```

Examples:

- `errors.auth.user_not_found`
- `errors.post.not_found`
- `errors.common.forbidden`

### Resource Translation Keys

Resource names for translation follow this structure:

```
resources.{resource_name}
```

Examples:

- `resources.warning` → "Warning" (EN) / "Uyarı" (TR)
- `resources.comment` → "Comment" (EN) / "Yorum" (TR)
- `resources.emergency` → "Emergency" (EN) / "Acil Durum" (TR)

When you pass `resource: 'warning'` in translation values, it will automatically be translated to the appropriate language.

## Adding New Error Messages

1. Add the translation key to both `en.ts` and `tr.ts`:

```typescript
// en.ts
errors: {
  new_category: {
    new_error: 'Error message in English',
  },
}

// tr.ts
errors: {
  new_category: {
    new_error: 'Türkçe hata mesajı',
  },
}
```

2. Use the translation key in your code:

```typescript
ExceptionHelper.badRequest('errors.new_category.new_error');
```

### Adding New Resource Translations

If you need to add a new resource type for translation:

1. Add the resource to both `en.ts` and `tr.ts`:

```typescript
// en.ts
resources: {
  new_resource: 'New Resource',
}

// tr.ts
resources: {
  new_resource: 'Yeni Kaynak',
}
```

2. Use it in your error messages:

```typescript
ExceptionHelper.badRequest('errors.common.failed_to_create', {
  resource: 'new_resource',
});
```

The resource will be automatically translated based on the user's preferred language.

## Migration Status

### Completed ✅

- ✅ Auth service and guards
- ✅ Auth controller
- ✅ Users service
- ✅ Posts service
- ✅ Post comments service
- ✅ Groups service
- ✅ Group memberships service
- ✅ Events service
- ✅ Event participants/invitations service
- ✅ Warnings service
- ✅ Emergencies service
- ✅ Businesses service
- ✅ Business comments service
- ✅ Cities service
- ✅ User followings service
- ✅ User settings service
- ✅ Storage service and controller
- ✅ Translation infrastructure
- ✅ Exception filter with translation support
- ✅ Resource translation system

### Migration Pattern

For each service:

1. Import `ExceptionHelper`:

```typescript
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
```

2. Replace hardcoded exceptions:

```typescript
// Before
throw new NotFoundException('Resource not found');
throw new NotFoundException(`Resource with ID ${id} not found`);
throw new ForbiddenException('You cannot perform this action');

// After
ExceptionHelper.notFound('errors.resource.not_found');
ExceptionHelper.notFound('errors.resource.not_found_with_id', { id });
ExceptionHelper.forbidden('errors.resource.cannot_perform_action', {
  action: 'delete',
});
```

3. Ensure translation keys exist in both `en.ts` and `tr.ts`

## Testing

When testing, ensure:

1. Error messages are translated based on user's preferred language
2. Fallback to Turkish works when user is not authenticated
3. Interpolation values are correctly replaced in translated messages
4. Resource parameters are automatically translated (e.g., `resource: 'warning'` → "Warning" / "Uyarı")
5. Original error behavior is preserved (status codes, etc.)

### Testing Resource Translation

To verify resource translation works correctly:

```typescript
// Test with English user
ExceptionHelper.badRequest('errors.common.failed_to_create', {
  resource: 'warning',
});
// Expected: "Failed to create Warning"

// Test with Turkish user
ExceptionHelper.badRequest('errors.common.failed_to_create', {
  resource: 'warning',
});
// Expected: "Uyarı oluşturulamadı"
```

## How Resource Translation Works

The resource translation system works automatically in the exception filter:

1. **Exception is thrown** with a `resource` parameter:

   ```typescript
   ExceptionHelper.badRequest('errors.common.failed_to_create', {
     resource: 'warning',
   });
   ```

2. **Exception filter intercepts** the exception and extracts the user's preferred language

3. **Resource translation** happens in `translateResourceValues()`:

   - Checks if `translationValues.resource` exists and is a string
   - Constructs resource key: `resources.warning`
   - Translates the resource: `'warning'` → `'Warning'` (EN) or `'Uyarı'` (TR)
   - Replaces the original resource value with the translated one

4. **Message interpolation** uses the translated resource:

   - Original: `"Failed to create {{resource}}"`
   - With translated resource: `"Failed to create Warning"` (EN) or `"Uyarı oluşturulamadı"` (TR)

5. **Final translated message** is returned to the client

## Notes

- The system automatically detects if a message is a translation key (starts with `errors.`)
- Resource parameters (e.g., `resource: 'warning'`) are automatically translated using the `resources` namespace
- Resource translation happens **before** message interpolation, ensuring the resource is translated before being inserted into the error message
- If translation fails, the original message/key is returned as fallback
- User's preferred language is extracted from `req.user.preferredLanguage` in the GraphQL context
- The translation system is backward compatible - old HttpException instances will still work but won't be translated unless they use translation keys
- Resource translation happens automatically in the exception filter - no additional code needed in services

## Available Resources

The following resources are available for translation:

- `user` - User / Kullanıcı
- `post` - Post / Gönderi
- `comment` - Comment / Yorum
- `group` - Group / Grup
- `event` - Event / Etkinlik
- `warning` - Warning / Uyarı
- `emergency` - Emergency / Acil Durum
- `business` - Business / İşletme
- `city` - City / Şehir
- `file` - File / Dosya
- `image` - Image / Resim
- `invitation` - Invitation / Davetiye
- `participant` - Participant / Katılımcı
- `membership` - Membership / Üyelik
- `like` - Like / Beğeni
- `save` - Save / Kayıt

To add more resources, add them to the `resources` section in both `en.ts` and `tr.ts` translation files.
